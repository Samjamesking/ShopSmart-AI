from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.database import get_db
from app.models import Wishlist, Product, User
from app.auth import get_current_user
from app.routers.products import format_product_out

router = APIRouter(prefix="/wishlist", tags=["Smart Wishlist"])

class WishlistAddRequest(BaseModel):
    product_id: int
    target_price: Optional[float] = None
    alert_enabled: Optional[bool] = True

class WishlistUpdateRequest(BaseModel):
    target_price: Optional[float] = None
    alert_enabled: Optional[bool] = None

@router.get("")
def get_user_wishlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entries = db.query(Wishlist).filter(Wishlist.user_id == current_user.id).all()
    results = []
    for entry in entries:
        prod = entry.product
        if not prod:
            continue
        p_dict = format_product_out(prod)
        is_target_met = (entry.target_price is not None) and (prod.price <= entry.target_price)
        results.append({
            "id": entry.id,
            "product_id": prod.id,
            "target_price": entry.target_price or round(prod.price * 0.9),
            "alert_enabled": entry.alert_enabled,
            "is_target_met": is_target_met,
            "created_at": entry.created_at,
            "product": p_dict
        })
    return results

@router.post("")
def add_to_wishlist(
    item_in: WishlistAddRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = db.query(Product).filter(Product.id == item_in.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    existing = db.query(Wishlist).filter(
        Wishlist.user_id == current_user.id,
        Wishlist.product_id == item_in.product_id
    ).first()

    if existing:
        return {"message": "Product already in wishlist", "id": existing.id}

    target_price = item_in.target_price if item_in.target_price is not None else round(product.price * 0.9)
    new_entry = Wishlist(
        user_id=current_user.id,
        product_id=product.id,
        target_price=target_price,
        alert_enabled=item_in.alert_enabled if item_in.alert_enabled is not None else True
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)

    return {"message": "Product added to wishlist", "id": new_entry.id}

@router.delete("/{product_id}")
def remove_from_wishlist(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entry = db.query(Wishlist).filter(
        Wishlist.user_id == current_user.id,
        Wishlist.product_id == product_id
    ).first()

    if not entry:
        raise HTTPException(status_code=404, detail="Product not found in wishlist")

    db.delete(entry)
    db.commit()
    return {"message": "Removed from wishlist successfully"}

@router.put("/{product_id}")
def update_wishlist_item(
    product_id: int,
    update_data: WishlistUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entry = db.query(Wishlist).filter(
        Wishlist.user_id == current_user.id,
        Wishlist.product_id == product_id
    ).first()

    if not entry:
        raise HTTPException(status_code=404, detail="Item not found in wishlist")

    if update_data.target_price is not None:
        entry.target_price = update_data.target_price
    if update_data.alert_enabled is not None:
        entry.alert_enabled = update_data.alert_enabled

    db.commit()
    return {"message": "Wishlist item updated successfully"}
