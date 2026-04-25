from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import secrets
from app.services.supabase import get_supabase
from app.auth import get_user_id

router = APIRouter(prefix="/api/v1/connectors", tags=["connectors"])


class CreateConnectorRequest(BaseModel):
    name: str


@router.get("")
async def list_connectors(user_id: str = Depends(get_user_id)):
    sb = get_supabase()
    result = (
        sb.table("connectors")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


@router.post("", status_code=201)
async def create_connector(
    body: CreateConnectorRequest,
    user_id: str = Depends(get_user_id),
):
    sb = get_supabase()
    result = sb.table("connectors").insert({
        "user_id": user_id,
        "name": body.name,
        "type": "webhook",
        "webhook_secret": secrets.token_urlsafe(32),
    }).execute()
    return result.data[0]


@router.delete("/{connector_id}", status_code=204)
async def delete_connector(
    connector_id: str,
    user_id: str = Depends(get_user_id),
):
    sb = get_supabase()
    result = (
        sb.table("connectors")
        .select("id")
        .eq("id", connector_id)
        .eq("user_id", user_id)
        .maybe_single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Connector not found")
    sb.table("connectors").delete().eq("id", connector_id).execute()
