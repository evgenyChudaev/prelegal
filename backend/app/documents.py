from dataclasses import dataclass, field
from datetime import date
from typing import Any, Literal

from pydantic import BaseModel


class UniversalDocFields(BaseModel):
    """Fields covering all supported document types. Only relevant fields are populated."""

    documentType: str | None = None

    # Party 1 (role varies: Provider, Licensor, Processor, Covered Entity, Party 1...)
    party1Name: str | None = None
    party1Title: str | None = None
    party1Company: str | None = None
    party1Address: str | None = None

    # Party 2 (role varies: Customer, Licensee, Controller, Business Associate, Party 2...)
    party2Name: str | None = None
    party2Title: str | None = None
    party2Company: str | None = None
    party2Address: str | None = None

    # Common legal fields
    effectiveDate: str | None = None
    governingLaw: str | None = None
    jurisdiction: str | None = None
    modifications: str | None = None

    # Mutual NDA specific
    purpose: str | None = None
    mndaTermType: Literal["expires", "until-terminated"] | None = None
    mndaTermYears: int | None = None
    confidentialityTermType: Literal["years", "perpetual"] | None = None
    confidentialityTermYears: int | None = None

    # Shared service/product fields
    productOrServiceName: str | None = None
    term: str | None = None
    fees: str | None = None

    # Document-type-specific fields
    subscriptionPeriod: str | None = None    # CSA
    paymentTerms: str | None = None          # CSA, PSA
    servicesDescription: str | None = None  # PSA, BAA
    deliverables: str | None = None          # PSA
    uptimeCommitment: str | None = None      # SLA
    responseTime: str | None = None          # SLA
    generalCapAmount: str | None = None      # Pilot
    processingPurposes: str | None = None    # DPA
    dataTypes: str | None = None             # DPA, BAA
    retentionPeriod: str | None = None       # DPA
    licenseType: str | None = None           # Software License
    partnershipPurpose: str | None = None    # Partnership
    revenueSharing: str | None = None        # Partnership
    programDescription: str | None = None   # Design Partner
    evaluationPurposes: str | None = None    # Pilot


@dataclass
class DocTypeInfo:
    name: str
    description: str
    filename: str
    party1_role: str
    party2_role: str
    required_fields: list[str]
    defaults: dict[str, Any] = field(default_factory=dict)
    field_labels: dict[str, str] = field(default_factory=dict)
    optional_fields: list[str] = field(default_factory=list)


