from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.db.postgres import init_postgres
from app.db.mongo import init_mongo
from app.core.bootstrap import ensure_superadmin
from app.routers import auth, products, orders, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create Postgres tables + seed Mongo products
    await init_postgres()
    await init_mongo()
    await ensure_superadmin()
    yield


app = FastAPI(title="VoltEdge API", version="1.0.0", lifespan=lifespan)

# FRONTEND_ORIGIN may be a comma-separated list, e.g.
#   http://localhost:4200,http://127.0.0.1:4200,http://your-server-ip
_origins = [o.strip() for o in settings.FRONTEND_ORIGIN.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(admin.router)


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "voltedge-api"}
