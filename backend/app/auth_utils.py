import os
from datetime import datetime, timedelta, timezone

import bcrypt
from fastapi import Cookie, HTTPException, status
from jose import JWTError, jwt

_SECRET = os.environ.get("JWT_SECRET", "prelegal-dev-secret-change-in-prod")
_ALGORITHM = "HS256"
_EXPIRY_DAYS = 7


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


def create_jwt(user_id: int, email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=_EXPIRY_DAYS)
    return jwt.encode(
        {"sub": str(user_id), "email": email, "exp": expire},
        _SECRET,
        algorithm=_ALGORITHM,
    )


def decode_jwt(token: str) -> dict:
    return jwt.decode(token, _SECRET, algorithms=[_ALGORITHM])


def get_current_user(prelegal_session: str | None = Cookie(default=None)) -> dict:
    if not prelegal_session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        payload = decode_jwt(prelegal_session)
        return {"id": int(payload["sub"]), "email": payload["email"]}
    except (JWTError, KeyError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session")