SUPPORTED_DOCS: dict[str, DocTypeInfo] = {
    "mutual_nda": DocTypeInfo(
        name="Mutual Non-Disclosure Agreement",
        description="Standard terms for mutual confidentiality obligations.",
        filename="Mutual-NDA.md",
        party1_role="Party 1",
        party2_role="Party 2",
        required_fields=[
            "party1Name", "party1Title", "party1Company", "party1Address",
            "party2Name", "party2Title", "party2Company", "party2Address",
            "governingLaw", "jurisdiction",
        ],
        defaults={
            "purpose": "Evaluating whether to enter into a business relationship with the other party.",
            "mndaTermType": "expires",
            "mndaTermYears": 1,
            "confidentialityTermType": "years",
            "confidentialityTermYears": 1,
            "modifications": "",
        },
        optional_fields=["purpose", "mndaTermType", "mndaTermYears", "confidentialityTermType",
                         "confidentialityTermYears", "modifications"],
        field_labels={
            "party1Name": "Party 1 Name", "party1Title": "Party 1 Title",
            "party1Company": "Party 1 Company", "party1Address": "Party 1 Address",
            "party2Name": "Party 2 Name", "party2Title": "Party 2 Title",
            "party2Company": "Party 2 Company", "party2Address": "Party 2 Address",
            "governingLaw": "Governing Law", "jurisdiction": "Jurisdiction",
            "purpose": "Purpose", "effectiveDate": "Effective Date",
            "mndaTermType": "MNDA Term Type", "mndaTermYears": "MNDA Term (years)",
            "confidentialityTermType": "Confidentiality Term Type",
            "confidentialityTermYears": "Confidentiality Term (years)",
            "modifications": "Modifications",
        },
    ),
    "cloud_service_agreement": DocTypeInfo(
        name="Cloud Service Agreement",
        description="Comprehensive agreement for cloud-based software services.",
        filename="CSA.md",
        party1_role="Provider",
        party2_role="Customer",
        required_fields=[
            "party1Name", "party1Company", "party1Address",
            "party2Name", "party2Company", "party2Address",
            "effectiveDate", "governingLaw", "jurisdiction",
            "productOrServiceName",
        ],
        defaults={"subscriptionPeriod": "1 year"},
        optional_fields=["party1Title", "party2Title", "subscriptionPeriod", "fees", "paymentTerms"],
        field_labels={
            "party1Name": "Provider Name", "party1Title": "Provider Title",
            "party1Company": "Provider Company", "party1Address": "Provider Address",
            "party2Name": "Customer Name", "party2Title": "Customer Title",
            "party2Company": "Customer Company", "party2Address": "Customer Address",
            "effectiveDate": "Effective Date", "governingLaw": "Governing Law",
            "jurisdiction": "Jurisdiction", "productOrServiceName": "Cloud Service Name",
            "subscriptionPeriod": "Subscription Period", "fees": "Fees",
            "paymentTerms": "Payment Terms",
        },
    ),
    "design_partner_agreement": DocTypeInfo(
        name="Design Partner Agreement",
        description="Agreement for early-access design partner programs.",
        filename="design-partner-agreement.md",
        party1_role="Provider",
        party2_role="Partner",
        required_fields=[
            "party1Name", "party1Company", "party1Address",
            "party2Name", "party2Company", "party2Address",
            "effectiveDate", "governingLaw", "jurisdiction",
            "productOrServiceName", "term",
        ],
        defaults={},
        optional_fields=["party1Title", "party2Title", "fees", "programDescription"],
        field_labels={
            "party1Name": "Provider Name", "party1Title": "Provider Title",
            "party1Company": "Provider Company", "party1Address": "Provider Address",
            "party2Name": "Partner Name", "party2Title": "Partner Title",
            "party2Company": "Partner Company", "party2Address": "Partner Address",
            "effectiveDate": "Effective Date", "governingLaw": "Governing Law",
            "jurisdiction": "Jurisdiction", "productOrServiceName": "Product Name",
            "term": "Program Term", "fees": "Fees (if any)",
            "programDescription": "Program Description",
        },
    ),
    "service_level_agreement": DocTypeInfo(
        name="Service Level Agreement",
        description="Agreement defining uptime commitments and service credits.",
        filename="sla.md",
        party1_role="Provider",
        party2_role="Customer",
        required_fields=[
            "party1Name", "party1Company", "party1Address",
            "party2Name", "party2Company", "party2Address",
            "effectiveDate", "governingLaw", "jurisdiction",
            "productOrServiceName", "uptimeCommitment",
        ],
        defaults={},
        optional_fields=["party1Title", "party2Title", "responseTime"],
        field_labels={
            "party1Name": "Provider Name", "party1Company": "Provider Company",
            "party1Address": "Provider Address", "party2Name": "Customer Name",
            "party2Company": "Customer Company", "party2Address": "Customer Address",
            "effectiveDate": "Effective Date", "governingLaw": "Governing Law",
            "jurisdiction": "Jurisdiction", "productOrServiceName": "Service Name",
            "uptimeCommitment": "Uptime Commitment", "responseTime": "Response Time",
        },
    ),
    "professional_services_agreement": DocTypeInfo(
        name="Professional Services Agreement",
        description="Agreement for professional services engagements.",
        filename="psa.md",
        party1_role="Provider",
        party2_role="Customer",
        required_fields=[
            "party1Name", "party1Company", "party1Address",
            "party2Name", "party2Company", "party2Address",
            "effectiveDate", "governingLaw", "jurisdiction",
            "servicesDescription",
        ],
        defaults={},
        optional_fields=["party1Title", "party2Title", "fees", "paymentTerms", "deliverables"],
        field_labels={
            "party1Name": "Provider Name", "party1Company": "Provider Company",
            "party1Address": "Provider Address", "party2Name": "Customer Name",
            "party2Company": "Customer Company", "party2Address": "Customer Address",
            "effectiveDate": "Effective Date", "governingLaw": "Governing Law",
            "jurisdiction": "Jurisdiction", "servicesDescription": "Services Description",
            "fees": "Fees", "paymentTerms": "Payment Terms", "deliverables": "Deliverables",
        },
    ),
    "data_processing_agreement": DocTypeInfo(
        name="Data Processing Agreement",
        description="GDPR-compliant data processing agreement.",
        filename="DPA.md",
        party1_role="Processor",
        party2_role="Controller",
        required_fields=[
            "party1Name", "party1Company", "party1Address",
            "party2Name", "party2Company", "party2Address",
            "effectiveDate", "governingLaw", "jurisdiction",
            "processingPurposes", "dataTypes",
        ],
        defaults={},
        optional_fields=["party1Title", "party2Title", "retentionPeriod"],
        field_labels={
            "party1Name": "Processor Name", "party1Company": "Processor Company",
            "party1Address": "Processor Address", "party2Name": "Controller Name",
            "party2Company": "Controller Company", "party2Address": "Controller Address",
            "effectiveDate": "Effective Date", "governingLaw": "Governing Law",
            "jurisdiction": "Jurisdiction", "processingPurposes": "Processing Purposes",
            "dataTypes": "Data Types", "retentionPeriod": "Retention Period",
        },
    ),
    "software_license_agreement": DocTypeInfo(
        name="Software License Agreement",
        description="Agreement for licensing software to customers.",
        filename="Software-License-Agreement.md",
        party1_role="Licensor",
        party2_role="Licensee",
        required_fields=[
            "party1Name", "party1Company", "party1Address",
            "party2Name", "party2Company", "party2Address",
            "effectiveDate", "governingLaw", "jurisdiction",
            "productOrServiceName", "licenseType",
        ],
        defaults={},
        optional_fields=["party1Title", "party2Title", "fees", "term"],
        field_labels={
            "party1Name": "Licensor Name", "party1Company": "Licensor Company",
            "party1Address": "Licensor Address", "party2Name": "Licensee Name",
            "party2Company": "Licensee Company", "party2Address": "Licensee Address",
            "effectiveDate": "Effective Date", "governingLaw": "Governing Law",
            "jurisdiction": "Jurisdiction", "productOrServiceName": "Software Name",
            "licenseType": "License Type", "fees": "License Fees", "term": "License Term",
        },
    ),
    "partnership_agreement": DocTypeInfo(
        name="Partnership Agreement",
        description="Agreement for business partnerships.",
        filename="Partnership-Agreement.md",
        party1_role="Party 1",
        party2_role="Party 2",
        required_fields=[
            "party1Name", "party1Company", "party1Address",
            "party2Name", "party2Company", "party2Address",
            "effectiveDate", "governingLaw", "jurisdiction",
            "partnershipPurpose",
        ],
        defaults={},
        optional_fields=["party1Title", "party2Title", "revenueSharing", "term"],
        field_labels={
            "party1Name": "Party 1 Name", "party1Company": "Party 1 Company",
            "party1Address": "Party 1 Address", "party2Name": "Party 2 Name",
            "party2Company": "Party 2 Company", "party2Address": "Party 2 Address",
            "effectiveDate": "Effective Date", "governingLaw": "Governing Law",
            "jurisdiction": "Jurisdiction", "partnershipPurpose": "Partnership Purpose",
            "revenueSharing": "Revenue Sharing", "term": "Term",
        },
    ),
    "pilot_agreement": DocTypeInfo(
        name="Pilot Agreement",
        description="Agreement for product pilots and evaluations.",
        filename="Pilot-Agreement.md",
        party1_role="Provider",
        party2_role="Customer",
        required_fields=[
            "party1Name", "party1Company", "party1Address",
            "party2Name", "party2Company", "party2Address",
            "effectiveDate", "governingLaw", "jurisdiction",
            "productOrServiceName", "term",
        ],
        defaults={},
        optional_fields=["party1Title", "party2Title", "fees", "generalCapAmount", "evaluationPurposes"],
        field_labels={
            "party1Name": "Provider Name", "party1Company": "Provider Company",
            "party1Address": "Provider Address", "party2Name": "Customer Name",
            "party2Company": "Customer Company", "party2Address": "Customer Address",
            "effectiveDate": "Effective Date", "governingLaw": "Governing Law",
            "jurisdiction": "Jurisdiction", "productOrServiceName": "Product Name",
            "term": "Pilot Period", "fees": "Fees (if any)",
            "generalCapAmount": "Liability Cap Amount",
            "evaluationPurposes": "Evaluation Purposes",
        },
    ),
    "business_associate_agreement": DocTypeInfo(
        name="Business Associate Agreement",
        description="HIPAA-compliant BAA for business associates.",
        filename="BAA.md",
        party1_role="Covered Entity",
        party2_role="Business Associate",
        required_fields=[
            "party1Name", "party1Company", "party1Address",
            "party2Name", "party2Company", "party2Address",
            "effectiveDate", "governingLaw", "jurisdiction",
            "servicesDescription",
        ],
        defaults={},
        optional_fields=["party1Title", "party2Title", "dataTypes"],
        field_labels={
            "party1Name": "Covered Entity Name", "party1Company": "Covered Entity",
            "party1Address": "Covered Entity Address", "party2Name": "Business Associate Name",
            "party2Company": "Business Associate Company", "party2Address": "Business Associate Address",
            "effectiveDate": "Effective Date", "governingLaw": "Governing Law",
            "jurisdiction": "Jurisdiction", "servicesDescription": "Services Description",
            "dataTypes": "PHI Types",
        },
    ),
    "ai_addendum": DocTypeInfo(
        name="AI Addendum",
        description="Addendum for AI and machine learning services.",
        filename="AI-Addendum.md",
        party1_role="Provider",
        party2_role="Customer",
        required_fields=[
            "party1Name", "party1Company", "party1Address",
            "party2Name", "party2Company", "party2Address",
            "effectiveDate", "governingLaw", "jurisdiction",
            "productOrServiceName",
        ],
        defaults={},
        optional_fields=["party1Title", "party2Title"],
        field_labels={
            "party1Name": "Provider Name", "party1Company": "Provider Company",
            "party1Address": "Provider Address", "party2Name": "Customer Name",
            "party2Company": "Customer Company", "party2Address": "Customer Address",
            "effectiveDate": "Effective Date", "governingLaw": "Governing Law",
            "jurisdiction": "Jurisdiction", "productOrServiceName": "AI Service Name",
        },
    ),
}

