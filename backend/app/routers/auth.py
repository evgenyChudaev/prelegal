from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import BaseModel, EmailStr

from app.auth_utils import create_jwt, get_current_user, hash_password, verify_password
from app.db import get_conn

router = APIRouter(prefix="/api/auth", tags=["auth"])


class Credentials(BaseModel):
    email: EmailStr
    password: str


class AuthResult(BaseModel):
    ok: bool
    email: EmailStr | None = None


class MeResponse(BaseModel):
    user: dict | None = None


@router.post("/signup", response_model=AuthResult)
def signup(credentials: Credentials, response: Response) -> AuthResult:
    with get_conn() as conn:
        existing = conn.execute(
            "SELECT id FROM users WHERE email = ?", (credentials.email,)
        ).fetchone()
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
        cursor = conn.execute(
            "INSERT INTO users (email, password_hash) VALUES (?, ?)",
            (credentials.email, hash_password(credentials.password)),
        )
        user_id = cursor.lastrowid
    token = create_jwt(user_id, credentials.email)
    response.set_cookie(
        "prelegal_session",
        token,
        httponly=True,
        samesite="lax",
        max_age=7 * 24 * 3600,
    )
    return AuthResult(ok=True, email=credentials.email)


@router.post("/signin", response_model=AuthResult)
def signin(credentials: Credentials, response: Response) -> AuthResult:
    with get_conn() as conn:
        row = conn.execute(
            "SELECT id, email, password_hash FROM users WHERE email = ?", (credentials.email,)
        ).fetchone()
    if not row or not verify_password(credentials.password, row["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    token = create_jwt(row["id"], row["email"])
    response.set_cookie(
        "prelegal_session",
        token,
        httponly=True,
        samesite="lax",
        max_age=7 * 24 * 3600,
    )
    return AuthResult(ok=True, email=row["email"])


@router.post("/signout", response_model=AuthResult)
def signout(response: Response) -> AuthResult:
    response.delete_cookie("prelegal_session")
    return AuthResult(ok=True)


@router.get("/me", response_model=MeResponse)
def me(user: dict = Depends(get_current_user)) -> MeResponse:
    return MeResponse(user=user)
