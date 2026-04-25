from fastapi import APIRouter, HTTPException, Request
from app.services.supabase import get_supabase
from app.services.ai import summarize_decision

router = APIRouter(prefix="/api/v1/webhook", tags=["webhook"])

CATEGORY_KEYWORDS = {
    "loan": ["loan", "credit", "mortgage", "borrow"],
    "compliance": ["compliance", "aml", "sanction", "watchlist"],
    "transaction": ["transaction", "transfer", "payment", "wire"],
    "risk": ["risk", "score", "fraud", "alert"],
    "kyc": ["kyc", "identity", "verification", "onboard"],
}

STATUS_MAP = {
    "approved": "approved",
    "approve": "approved",
    "rejected": "rejected",
    "reject": "rejected",
    "declined": "rejected",
    "flagged": "flagged",
    "flag": "flagged",
    "pending": "pending",
    "review": "pending",
}


def infer_category(text: str) -> str:
    lower = text.lower()
    for cat, keywords in CATEGORY_KEYWORDS.items():
        if any(k in lower for k in keywords):
            return cat
    return "other"


def infer_status(payload: dict) -> str:
    raw = str(payload.get("status", "")).lower()
    return STATUS_MAP.get(raw, "pending")


@router.post("/{connector_id}")
async def ingest_webhook(connector_id: str, request: Request):
    sb = get_supabase()

    connector_result = (
        sb.table("connectors")
        .select("id, user_id, webhook_secret")
        .eq("id", connector_id)
        .maybe_single()
        .execute()
    )
    if not connector_result.data:
        raise HTTPException(status_code=404, detail="Connector not found")

    connector = connector_result.data
    payload = await request.json()

    title = (
        payload.get("title")
        or payload.get("name")
        or payload.get("event")
        or "Untitled decision"
    )
    description = payload.get("description") or payload.get("reason")
    status = infer_status(payload)
    category = infer_category(f"{title} {description or ''}")
    amount = payload.get("amount")
    currency = payload.get("currency", "USD")

    ai_summary = None
    try:
        ai_summary = summarize_decision(title, description, payload)
    except Exception:
        pass

    sb.table("decisions").insert({
        "user_id": connector["user_id"],
        "connector_id": connector_id,
        "title": str(title)[:255],
        "description": str(description)[:1000] if description else None,
        "status": status,
        "category": category,
        "amount": float(amount) if amount is not None else None,
        "currency": str(currency).upper()[:3],
        "ai_summary": ai_summary,
        "raw_payload": payload,
    }).execute()

    return {"ok": True}
