"""Tests for the auth endpoints (signup, signin, signout, me)."""

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app, raise_server_exceptions=True)


def test_signup_creates_user_and_sets_cookie():
    r = client.post("/api/auth/signup", json={"email": "alice@example.com", "password": "secret123"})
    assert r.status_code == 200
    data = r.json()
    assert data["ok"] is True
    assert data["email"] == "alice@example.com"
    assert "prelegal_session" in r.cookies


def test_signup_duplicate_email_returns_409():
    client.post("/api/auth/signup", json={"email": "bob@example.com", "password": "pass"})
    r = client.post("/api/auth/signup", json={"email": "bob@example.com", "password": "pass"})
    assert r.status_code == 409


def test_signin_with_correct_credentials_sets_cookie():
    client.post("/api/auth/signup", json={"email": "carol@example.com", "password": "mypass"})
    r = client.post("/api/auth/signin", json={"email": "carol@example.com", "password": "mypass"})
    assert r.status_code == 200
    assert r.json()["ok"] is True
    assert "prelegal_session" in r.cookies


def test_signin_wrong_password_returns_401():
    client.post("/api/auth/signup", json={"email": "dave@example.com", "password": "correct"})
    r = client.post("/api/auth/signin", json={"email": "dave@example.com", "password": "wrong"})
    assert r.status_code == 401


def test_signin_unknown_email_returns_401():
    r = client.post("/api/auth/signin", json={"email": "nobody@example.com", "password": "any"})
    assert r.status_code == 401


def test_me_returns_user_when_authenticated():
    client.post("/api/auth/signup", json={"email": "eve@example.com", "password": "pass"})
    r_signin = client.post("/api/auth/signin", json={"email": "eve@example.com", "password": "pass"})
    token = r_signin.cookies["prelegal_session"]
    r = client.get("/api/auth/me", cookies={"prelegal_session": token})
    assert r.status_code == 200
    assert r.json()["user"]["email"] == "eve@example.com"


def test_me_returns_401_without_cookie():
    from fastapi.testclient import TestClient as _TC
    fresh = _TC(app, raise_server_exceptions=True)
    r = fresh.get("/api/auth/me")
    assert r.status_code == 401


def test_signout_clears_cookie():
    r = client.post("/api/auth/signout")
    assert r.status_code == 200
    assert r.json()["ok"] is True
