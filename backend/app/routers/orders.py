from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.postgres import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.order import Order
from app.schemas.order import OrderIn, OrderOut

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("", response_model=OrderOut, status_code=201)
async def create_order(data: OrderIn, db: AsyncSession = Depends(get_db),
                       current: User = Depends(get_current_user)):
    total = sum(i.price * i.qty for i in data.items)
    order = Order(
        user_id=current.id,
        items=[i.model_dump() for i in data.items],
        total=total,
        address=data.address,
        status="placed",
    )
    db.add(order)
    await db.commit()
    await db.refresh(order)
    return OrderOut(id=order.id, items=order.items, total=float(order.total),
                    status=order.status, address=order.address, created_at=order.created_at)


@router.get("", response_model=List[OrderOut])
async def my_orders(db: AsyncSession = Depends(get_db), current: User = Depends(get_current_user)):
    result = await db.execute(select(Order).where(Order.user_id == current.id).order_by(Order.created_at.desc()))
    orders = result.scalars().all()
    return [OrderOut(id=o.id, items=o.items, total=float(o.total), status=o.status,
                     address=o.address, created_at=o.created_at) for o in orders]
