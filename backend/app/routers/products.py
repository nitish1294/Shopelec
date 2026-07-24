from fastapi import APIRouter, Query
from typing import Optional, List
from app.db.mongo import get_mongo
from app.schemas.product import Product

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("", response_model=List[Product])
async def list_products(cat: Optional[str] = Query(None), q: Optional[str] = Query(None),
                        is_new: Optional[bool] = Query(None)):
    db = get_mongo()
    query: dict = {}
    if cat and cat != "All":
        query["cat"] = cat
    if is_new is not None:
        query["is_new"] = is_new
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"tag": {"$regex": q, "$options": "i"}},
        ]
    docs = await db.products.find(query, {"_id": 0}).to_list(length=200)
    return docs


@router.get("/categories")
async def categories():
    db = get_mongo()
    cats = await db.products.distinct("cat")
    return ["All"] + sorted(cats)


@router.get("/{slug}", response_model=Product)
async def get_product(slug: str):
    db = get_mongo()
    doc = await db.products.find_one({"slug": slug}, {"_id": 0})
    if not doc:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Product not found")
    return doc
