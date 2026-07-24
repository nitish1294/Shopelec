"""PostgreSQL connection (users + orders) via async SQLAlchemy."""
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.config import settings

engine = create_async_engine(settings.POSTGRES_URL, echo=False, future=True)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session


async def init_postgres():
    # Import models so they register on Base.metadata, then create tables.
    from app.models import user as _user  # noqa
    from app.models import order as _order  # noqa
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
