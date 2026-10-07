import re
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.rag.rag_service import rag_service
from app.models import Product

class ProductFinderAgent:
    name = "Product Finder Agent"

    def execute(self, query: str, db: Session, user_preferences: dict = None) -> Dict[str, Any]:
        # Extract potential price constraints from query
        max_price = None
        min_price = None
        
        # Matches "under ₹80,000", "under 80000", "below 50k", "< 2000"
        under_match = re.search(r'(?:under|below|less than|within|up to|<)\s*(?:₹|rs\.?|inr)?\s*([\d,]+)\s*(k)?', query, re.I)
        if under_match:
            raw_val = under_match.group(1).replace(",", "")
            val = float(raw_val)
            if under_match.group(2) and under_match.group(2).lower() == 'k':
                val *= 1000
            max_price = val

        above_match = re.search(r'(?:above|more than|over|>)\s*(?:₹|rs\.?|inr)?\s*([\d,]+)\s*(k)?', query, re.I)
        if above_match:
            raw_val = above_match.group(1).replace(",", "")
            val = float(raw_val)
            if above_match.group(2) and above_match.group(2).lower() == 'k':
                val *= 1000
            min_price = val

        # Extract brand if mentioned
        brands = ["apple", "samsung", "asus", "dell", "hp", "lenovo", "acer", "sony", "nike", "adidas", "puma", "boAt", "philips", "lg"]
        detected_brand = None
        for b in brands:
            if re.search(r'\b' + b + r'\b', query, re.I):
                detected_brand = b
                break

        # Search products via RAG
        products = rag_service.retrieve_relevant_products(
            db=db,
            query=query,
            limit=6,
            max_price=max_price,
            min_price=min_price,
            brand=detected_brand
        )

        # Build conversational reply
        if not products:
            reply = (
                f"I couldn't find exact matches for '{query}'. "
                f"Try broadening your search criteria or adjusting your price filters."
            )
            followups = [
                "Show best gaming laptops",
                "Best wireless headphones under ₹5,000",
                "Trending smartphones"
            ]
        else:
            top_prod = products[0]
            price_str = f" under ₹{int(max_price):,}" if max_price else ""
            reply = (
                f"Here are the top-rated recommendations matching '{query}'{price_str}. "
                f"I highlighted options with exceptional customer satisfaction and solid performance. "
                f"Top pick: **{top_prod.name}** by {top_prod.brand} at ₹{int(top_prod.price):,}."
            )
            followups = [
                f"Compare {products[0].name} and {products[1].name}" if len(products) > 1 else "Compare top options",
                f"Show customer reviews for {top_prod.name}",
                f"Check price history of {top_prod.name}"
            ]

        return {
            "agent_name": self.name,
            "intent": "product_finder",
            "reply": reply,
            "products": products,
            "suggested_followups": followups
        }
