"""Password hashing (bcrypt directly) + JWT helpers.

We use the `bcrypt` package directly rather than passlib, because recent
bcrypt releases removed the `__about__` attribute passlib relies on, which
raises errors on hashing. This approach is version-proof.
"""
from datetime import datetime, timedelta, timezone
import bcrypt
from jose import jwt, JWTError
from app.config import settings


def hash_password(pw: str) -> str:
    # bcrypt has a 72-byte limit; encode and truncate defensively.
    pw_bytes = pw.encode("utf-8")[:72]
    return bcrypt.hashpw(pw_bytes, bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8")[:72], hashed.encode("utf-8"))
    except (ValueError, TypeError):
        return False


def create_access_token(sub: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": sub, "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALG)


def decode_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALG])
        return payload.get("sub")
    except JWTError:
        return None
