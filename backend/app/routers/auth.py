from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.postgres import get_db
from app.models.user import User
from app.schemas.auth import SignupIn, TokenOut, UserOut
from app.core.security import hash_password, verify_password, create_access_token
from app.core.deps import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=TokenOut, status_code=201)
async def signup(data: SignupIn, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(name=data.name, email=data.email, phone=data.phone,
                password_hash=hash_password(data.password))
    db.add(user)
    await db.commit()
    await db.refresh(user)
    token = create_access_token(str(user.id))
    return TokenOut(access_token=token, user=UserOut(id=user.id, name=user.name, email=user.email, phone=user.phone))


@router.post("/login", response_model=TokenOut)
async def login(form: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    # OAuth2 form uses 'username' — we treat it as email
    result = await db.execute(select(User).where(User.email == form.username))
    user = result.scalar_one_or_none()
    if not user or not verify_password(form.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    token = create_access_token(str(user.id))
    return TokenOut(access_token=token, user=UserOut(id=user.id, name=user.name, email=user.email, phone=user.phone))


@router.get("/me", response_model=UserOut)
async def me(current: User = Depends(get_current_user)):
    return UserOut(id=current.id, name=current.name, email=current.email, phone=current.phone)
