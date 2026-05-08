"""Tests for the /api/documents CRUD endpoints."""

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app, raise_server_exceptions=True)

_counter = 0


def _new_user():
    global _counter
    _counter += 1
    email = f"docuser{_counter}@example.com"
    r = client.post("/api/auth/signup", json={"email": email, "password": "pass"})
    return r.cookies["prelegal_session"]


def test_list_documents_requires_auth():
    r = client.get("/api/documents")
    assert r.status_code == 401


def test_save_document_requires_auth():
    r = client.post("/api/documents", json={"documentType": "mutual_nda", "fields": {}})
    assert r.status_code == 401


def test_save_and_list_documents():
    token = _new_user()
    cookies = {"prelegal_session": token}

    r = client.post(
        "/api/documents",
        json={"documentType": "mutual_nda", "fields": {"party1Name": "Acme"}},
        cookies=cookies,
    )
    assert r.status_code == 201
    doc = r.json()
    assert doc["documentType"] == "mutual_nda"
    assert doc["fields"]["party1Name"] == "Acme"
    assert "id" in doc

    r2 = client.get("/api/documents", cookies=cookies)
    assert r2.status_code == 200
    docs = r2.json()
    assert len(docs) == 1
    assert docs[0]["id"] == doc["id"]


def test_get_document_by_id():
    token = _new_user()
    cookies = {"prelegal_session": token}
    saved = client.post(
        "/api/documents",
        json={"documentType": "pilot_agreement", "fields": {}},
        cookies=cookies,
    ).json()

    r = client.get(f"/api/documents/{saved['id']}", cookies=cookies)
    assert r.status_code == 200
    assert r.json()["id"] == saved["id"]


def test_get_document_not_found_returns_404():
    token = _new_user()
    r = client.get("/api/documents/99999", cookies={"prelegal_session": token})
    assert r.status_code == 404


def test_cannot_access_another_users_document():
    token_a = _new_user()
    token_b = _new_user()

    saved = client.post(
        "/api/documents",
        json={"documentType": "mutual_nda", "fields": {}},
        cookies={"prelegal_session": token_a},
    ).json()

    r = client.get(f"/api/documents/{saved['id']}", cookies={"prelegal_session": token_b})
    assert r.status_code == 404


def test_delete_document():
    token = _new_user()
    cookies = {"prelegal_session": token}
    saved = client.post(
        "/api/documents",
        json={"documentType": "mutual_nda", "fields": {}},
        cookies=cookies,
    ).json()

    r = client.delete(f"/api/documents/{saved['id']}", cookies=cookies)
    assert r.status_code == 204

    r2 = client.get(f"/api/documents/{saved['id']}", cookies=cookies)
    assert r2.status_code == 404


def test_delete_another_users_document_returns_404():
    token_a = _new_user()
    token_b = _new_user()

    saved = client.post(
        "/api/documents",
        json={"documentType": "mutual_nda", "fields": {}},
        cookies={"prelegal_session": token_a},
    ).json()

    r = client.delete(f"/api/documents/{saved['id']}", cookies={"prelegal_session": token_b})
    assert r.status_code == 404


def test_documents_isolated_per_user():
    token_a = _new_user()
    token_b = _new_user()

    client.post("/api/documents", json={"documentType": "mutual_nda", "fields": {}}, cookies={"prelegal_session": token_a})
    client.post("/api/documents", json={"documentType": "mutual_nda", "fields": {}}, cookies={"prelegal_session": token_a})

    r_b = client.get("/api/documents", cookies={"prelegal_session": token_b})
    assert r_b.json() == []
