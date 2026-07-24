"""MongoDB connection (products + catalog) via Motor."""
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

_client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(settings.MONGO_URL)
    return _client


def get_mongo():
    return get_client()[settings.MONGO_DB]


async def init_mongo():
    """Seed the products collection on first run."""
    db = get_mongo()
    count = await db.products.count_documents({})
    if count == 0:
        from app.seed import PRODUCTS
        await db.products.insert_many(PRODUCTS)
    # indexes
    await db.products.create_index("slug", unique=True)
    await db.products.create_index("cat")
