"""Admin-only endpoints: product CRUD + bulk import, orders, users."""
import csv
import io
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.db.postgres import get_db
from app.db.mongo import get_mongo
from app.core.deps import get_current_admin
from app.models.user import User
from app.models.order import Order
from app.schemas.product import Product

router = APIRouter(prefix="/api/admin", tags=["admin"])


# ---------- helpers ----------
def _slug(name: str) -> str:
    return name.lower().strip().replace(" ", "-").replace("/", "-").replace('"', "")


async def _next_id() -> int:
    db = get_mongo()
    top = await db.products.find_one(sort=[("id", -1)])
    return (top["id"] + 1) if top else 1


# ---------- product models ----------
class ProductIn(BaseModel):
    name: str
    cat: str
    price: float
    mrp: float
    rating: float = 0
    tag: str = ""
    stock: int = 0
    brand: Optional[str] = None
    is_new: bool = False


# ---------- PRODUCTS ----------
@router.get("/products", response_model=List[Product])
async def admin_list_products(_: User = Depends(get_current_admin)):
    db = get_mongo()
    return await db.products.find({}, {"_id": 0}).sort("id", 1).to_list(length=1000)


@router.post("/products", response_model=Product, status_code=201)
async def create_product(data: ProductIn, _: User = Depends(get_current_admin)):
    db = get_mongo()
    doc = data.model_dump()
    doc["id"] = await _next_id()
    doc["slug"] = _slug(data.name)
    if await db.products.find_one({"slug": doc["slug"]}):
        doc["slug"] = f'{doc["slug"]}-{doc["id"]}'
    await db.products.insert_one(doc)
    doc.pop("_id", None)
    return doc


@router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: int, data: ProductIn, _: User = Depends(get_current_admin)):
    db = get_mongo()
    update = data.model_dump()
    result = await db.products.update_one({"id": product_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    doc = await db.products.find_one({"id": product_id}, {"_id": 0})
    return doc


@router.delete("/products/{product_id}")
async def delete_product(product_id: int, _: User = Depends(get_current_admin)):
    db = get_mongo()
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"deleted": product_id}


# ---------- BULK IMPORT (CSV / Excel) ----------
@router.post("/products/import")
async def import_products(file: UploadFile = File(...), _: User = Depends(get_current_admin)):
    """Accepts a .csv or .xlsx with columns:
    name, cat, price, mrp, rating, tag, stock, brand, is_new
    (only name, cat, price are required; others optional).
    """
    filename = (file.filename or "").lower()
    content = await file.read()
    rows: List[dict] = []

    if filename.endswith(".csv"):
        text = content.decode("utf-8-sig")
        reader = csv.DictReader(io.StringIO(text))
        rows = [dict(r) for r in reader]
    elif filename.endswith((".xlsx", ".xls")):
        from openpyxl import load_workbook
        wb = load_workbook(io.BytesIO(content), read_only=True, data_only=True)
        ws = wb.active
        it = ws.iter_rows(values_only=True)
        headers = [str(h).strip().lower() if h is not None else "" for h in next(it)]
        for r in it:
            rows.append({headers[i]: r[i] for i in range(len(headers))})
        wb.close()
    else:
        raise HTTPException(status_code=400, detail="Upload a .csv or .xlsx file")

    db = get_mongo()
    next_id = await _next_id()
    inserted, skipped, errors = 0, 0, []

    def to_float(v, default=0.0):
        try:
            return float(v)
        except (TypeError, ValueError):
            return default

    def to_int(v, default=0):
        try:
            return int(float(v))
        except (TypeError, ValueError):
            return default

    def to_bool(v):
        return str(v).strip().lower() in ("1", "true", "yes", "y", "new")

    for i, row in enumerate(rows, start=2):
        name = str(row.get("name") or "").strip()
        cat = str(row.get("cat") or row.get("category") or "").strip()
        if not name or not cat:
            skipped += 1
            errors.append(f"Row {i}: missing name/cat")
            continue
        slug = _slug(name)
        if await db.products.find_one({"slug": slug}):
            slug = f"{slug}-{next_id}"
        doc = {
            "id": next_id,
            "slug": slug,
            "name": name,
            "cat": cat,
            "price": to_float(row.get("price")),
            "mrp": to_float(row.get("mrp")) or to_float(row.get("price")),
            "rating": to_float(row.get("rating")),
            "tag": str(row.get("tag") or "").strip(),
            "stock": to_int(row.get("stock")),
            "brand": (str(row.get("brand")).strip() if row.get("brand") else None),
            "is_new": to_bool(row.get("is_new")),
        }
        await db.products.insert_one(doc)
        inserted += 1
        next_id += 1

    return {"inserted": inserted, "skipped": skipped, "errors": errors[:20]}


# ---------- ORDERS ----------
class AdminOrderOut(BaseModel):
    id: int
    user_id: int
    user_email: Optional[str] = None
    items: list
    total: float
    status: str
    address: str
    created_at: object


@router.get("/orders")
async def admin_list_orders(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_admin)):
    result = await db.execute(select(Order).order_by(Order.created_at.desc()))
    orders = result.scalars().all()
    # attach user emails
    user_ids = {o.user_id for o in orders}
    emails = {}
    if user_ids:
        ures = await db.execute(select(User).where(User.id.in_(user_ids)))
        emails = {u.id: u.email for u in ures.scalars().all()}
    return [
        {
            "id": o.id, "user_id": o.user_id, "user_email": emails.get(o.user_id),
            "items": o.items, "total": float(o.total), "status": o.status,
            "address": o.address, "created_at": o.created_at,
        }
        for o in orders
    ]


