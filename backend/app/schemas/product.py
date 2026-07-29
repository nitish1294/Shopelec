from pydantic import BaseModel, Field
from typing import Optional


class Product(BaseModel):
    id: int
    slug: str
    name: str
    cat: str
    price: float
    mrp: float
    rating: float = 0
    tag: str = ""
    stock: int = 0
    brand: Optional[str] = None
    is_new: bool = False
