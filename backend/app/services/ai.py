import anthropic
from app.config import settings

_client: anthropic.Anthropic | None = None


def get_client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        _client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    return _client


def summarize_decision(title: str, description: str | None, payload: dict) -> str:
    client = get_client()
    payload_str = str(payload)[:2000]

    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=200,
        messages=[
            {
                "role": "user",
                "content": (
                    f"Summarize this banking decision in 1-2 plain sentences for a business user. "
                    f"Be concise and factual. Do not use jargon.\n\n"
                    f"Title: {title}\n"
                    f"Description: {description or 'N/A'}\n"
                    f"Data: {payload_str}"
                ),
            }
        ],
    )
    return message.content[0].text.strip()
