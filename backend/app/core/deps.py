"""Shared dependencies: current authenticated user."""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.postgres import get_db
from app.core.security import decode_token
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> User:
    cred_exc = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    sub = decode_token(token)
    if sub is None:
        raise cred_exc
    result = await db.execute(select(User).where(User.id == int(sub)))
    user = result.scalar_one_or_none()
    if user is None:
        raise cred_exc
    return user
