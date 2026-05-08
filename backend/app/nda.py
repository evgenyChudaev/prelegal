from typing import Literal

from pydantic import BaseModel


class NDAFields(BaseModel):
    """Fields for a Mutual NDA. All optional during chat — populated as the conversation progresses."""

    purpose: str | None = None
    effectiveDate: str | None = None
    mndaTermType: Literal["expires", "until-terminated"] | None = None
    mndaTermYears: int | None = None
    confidentialityTermType: Literal["years", "perpetual"] | None = None
    confidentialityTermYears: int | None = None
    governingLaw: str | None = None
    jurisdiction: str | None = None
    modifications: str | None = None
    party1Name: str | None = None
    party1Title: str | None = None
    party1Company: str | None = None
    party1Address: str | None = None
    party2Name: str | None = None
    party2Title: str | None = None
    party2Company: str | None = None
    party2Address: str | None = None


REQUIRED_FIELDS: tuple[str, ...] = (
    "party1Name",
    "party1Title",
    "party1Company",
    "party1Address",
    "party2Name",
    "party2Title",
    "party2Company",
    "party2Address",
    "governingLaw",
    "jurisdiction",
)


def is_complete(fields: NDAFields) -> bool:
    data = fields.model_dump()
    return all(data.get(name) for name in REQUIRED_FIELDS)
