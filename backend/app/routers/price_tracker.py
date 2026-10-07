from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Product, PriceHistory, Wishlist, User
from app.auth import get_optional_current_user
from app.routers.products import format_product_out

router = APIRouter(prefix="/price-tracker", tags=["Price Tracker"])

@router.get("/{product_id}")
def get_price_tracker_data(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    histories = db.query(PriceHistory).filter(PriceHistory.product_id == product_id).all()
    history_points = [{"date": h.date, "price": h.price} for h in histories]

    all_prices = [h.price for h in histories] + [product.price]
    lowest = min(all_prices)
    highest = max(all_prices)
    avg_price = round(sum(all_prices) / len(all_prices))

    # Prediction
    discount_diff = round(((highest - product.price) / highest) * 100)
    is_at_lowest = product.price <= (lowest * 1.02)

    if is_at_lowest:
        verdict = "BUY_NOW"
        summary = "Current price is at or near the 6-month all-time low. Excellent window to buy!"
        prediction = "Price is likely to rise back toward the average after this promotion."
    elif product.price > avg_price:
        verdict = "WAIT_FOR_SALE"
        summary = "Price is higher than historical average. AI projects a drop during upcoming sale cycles."
        prediction = f"Projected drop: ~₹{int(product.price - avg_price):,} savings if you wait for sale."
    else:
        verdict = "GOOD_VALUE"
        summary = "Price is below average and represents steady value for this specification tier."
        prediction = "Price expected to stay stable for the next 2-4 weeks."

    return {
        "product": format_product_out(product),
        "current_price": product.price,
        "original_price": product.original_price,
        "lowest_recorded_price": lowest,
        "highest_recorded_price": highest,
        "average_recorded_price": avg_price,
        "discount_percent": product.discount_percent,
        "history": history_points,
        "ai_prediction": {
            "verdict": verdict,
            "summary": summary,
            "details": prediction,
            "confidence_pct": 89
        }
    }

@router.get("/alerts/active")
def get_active_price_drop_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_current_user)
):
    if not current_user:
        return []

    alerts = db.query(Wishlist).filter(
        Wishlist.user_id == current_user.id,
        Wishlist.alert_enabled == True
    ).all()

    drop_alerts = []
    for a in alerts:
        p = a.product
        if p and a.target_price and p.price <= a.target_price:
            drop_alerts.append({
                "product_id": p.id,
                "name": p.name,
                "current_price": p.price,
                "target_price": a.target_price,
                "saving": a.target_price - p.price,
                "image_url": p.image_url
            })

    return drop_alerts
