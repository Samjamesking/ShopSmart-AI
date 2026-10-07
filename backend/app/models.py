from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(50), default="user")  # 'user' or 'admin'
    preferences = Column(Text, default="{}")  # JSON string: favorite_brands, budget_range, categories, dark_mode
    created_at = Column(DateTime, default=datetime.utcnow)

    reviews = relationship("Review", back_populates="user", cascade="all, delete-orphan")
    wishlist = relationship("Wishlist", back_populates="user", cascade="all, delete-orphan")
    searches = relationship("SearchHistory", back_populates="user", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    brand = Column(String(100), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    subcategory = Column(String(100), index=True)
    price = Column(Float, nullable=False, index=True)
    original_price = Column(Float, nullable=False)
    discount_percent = Column(Integer, default=0)
    description = Column(Text, nullable=False)
    rating = Column(Float, default=4.0, index=True)
    rating_count = Column(Integer, default=0)
    image_url = Column(String(500), nullable=False)
    additional_images = Column(Text, default="[]")  # JSON list
    specs = Column(Text, default="{}")  # JSON dict of technical specifications
    in_stock = Column(Boolean, default=True)
    tags = Column(Text, default="[]")  # JSON list
    created_at = Column(DateTime, default=datetime.utcnow)

    reviews = relationship("Review", back_populates="product", cascade="all, delete-orphan")
    wishlist_entries = relationship("Wishlist", back_populates="product", cascade="all, delete-orphan")
    price_history = relationship("PriceHistory", back_populates="product", cascade="all, delete-orphan")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user_name = Column(String(100), nullable=False)
    rating = Column(Float, nullable=False)
    review_text = Column(Text, nullable=False)
    sentiment_score = Column(Float, default=0.0)  # -1.0 to 1.0
    sentiment_label = Column(String(20), default="positive")  # positive, neutral, negative
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="reviews")
    user = relationship("User", back_populates="reviews")

class Wishlist(Base):
    __tablename__ = "wishlist"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    target_price = Column(Float, nullable=True)
    alert_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="wishlist")
    product = relationship("Product", back_populates="wishlist_entries")

class PriceHistory(Base):
    __tablename__ = "price_history"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    date = Column(String(20), nullable=False)  # 'YYYY-MM-DD' or month name
    price = Column(Float, nullable=False)

    product = relationship("Product", back_populates="price_history")

class SearchHistory(Base):
    __tablename__ = "search_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    query = Column(String(255), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="searches")

class AgentLog(Base):
    __tablename__ = "agent_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    agent_name = Column(String(100), nullable=False)
    prompt = Column(Text, nullable=False)
    response_summary = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String(50), default="Delivered")  # Delivered, Shipped, Processing
    date = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="orders")
    product = relationship("Product")
