"""Create the super admin account on startup if it doesn't exist."""
from sqlalchemy import select
from app.db.postgres import AsyncSessionLocal
from app.models.user import User
from app.core.security import hash_password
from app.config import settings


async def ensure_superadmin():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.email == settings.SUPERADMIN_EMAIL))
        if result.scalar_one_or_none() is None:
            admin = User(
                name=settings.SUPERADMIN_NAME,
                email=settings.SUPERADMIN_EMAIL,
                phone="",
                password_hash=hash_password(settings.SUPERADMIN_PASSWORD),
                role="superadmin",
            )
            db.add(admin)
            await db.commit()
