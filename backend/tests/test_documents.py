"""Tests for the document registry and field models."""

import pytest
from app.documents import (
    SUPPORTED_DOCS,
    UniversalDocFields,
    get_system_prompt,
    is_complete,
)


def test_all_doc_types_present():
    expected = {
        "mutual_nda",
        "cloud_service_agreement",
        "design_partner_agreement",
        "service_level_agreement",
        "professional_services_agreement",
        "data_processing_agreement",
        "software_license_agreement",
        "partnership_agreement",
        "pilot_agreement",
        "business_associate_agreement",
        "ai_addendum",
    }
    assert set(SUPPORTED_DOCS.keys()) == expected


def test_is_complete_returns_false_for_unknown_type():
    assert is_complete("nonexistent_type", UniversalDocFields()) is False


def test_is_complete_returns_false_when_fields_empty():
    for doc_type in SUPPORTED_DOCS:
        assert is_complete(doc_type, UniversalDocFields()) is False, (
            f"is_complete should be False for {doc_type} with empty fields"
        )


def _make_nda_fields_complete() -> UniversalDocFields:
    return UniversalDocFields(
        documentType="mutual_nda",
        party1Name="Alice Smith",
        party1Title="CEO",
        party1Company="Acme Inc",
        party1Address="alice@acme.com",
        party2Name="Bob Jones",
        party2Title="CTO",
        party2Company="Globex Corp",
        party2Address="bob@globex.com",
        governingLaw="Delaware",
        jurisdiction="courts located in New Castle, DE",
    )


def test_is_complete_nda_all_required():
    fields = _make_nda_fields_complete()
    assert is_complete("mutual_nda", fields) is True


def test_is_complete_nda_missing_one_field():
    fields = _make_nda_fields_complete()
    fields.party2Address = None
    assert is_complete("mutual_nda", fields) is False


def test_is_complete_csa_complete():
    fields = UniversalDocFields(
        documentType="cloud_service_agreement",
        party1Name="Jane Provider",
        party1Company="Provider Co",
        party1Address="jane@provider.com",
        party2Name="John Customer",
        party2Company="Customer Inc",
        party2Address="john@customer.com",
        effectiveDate="2026-05-08",
        governingLaw="California",
        jurisdiction="courts in San Francisco, CA",
        productOrServiceName="Acme Cloud Platform",
    )
    assert is_complete("cloud_service_agreement", fields) is True


def test_is_complete_csa_missing_service_name():
    fields = UniversalDocFields(
        documentType="cloud_service_agreement",
        party1Name="Jane Provider",
        party1Company="Provider Co",
        party1Address="jane@provider.com",
        party2Name="John Customer",
        party2Company="Customer Inc",
        party2Address="john@customer.com",
        effectiveDate="2026-05-08",
        governingLaw="California",
        jurisdiction="courts in San Francisco, CA",
        # productOrServiceName missing
    )
    assert is_complete("cloud_service_agreement", fields) is False


def test_get_system_prompt_selector_when_no_doc_type():
    prompt = get_system_prompt(None, "2026-05-08")
    assert "mutual_nda" in prompt
    assert "cloud_service_agreement" in prompt
    assert "2026-05-08" in prompt


def test_get_system_prompt_collection_for_nda():
    prompt = get_system_prompt("mutual_nda", "2026-05-08")
    assert "Mutual Non-Disclosure Agreement" in prompt
    assert "Party 1" in prompt
    assert "Party 2" in prompt
    assert "governingLaw" in prompt or "Governing Law" in prompt


def test_get_system_prompt_collection_for_csa():
    prompt = get_system_prompt("cloud_service_agreement", "2026-05-08")
    assert "Cloud Service Agreement" in prompt
    assert "Provider" in prompt
    assert "Customer" in prompt


def test_get_system_prompt_unknown_type_returns_selector():
    prompt = get_system_prompt("nonexistent_type", "2026-05-08")
    # Should fall back to the selector prompt
    assert "mutual_nda" in prompt


def test_universal_doc_fields_all_optional():
    """All fields should default to None — no required fields during chat."""
    fields = UniversalDocFields()
    assert fields.documentType is None
    assert fields.party1Name is None
    assert fields.governingLaw is None


def test_each_doc_type_has_required_fields():
    for key, info in SUPPORTED_DOCS.items():
        assert info.required_fields, f"{key} must have at least one required field"
        # All required fields must exist as attributes on UniversalDocFields
        empty = UniversalDocFields()
        for f in info.required_fields:
            assert hasattr(empty, f), f"UniversalDocFields missing field '{f}' required by {key}"
