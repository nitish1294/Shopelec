from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.db.postgres import init_postgres
from app.db.mongo import init_mongo
from app.routers import auth, products, orders


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create Postgres tables + seed Mongo products
    await init_postgres()
    await init_mongo()
    yield


app = FastAPI(title="VoltEdge API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(orders.router)


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "voltedge-api"}
