from fastapi import APIRouter, Response
from pydantic import BaseModel, EmailStr

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
def signup(_credentials: Credentials) -> AuthResult:
    """Stub. PL-7 will persist the user to SQLite with bcrypt hashing and issue a JWT cookie."""
    return AuthResult(ok=True, email=_credentials.email)


@router.post("/signin", response_model=AuthResult)
def signin(_credentials: Credentials) -> AuthResult:
    """Stub. PL-7 will verify against the users table and issue a JWT cookie."""
    return AuthResult(ok=True, email=_credentials.email)


@router.post("/signout", response_model=AuthResult)
def signout(response: Response) -> AuthResult:
    response.delete_cookie("prelegal_session")
    return AuthResult(ok=True)


@router.get("/me", response_model=MeResponse)
def me() -> MeResponse:
    """Stub — anonymous until PL-7 wires up sessions."""
    return MeResponse(user=None)
