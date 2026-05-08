"""Tests for the chat API endpoints (greeting and message routing)."""

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_greeting_returns_200():
    r = client.get("/api/chat/greeting")
    assert r.status_code == 200
    data = r.json()
    assert "reply" in data
    assert "fields" in data


def test_greeting_reply_mentions_document_types():
    r = client.get("/api/chat/greeting")
    assert r.status_code == 200
    reply = r.json()["reply"].lower()
    # Should mention at least one supported doc type
    assert any(
        kw in reply
        for kw in ["nda", "agreement", "legal", "document"]
    )


def test_greeting_fields_all_null():
    r = client.get("/api/chat/greeting")
    assert r.status_code == 200
    fields = r.json()["fields"]
    assert fields.get("documentType") is None
    assert fields.get("party1Name") is None


def test_message_requires_user_last():
    r = client.post(
        "/api/chat/message",
        json={
            "messages": [{"role": "assistant", "content": "hello"}],
            "fields": {},
        },
    )
    assert r.status_code == 400


def test_message_empty_messages_returns_400():
    r = client.post("/api/chat/message", json={"messages": [], "fields": {}})
    assert r.status_code == 400


def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"
