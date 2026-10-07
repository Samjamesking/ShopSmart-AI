from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Review, Product, User
from app.schemas import ReviewCreate, ReviewOut, ReviewAnalysisOut
from app.auth import get_optional_current_user
from app.agents.review_analyzer import ReviewAnalyzerAgent
from datetime import datetime

router = APIRouter(prefix="/reviews", tags=["Reviews & NLP Sentiment"])

@router.get("/product/{product_id}")
def get_product_reviews(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    analyzer = ReviewAnalyzerAgent()
    analysis = analyzer.analyze_product_reviews(product_id, db)

    reviews = db.query(Review).filter(Review.product_id == product_id).order_by(Review.created_at.desc()).all()

    return {
        "analysis": analysis,
        "reviews": [
            {
                "id": r.id,
                "user_name": r.user_name,
                "rating": r.rating,
                "review_text": r.review_text,
                "sentiment_label": r.sentiment_label,
                "sentiment_score": r.sentiment_score,
                "created_at": r.created_at.strftime("%b %d, %Y")
            }
            for r in reviews
        ]
    }

@router.post("")
def create_review(
    review_in: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_current_user)
):
    product = db.query(Product).filter(Product.id == review_in.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Simple sentiment scoring
    text_lower = review_in.review_text.lower()
    pos_words = ["good", "great", "excellent", "love", "amazing", "worth", "best", "super", "flawless", "fast"]
    neg_words = ["bad", "worst", "poor", "broken", "slow", "terrible", "waste", "defect", "hate", "issue"]
    
    score = 0.0
    for w in pos_words:
        if w in text_lower:
            score += 0.2
    for w in neg_words:
        if w in text_lower:
            score -= 0.3

    score = max(-1.0, min(1.0, score + (review_in.rating - 3.0) * 0.3))
    label = "positive" if score > 0.15 else ("negative" if score < -0.15 else "neutral")

    user_name = current_user.name if current_user else "Verified Shopper"
    user_id = current_user.id if current_user else None

    new_rev = Review(
        product_id=product.id,
        user_id=user_id,
        user_name=user_name,
        rating=review_in.rating,
        review_text=review_in.review_text,
        sentiment_score=round(score, 2),
        sentiment_label=label,
        created_at=datetime.utcnow()
    )
    db.add(new_rev)

    # Recalculate product rating
    all_revs = db.query(Review).filter(Review.product_id == product.id).all()
    new_avg = round((sum(r.rating for r in all_revs) + review_in.rating) / (len(all_revs) + 1), 1)
    product.rating = new_avg
    product.rating_count = (product.rating_count or 0) + 1

    db.commit()
    db.refresh(new_rev)

    return {
        "message": "Review submitted successfully",
        "review_id": new_rev.id,
        "sentiment_label": label,
        "new_product_rating": new_avg
    }