# Unsupported types and their closest matches
CLOSEST_MATCHES: dict[str, str] = {
    "non-disclosure agreement": "mutual_nda",
    "nda": "mutual_nda",
    "saas agreement": "cloud_service_agreement",
    "software as a service": "cloud_service_agreement",
    "service agreement": "professional_services_agreement",
    "consulting agreement": "professional_services_agreement",
    "gdpr": "data_processing_agreement",
    "data agreement": "data_processing_agreement",
    "hipaa": "business_associate_agreement",
    "employment agreement": None,  # not supported
    "terms of service": None,
    "privacy policy": None,
}

_SELECTOR_PROMPT_TEMPLATE = """You are a friendly legal assistant helping a user select and draft a legal agreement.

Today's date is {today}.

AVAILABLE DOCUMENT TYPES:
{doc_list}

Your job right now: figure out which document the user needs.

Rules:
- When the user clearly identifies a type from the list, set `fields.documentType` to the exact key shown in brackets and immediately start collecting the required fields for that type.
- If the user describes something NOT in the list, warmly explain that document is not yet supported, identify the closest match from the list, and ask if they would like that instead.
- If unclear, ask a clarifying question.
- Populate `fields.effectiveDate` with today's date ({today}) as a sensible default.
- ALWAYS end your reply with a question if you need more information or if the document type is not yet identified."""

