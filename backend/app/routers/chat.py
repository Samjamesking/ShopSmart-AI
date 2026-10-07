from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database import get_db
from app.models import User, SearchHistory
from app.schemas import ChatRequest, ChatResponse
from app.auth import get_optional_current_user
from app.agents.agent_coordinator import coordinator
from app.routers.products import format_product_out

router = APIRouter(prefix="/chat", tags=["AI Shopping Assistant"])

@router.post("", response_model=ChatResponse)
def chat_with_assistant(
    chat_req: ChatRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    # Log user query in search history
    if current_user and chat_req.message.strip():
        try:
            db.add(SearchHistory(user_id=current_user.id, query=chat_req.message.strip()))
            db.commit()
        except Exception:
            db.rollback()

    # Coordinate via Multi-Agent AI system
    result = coordinator.coordinate(
        message=chat_req.message,
        db=db,
        user=current_user,
        preferred_category=chat_req.preferred_category
    )

    formatted_products = [format_product_out(p) for p in result.get("products", [])]

    return {
        "reply": result.get("reply", "Here are the top matches I found."),
        "agent_name": result.get("agent_name", "Product Finder Agent"),
        "intent": result.get("intent", "product_finder"),
        "products": formatted_products,
        "comparison_data": result.get("comparison_data"),
        "review_analysis": result.get("review_analysis"),
        "budget_advice": result.get("budget_advice"),
        "suggested_followups": result.get("suggested_followups", [])
    }

@router.get("/recent-searches")
def get_recent_searches(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    if current_user:
        searches = db.query(SearchHistory).filter(SearchHistory.user_id == current_user.id).order_by(SearchHistory.timestamp.desc()).limit(6).all()
        if searches:
            return [s.query for s in searches]

    # Defaults matching design mockups
    return [
        "gaming laptop under 80000",
        "iPhone 16 vs Samsung S26",
        "best headphones for coding",
        "gifts under 2000"
    ]
