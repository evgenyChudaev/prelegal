import os
from datetime import date

from litellm import completion
from pydantic import BaseModel

from app.documents import UniversalDocFields, get_system_prompt, is_complete

MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}


class ChatLLMOutput(BaseModel):
    reply: str
    fields: UniversalDocFields
    complete: bool


def call_chat_llm(history: list[dict], current_fields: UniversalDocFields) -> ChatLLMOutput:
    if not os.environ.get("OPENROUTER_API_KEY"):
        raise RuntimeError("OPENROUTER_API_KEY is not set")

    today = date.today().isoformat()
    system_prompt = get_system_prompt(current_fields.documentType, today)
    state_msg = (
        "Fields gathered so far (null values are still missing): "
        + current_fields.model_dump_json()
    )
    messages = [
        {"role": "system", "content": system_prompt},
        *history,
        {"role": "system", "content": state_msg},
    ]

    response = completion(
        model=MODEL,
        messages=messages,
        response_format=ChatLLMOutput,
        reasoning_effort="low",
        extra_body=EXTRA_BODY,
    )
    raw = response.choices[0].message.content
    parsed = ChatLLMOutput.model_validate_json(raw)
    parsed.complete = is_complete(parsed.fields.documentType, parsed.fields)
    return parsed