_COLLECTION_PROMPT_TEMPLATE = """You are a friendly legal assistant helping a user draft a {doc_name}.

Today's date is {today}. Party 1 is the {party1_role} and Party 2 is the {party2_role}.

REQUIRED fields (must be filled by the user — never invent these):
{required_list}

Fields with sensible defaults (keep unless user asks to change):
{defaults_list}

Rules:
1. Read the user's latest message and update `fields` with any new information provided.
2. Identify which required fields are still missing.
3. Write a short, friendly `reply` (1–3 sentences).
4. CRITICAL: If any required fields are still missing, you MUST end your reply with a specific question asking for the next piece of missing information. Never confirm information without asking what you still need.
5. Set `complete` to true ONLY when every required field above is populated; otherwise false.
6. Always echo back the FULL fields object with all currently known values.
7. Never invent values for required fields the user hasn't provided — leave those null.
8. effectiveDate must be ISO format YYYY-MM-DD.
9. A party address can be email or postal — accept whatever the user provides.
10. Ask about one party at a time to keep questions manageable."""


def _build_doc_list() -> str:
    lines = []
    for key, info in SUPPORTED_DOCS.items():
        lines.append(f"  [{key}] {info.name} — {info.description}")
    return "\n".join(lines)


def _build_required_list(doc_info: DocTypeInfo) -> str:
    labels = doc_info.field_labels
    return "\n".join(f"  - {labels.get(f, f)}" for f in doc_info.required_fields)


def _build_defaults_list(doc_info: DocTypeInfo) -> str:
    if not doc_info.defaults:
        return "  - effectiveDate: today's date"
    lines = ["  - effectiveDate: today's date"]
    for k, v in doc_info.defaults.items():
        label = doc_info.field_labels.get(k, k)
        lines.append(f"  - {label}: {v!r}")
    return "\n".join(lines)


def get_system_prompt(doc_type: str | None, today: str) -> str:
    if doc_type is None or doc_type not in SUPPORTED_DOCS:
        return _SELECTOR_PROMPT_TEMPLATE.format(
            today=today,
            doc_list=_build_doc_list(),
        )
    info = SUPPORTED_DOCS[doc_type]
    return _COLLECTION_PROMPT_TEMPLATE.format(
        doc_name=info.name,
        today=today,
        party1_role=info.party1_role,
        party2_role=info.party2_role,
        required_list=_build_required_list(info),
        defaults_list=_build_defaults_list(info),
    )


def is_complete(doc_type: str | None, fields: UniversalDocFields) -> bool:
    if not doc_type or doc_type not in SUPPORTED_DOCS:
        return False
    info = SUPPORTED_DOCS[doc_type]
    data = fields.model_dump()
    return all(data.get(f) for f in info.required_fields)
