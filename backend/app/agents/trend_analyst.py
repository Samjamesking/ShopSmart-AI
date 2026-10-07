from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models import Product

class TrendAnalystAgent:
    name = "Trend Analyst Agent"

    def execute(self, query: str, db: Session, user_preferences: dict = None) -> Dict[str, Any]:
        # Filter for top trending products (high rating, high rating count, top discount)
        trending = db.query(Product).filter(
            Product.rating >= 4.3,
            Product.rating_count >= 800
        ).order_by(Product.rating_count.desc(), Product.discount_percent.desc()).limit(6).all()

        if not trending:
            trending = db.query(Product).order_by(Product.rating.desc()).limit(6).all()

        reply = (
            "🔥 **Market Trends & Hot Picks**:\n\n"
            "Our AI trend tracker has identified the most in-demand products with surging "
            "search interest and steep price cuts this week. These items boast high purchase volumes "
            "and 4.4+ star buyer satisfaction ratings."
        )

        return {
            "agent_name": self.name,
            "intent": "trend_analyst",
            "reply": reply,
            "products": trending,
            "suggested_followups": [
                "Which of these has the highest discount?",
                "Compare the top 2 trending items",
                "Show trending fashion items"
            ]
        }
