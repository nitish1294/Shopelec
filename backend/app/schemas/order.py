from pydantic import BaseModel
from typing import List
from datetime import datetime


class OrderItemIn(BaseModel):
    product_id: int
    name: str
    price: float
    qty: int


class OrderIn(BaseModel):
    items: List[OrderItemIn]
    address: str = ""


class OrderOut(BaseModel):
    id: int
    items: list
    total: float
    status: str
    address: str
    created_at: datetime
