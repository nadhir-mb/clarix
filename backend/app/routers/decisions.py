from fastapi import APIRouter, Depends, HTTPException, Header
from app.services.supabase import get_supabase
from app.auth import get_user_id

router = APIRouter(prefix="/api/v1/decisions", tags=["decisions"])


@router.get("")
async def list_decisions(
    limit: int = 50,
    user_id: str = Depends(get_user_id),
):
    sb = get_supabase()
    result = (
        sb.table("decisions")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    return result.data


@router.get("/{decision_id}")
async def get_decision(
    decision_id: str,
    user_id: str = Depends(get_user_id),
):
    sb = get_supabase()
    result = (
        sb.table("decisions")
        .select("*")
        .eq("id", decision_id)
        .eq("user_id", user_id)
        .maybe_single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Decision not found")
    return result.data
