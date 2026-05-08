import logging
from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.llm import call_chat_llm
from app.nda import NDAFields

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chat", tags=["chat"])

GREETING = (
    "Hi! I'll help you draft a Mutual NDA. To get started, what's the name and title "
    "of the first signatory, and which company do they represent?"
)


class ChatTurn(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatTurn]
    fields: NDAFields = NDAFields()


class ChatResponse(BaseModel):
    reply: str
    fields: NDAFields
    complete: bool


class GreetingResponse(BaseModel):
    reply: str
    fields: NDAFields


@router.get("/greeting", response_model=GreetingResponse)
def greeting() -> GreetingResponse:
    return GreetingResponse(reply=GREETING, fields=NDAFields())


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
