from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Auth & User Schemas ---
class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(UserBase):
    id: int
    role: str
    preferences: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

class UserPreferencesUpdate(BaseModel):
    favorite_brands: Optional[List[str]] = None
    budget_range: Optional[Dict[str, float]] = None
    categories: Optional[List[str]] = None
    dark_mode: Optional[bool] = None
    currency: Optional[str] = None

# --- Product Schemas ---
class ProductBase(BaseModel):
    name: str
    brand: str
    category: str
    subcategory: Optional[str] = None
    price: float
    original_price: float
    discount_percent: Optional[int] = 0
    description: str
    rating: Optional[float] = 4.0
    rating_count: Optional[int] = 0
    image_url: str
    additional_images: Optional[List[str]] = []
    specs: Optional[Dict[str, Any]] = {}
    in_stock: Optional[bool] = True
    tags: Optional[List[str]] = []

class ProductCreate(ProductBase):
    pass

class ProductOut(ProductBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ProductDetailOut(ProductOut):
    lowest_recorded_price: Optional[float] = None
    highest_recorded_price: Optional[float] = None
    price_prediction: Optional[Dict[str, Any]] = None
    ai_summary: Optional[Dict[str, Any]] = None
    price_history: Optional[List[Dict[str, Any]]] = []
    recent_reviews: Optional[List[Dict[str, Any]]] = []

# --- Review Schemas ---
class ReviewCreate(BaseModel):
    product_id: int
    rating: float
    review_text: str

class ReviewOut(BaseModel):
    id: int
    product_id: int
    user_id: Optional[int] = None
    user_name: str
    rating: float
    review_text: str
    sentiment_score: float
    sentiment_label: str
    created_at: datetime

    class Config:
        from_attributes = True

class ReviewAnalysisOut(BaseModel):
    positive_percentage: float
    negative_percentage: float
    neutral_percentage: float
    total_reviews: int
    average_rating: float
    most_mentioned_advantages: List[str]
    most_mentioned_complaints: List[str]
    ai_summary: str
    confidence_score: float

# --- Wishlist Schemas ---
class WishlistCreate(BaseModel):
    product_id: int
    target_price: Optional[float] = None
    alert_enabled: Optional[bool] = True

class WishlistOut(BaseModel):
    id: int
    user_id: int
    product_id: int
    target_price: Optional[float] = None
    alert_enabled: bool
    created_at: datetime
    product: ProductOut

    class Config:
        from_attributes = True

# --- Comparison Schemas ---
class CompareRequest(BaseModel):
    product_ids: List[int]

class CompareResponse(BaseModel):
    products: List[ProductOut]
    common_specs: List[str]
    specs_matrix: Dict[str, Dict[str, Any]]
    ai_verdict: Dict[str, Any]
    chart_data: Dict[str, Any]

# --- AI Chat / Agent Schemas ---
class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: Optional[str] = None
    agent_name: Optional[str] = None
    products: Optional[List[ProductOut]] = None
    comparison_data: Optional[Dict[str, Any]] = None
    review_analysis: Optional[Dict[str, Any]] = None
    suggested_followups: Optional[List[str]] = None

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    history: Optional[List[Dict[str, str]]] = []
    preferred_category: Optional[str] = None
    budget_limit: Optional[float] = None

class ChatResponse(BaseModel):
    reply: str
    agent_name: str
    intent: str
    products: List[ProductOut] = []
    comparison_data: Optional[Dict[str, Any]] = None
    review_analysis: Optional[Dict[str, Any]] = None
    budget_advice: Optional[Dict[str, Any]] = None
    suggested_followups: List[str] = []

# --- Voice / Vision Schemas ---
class VisionSearchResponse(BaseModel):
    detected_label: str
    detected_category: str
    confidence: float
    matched_products: List[ProductOut]
    visual_features: Dict[str, Any]

# --- Price Tracker Alert Schemas ---
class PriceAlertUpdate(BaseModel):
    target_price: float
    alert_enabled: bool
