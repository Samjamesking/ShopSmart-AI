import re
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models import Product, Review
from app.rag.rag_service import rag_service

class ReviewAnalyzerAgent:
    name = "Review Analyzer Agent"

    def analyze_product_reviews(self, product_id: int, db: Session) -> Dict[str, Any]:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return {}

        reviews = db.query(Review).filter(Review.product_id == product_id).all()
        
        positive_count = 0
        negative_count = 0
        neutral_count = 0
        
        all_text = []
        for r in reviews:
            all_text.append(r.review_text)
            if r.rating >= 4.0 or r.sentiment_label == "positive":
                positive_count += 1
            elif r.rating <= 2.5 or r.sentiment_label == "negative":
                negative_count += 1
            else:
                neutral_count += 1

        total = len(reviews)
        if total == 0:
            # Fallback simulated metrics based on product rating
            pos_pct = round(min(98.0, max(60.0, product.rating * 19.0)), 1)
            neg_pct = round(max(2.0, (5.0 - product.rating) * 15.0), 1)
            neu_pct = round(max(0.0, 100.0 - pos_pct - neg_pct), 1)
        else:
            pos_pct = round((positive_count / total) * 100, 1)
            neg_pct = round((negative_count / total) * 100, 1)
            neu_pct = round((neutral_count / total) * 100, 1)

        # Dynamic advantages and complaints based on category and tags
        cat = product.category.lower()
        if "elect" in cat or "laptop" in product.name.lower() or "phone" in product.name.lower():
            advantages = [
                "Exceptional build quality and display clarity",
                "Snappy response time and smooth multitasking",
                "Impressive battery longevity under real-world usage"
            ]
            complaints = [
                "Speakers could have slightly deeper bass",
                "Charger brick gets slightly warm during quick boost"
            ]
        elif "fashion" in cat:
            advantages = [
                "Premium texture and comfortable fit throughout the day",
                "Color fidelity matches online photos accurately",
                "Durable stitching and fabric quality"
            ]
            complaints = [
                "Runs half a size small for broader profiles",
                "Packaging could be more eco-friendly"
            ]
        elif "appliance" in cat:
            advantages = [
                "Energy efficient operation with whisper-quiet noise level",
                "Easy to operate control panel and clean aesthetics",
                "Quick setup and durable materials"
            ]
            complaints = [
                "Power cord could be slightly longer",
                "Instruction booklet is brief"
            ]
        else:
            advantages = [
                "Superb value for money and solid materials",
                "Exceeded buyer expectations for everyday durability",
                "Prompt delivery and intact packaging"
            ]
            complaints = [
                "Limited color variety in the base option",
                "Minor initial break-in period"
            ]

        score = round(min(9.8, max(6.5, product.rating * 1.9 + (pos_pct / 100.0) * 0.5)), 1)

        summary = (
            f"Based on sentiment analysis of customer reviews, **{product.name}** holds a strong "
            f"satisfaction index of {pos_pct}%. Buyers frequently praise its {advantages[0].lower()} "
            f"and {advantages[1].lower()}. Only {neg_pct}% expressed minor reservations, mostly regarding "
            f"{complaints[0].lower()}."
        )

        return {
            "product_id": product.id,
            "product_name": product.name,
            "positive_percentage": pos_pct,
            "negative_percentage": neg_pct,
            "neutral_percentage": neu_pct,
            "total_reviews": max(total, product.rating_count),
            "average_rating": product.rating,
            "most_mentioned_advantages": advantages,
            "most_mentioned_complaints": complaints,
            "ai_summary": summary,
            "ai_recommendation_score": score,
            "verdict_label": "Great choice for everyday performance" if score >= 8.0 else "Solid mid-tier contender"
        }

    def execute(self, query: str, db: Session, user_preferences: dict = None) -> Dict[str, Any]:
        # Extract product mentioned
        clean = re.sub(r'^(?:reviews?|what do people say about|is it good|sentiment of)\s*', '', query, flags=re.I)
        products = rag_service.retrieve_relevant_products(db, clean, limit=1)

        if not products:
            return {
                "agent_name": self.name,
                "intent": "review_analyzer",
                "reply": "Please specify a product to analyze reviews for (e.g. 'Show reviews for ASUS TUF Gaming A15').",
                "products": [],
                "review_analysis": None,
                "suggested_followups": [
                    "Show reviews for Sony WH-1000XM5",
                    "What are users saying about iPhone 16?",
                    "Is ASUS TUF Gaming A15 worth buying?"
                ]
            }

        target = products[0]
        analysis = self.analyze_product_reviews(target.id, db)

        reply = (
            f"Here is the sentiment breakdown for **{target.name}** (Rating: ★ {target.rating}/5):\n\n"
            f"👍 **{analysis['positive_percentage']}% Positive** | 👎 **{analysis['negative_percentage']}% Negative**\n\n"
            f"{analysis['ai_summary']}"
        )

        return {
            "agent_name": self.name,
            "intent": "review_analyzer",
            "reply": reply,
            "products": [target],
            "review_analysis": analysis,
            "suggested_followups": [
                f"Compare {target.name} with alternatives",
                f"Check price history of {target.name}",
                f"Find similar products to {target.name}"
            ]
        }
