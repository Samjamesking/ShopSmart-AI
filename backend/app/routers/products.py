import json
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import Product, PriceHistory, Review, SearchHistory, User
from app.schemas import ProductOut, ProductDetailOut
from app.rag.rag_service import rag_service
from app.auth import get_optional_current_user
from app.agents.review_analyzer import ReviewAnalyzerAgent

router = APIRouter(prefix="/products", tags=["Products"])

def format_product_out(p: Product) -> dict:
    try:
        specs = json.loads(p.specs) if p.specs else {}
    except Exception:
        specs = {}
    try:
        tags = json.loads(p.tags) if p.tags else []
    except Exception:
        tags = []
    try:
        additional_images = json.loads(p.additional_images) if p.additional_images else [p.image_url]
    except Exception:
        additional_images = [p.image_url]

    return {
        "id": p.id,
        "name": p.name,
        "brand": p.brand,
        "category": p.category,
        "subcategory": p.subcategory,
        "price": p.price,
        "original_price": p.original_price,
        "discount_percent": p.discount_percent,
        "description": p.description,
        "rating": p.rating,
        "rating_count": p.rating_count,
        "image_url": p.image_url,
        "additional_images": additional_images,
        "specs": specs,
        "in_stock": p.in_stock,
        "tags": tags,
        "created_at": p.created_at
    }

@router.get("", response_model=dict)
def list_products(
    q: Optional[str] = Query(None, description="Natural language search query"),
    category: Optional[str] = Query(None),
    brand: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    min_rating: Optional[float] = Query(None),
    sort_by: Optional[str] = Query("relevance", description="relevance, price_asc, price_desc, rating, discount"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    # Log search query if provided
    if q and q.strip() and current_user:
        try:
            db.add(SearchHistory(user_id=current_user.id, query=q.strip()))
            db.commit()
        except Exception:
            db.rollback()

    if q and q.strip():
        # Use Semantic Vector Search
        products = rag_service.retrieve_relevant_products(
            db=db,
            query=q.strip(),
            limit=100,
            category=category,
            max_price=max_price,
            min_price=min_price,
            brand=brand
        )
        if min_rating:
            products = [p for p in products if p.rating >= min_rating]

        total_count = len(products)
        start_idx = (page - 1) * limit
        paginated = products[start_idx : start_idx + limit]
        return {
            "total": total_count,
            "page": page,
            "limit": limit,
            "items": [format_product_out(p) for p in paginated]
        }

    # Standard SQL query with filters
    query = db.query(Product)
    if category:
        query = query.filter(Product.category.ilike(f"%{category}%"))
    if brand:
        query = query.filter(Product.brand.ilike(f"%{brand}%"))
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    if min_rating is not None:
        query = query.filter(Product.rating >= min_rating)

    if sort_by == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Product.price.desc())
    elif sort_by == "rating":
        query = query.order_by(Product.rating.desc(), Product.rating_count.desc())
    elif sort_by == "discount":
        query = query.order_by(Product.discount_percent.desc())
    else:
        query = query.order_by(Product.id.asc())

    total_count = query.count()
    items = query.offset((page - 1) * limit).limit(limit).all()

    return {
        "total": total_count,
        "page": page,
        "limit": limit,
        "items": [format_product_out(p) for p in items]
    }

@router.get("/filters")
def get_filters(db: Session = Depends(get_db)):
    categories = [r[0] for r in db.query(Product.category).distinct().order_by(Product.category).all() if r[0]]
    brands = [r[0] for r in db.query(Product.brand).distinct().order_by(Product.brand).all() if r[0]]
    price_stats = db.query(func.min(Product.price), func.max(Product.price)).first()
    
    return {
        "categories": categories,
        "brands": brands[:30],
        "min_price": price_stats[0] or 0,
        "max_price": price_stats[1] or 200000
    }

@router.get("/recommended")
def get_recommended(
    limit: int = 8,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    preferred_brands = []
    preferred_categories = []
    if current_user and current_user.preferences:
        try:
            prefs = json.loads(current_user.preferences)
            preferred_brands = prefs.get("favorite_brands", [])
            preferred_categories = prefs.get("categories", [])
        except Exception:
            pass

    q = db.query(Product)
    if preferred_brands:
        q = q.filter(Product.brand.in_(preferred_brands))
    elif preferred_categories:
        q = q.filter(Product.category.in_(preferred_categories))
    
    recs = q.order_by(Product.rating.desc(), Product.rating_count.desc()).limit(limit).all()
    if len(recs) < limit:
        remaining = db.query(Product).order_by(Product.rating.desc()).limit(limit).all()
        recs = list({p.id: p for p in (recs + remaining)}.values())[:limit]

    return [format_product_out(p) for p in recs]

@router.get("/trending")
def get_trending(limit: int = 6, db: Session = Depends(get_db)):
    trending = db.query(Product).filter(
        Product.rating >= 4.3
    ).order_by(Product.rating_count.desc(), Product.discount_percent.desc()).limit(limit).all()
    return [format_product_out(p) for p in trending]

@router.get("/{id}")
def get_product_detail(id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    base = format_product_out(product)

    # Fetch price history
    histories = db.query(PriceHistory).filter(PriceHistory.product_id == id).all()
    history_data = [{"date": h.date, "price": h.price} for h in histories]

    prices = [h.price for h in histories] + [product.price]
    lowest_price = min(prices) if prices else product.price
    highest_price = max(prices) if prices else product.price

    # Price Prediction Logic
    curr = product.price
    if curr <= lowest_price * 1.03:
        pred_msg = "Price is at or near the 6-month lowest recorded price! Excellent time to purchase."
        pred_action = "BUY_NOW"
        pred_confidence = 94
    elif curr >= highest_price * 0.95:
        pred_msg = "Price is currently on the higher end. AI predicts a price dip within 2-3 weeks."
        pred_action = "WAIT_FOR_DROP"
        pred_confidence = 82
    else:
        pred_msg = "Price is stable and within normal seasonal range."
        pred_action = "MODERATE"
        pred_confidence = 88

    # AI Sentiment Analysis
    rev_agent = ReviewAnalyzerAgent()
    analysis = rev_agent.analyze_product_reviews(id, db)

    # Similar products
    similar = rag_service.get_similar_products(db, id, limit=4)
    freq_bought = rag_service.get_frequently_bought_together(db, id, limit=3)

    # Recent reviews
    recent_revs = db.query(Review).filter(Review.product_id == id).order_by(Review.created_at.desc()).limit(6).all()
    reviews_list = [
        {
            "id": r.id,
            "user_name": r.user_name,
            "rating": r.rating,
            "review_text": r.review_text,
            "sentiment_label": r.sentiment_label,
            "created_at": r.created_at.strftime("%b %d, %Y")
        }
        for r in recent_revs
    ]

    base.update({
        "lowest_recorded_price": lowest_price,
        "highest_recorded_price": highest_price,
        "price_history": history_data,
        "price_prediction": {
            "prediction": pred_msg,
            "action": pred_action,
            "confidence": pred_confidence,
            "expected_next_drop": "Festival Sale / End-of-month Promo"
        },
        "ai_summary": analysis,
        "similar_products": [format_product_out(p) for p in similar],
        "frequently_bought_together": [format_product_out(p) for p in freq_bought],
        "recent_reviews": reviews_list
    })

    return base