class StatusIn(BaseModel):
    status: str


@router.put("/orders/{order_id}/status")
async def update_order_status(order_id: int, data: StatusIn,
                              db: AsyncSession = Depends(get_db), _: User = Depends(get_current_admin)):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = data.status
    await db.commit()
    return {"id": order.id, "status": order.status}


# ---------- USERS ----------
@router.get("/users")
async def admin_list_users(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_admin)):
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()
    return [{"id": u.id, "name": u.name, "email": u.email, "phone": u.phone,
             "role": u.role, "created_at": u.created_at} for u in users]


class RoleIn(BaseModel):
    role: str  # customer | admin


class NewAdminIn(BaseModel):
    name: str
    email: str
    phone: str = ""
    password: str
    role: str = "admin"  # admin | superadmin


@router.post("/users", status_code=201)
async def create_admin(data: NewAdminIn, db: AsyncSession = Depends(get_db),
                       current: User = Depends(get_current_admin)):
    """Create a brand-new admin (or super admin) account directly.
    Only a super admin may create another super admin."""
    from app.core.security import hash_password
    role = data.role if data.role in ("admin", "superadmin") else "admin"
    if role == "superadmin" and current.role != "superadmin":
        raise HTTPException(status_code=403, detail="Only a super admin can create another super admin")
    existing = await db.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(name=data.name, email=data.email, phone=data.phone,
                password_hash=hash_password(data.password), role=role)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return {"id": user.id, "name": user.name, "email": user.email, "role": user.role}


@router.put("/users/{user_id}/role")
async def set_user_role(user_id: int, data: RoleIn,
                        db: AsyncSession = Depends(get_db), current: User = Depends(get_current_admin)):
    if data.role not in ("customer", "admin"):
        raise HTTPException(status_code=400, detail="Role must be customer or admin")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role == "superadmin":
        raise HTTPException(status_code=400, detail="Cannot change the super admin's role")
    user.role = data.role
    await db.commit()
    return {"id": user.id, "role": user.role}


@router.get("/stats")
async def admin_stats(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_admin)):
    mongo = get_mongo()
    products = await mongo.products.count_documents({})
    orders_count = (await db.execute(select(func.count(Order.id)))).scalar() or 0
    users_count = (await db.execute(select(func.count(User.id)))).scalar() or 0
    revenue = (await db.execute(select(func.coalesce(func.sum(Order.total), 0)))).scalar() or 0
    return {"products": products, "orders": int(orders_count),
            "users": int(users_count), "revenue": float(revenue)}
