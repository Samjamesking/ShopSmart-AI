import re
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.rag.rag_service import rag_service
from app.models import Product

class BudgetPlannerAgent:
    name = "Budget Planner Agent"

    def execute(self, query: str, db: Session, user_preferences: dict = None) -> Dict[str, Any]:
        # Extract target budget
        budget_match = re.search(r'(?:under|below|budget|within|up to|max|<)\s*(?:₹|rs\.?|inr)?\s*([\d,]+)\s*(k)?', query, re.I)
        target_budget = 50000.0  # default
        if budget_match:
            raw = budget_match.group(1).replace(",", "")
            target_budget = float(raw)
            if budget_match.group(2) and budget_match.group(2).lower() == 'k':
                target_budget *= 1000

        # Extract target intent (e.g. "gifts", "sister", "student", "gaming", "laptop", "headphones")
        products = rag_service.retrieve_relevant_products(
            db=db,
            query=query,
            limit=6,
            max_price=target_budget
        )

        if not products:
            # Fallback to products strictly under budget
            products = db.query(Product).filter(Product.price <= target_budget).order_by(Product.rating.desc()).limit(5).all()

        total_savings = 0.0
        best_deal = None
        max_discount = -1
        for p in products:
            saving = max(0.0, p.original_price - p.price)
            total_savings += saving
            if p.discount_percent > max_discount:
                max_discount = p.discount_percent
                best_deal = p

        reply = (
            f"Here are the highest-rated options tailored strictly within your budget of **₹{int(target_budget):,}**.\n\n"
            f"💡 **Budget Insight**: Buying from these options saves you an average of up to "
            f"**₹{int(total_savings / max(1, len(products))):,}** off MRP. "
            f"The best deal is **{best_deal.name if best_deal else 'N/A'}** with a **{max_discount}% discount**!"
        )

        return {
            "agent_name": self.name,
            "intent": "budget_planner",
            "reply": reply,
            "products": products,
            "budget_advice": {
                "max_budget": target_budget,
                "average_price": round(sum(p.price for p in products) / max(1, len(products))),
                "average_savings": round(total_savings / max(1, len(products))),
                "top_deal_id": best_deal.id if best_deal else None
            },
            "suggested_followups": [
                f"Compare top 2 options under ₹{int(target_budget):,}",
                f"Show customer reviews for {products[0].name}" if products else "Show reviews",
                f"Can you find anything even cheaper under ₹{int(target_budget * 0.7):,}?"
            ]
        }
