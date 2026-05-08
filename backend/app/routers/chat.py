import logging
from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.documents import UniversalDocFields
from app.llm import call_chat_llm

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chat", tags=["chat"])

GREETING = (
    "Hi! I can help you draft a legal agreement. What type of document do you need? "
    "I can help with Mutual NDAs, Cloud Service Agreements, Design Partner Agreements, "
    "Service Level Agreements, Professional Services Agreements, Data Processing Agreements, "
    "Software License Agreements, Partnership Agreements, Pilot Agreements, Business Associate "
    "Agreements, and AI Addendums. If you're not sure, just describe what you need!"
)


class ChatTurn(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatTurn]
    fields: UniversalDocFields = UniversalDocFields()


class ChatResponse(BaseModel):
    reply: str
    fields: UniversalDocFields
    complete: bool


class GreetingResponse(BaseModel):
    reply: str
    fields: UniversalDocFields


@router.get("/greeting", response_model=GreetingResponse)
def greeting() -> GreetingResponse:
    return GreetingResponse(reply=GREETING, fields=UniversalDocFields())


@router.post("/message", response_model=ChatResponse)
def message(req: ChatRequest) -> ChatResponse:
    if not req.messages or req.messages[-1].role != "user":
        raise HTTPException(status_code=400, detail="Last message must be from the user")

    history = [{"role": t.role, "content": t.content} for t in req.messages]

    try:
        result = call_chat_llm(history, req.fields)
    except RuntimeError as exc:
        logger.error("LLM configuration error: %s", exc)
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception:
        logger.exception("LLM call failed")
        raise HTTPException(status_code=502, detail="The chat service is temporarily unavailable.")

    return ChatResponse(reply=result.reply, fields=result.fields, complete=result.complete)
