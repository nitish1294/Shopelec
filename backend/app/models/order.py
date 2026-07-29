from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Integer, Numeric, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.postgres import Base


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    # items stored as JSON: [{product_id, name, price, qty}]
    items: Mapped[list] = mapped_column(JSON, default=list)
    total: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    status: Mapped[str] = mapped_column(String(30), default="placed")
    address: Mapped[str] = mapped_column(String(500), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
