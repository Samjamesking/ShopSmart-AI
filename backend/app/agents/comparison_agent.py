import json
import re
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models import Product
from app.rag.rag_service import rag_service

class ComparisonAgent:
    name = "Comparison Agent"

    def compare_products_by_ids(self, product_ids: List[int], db: Session) -> Dict[str, Any]:
        products = db.query(Product).filter(Product.id.in_(product_ids)).all()
        return self._generate_comparison_result(products)

    def execute(self, query: str, db: Session, user_preferences: dict = None) -> Dict[str, Any]:
        # Identify comparison targets from query like "Compare iPhone 16 and Samsung S25"
        # Split by "and", "vs", "versus", "with", ","
        clean = re.sub(r'^(?:compare|diff|difference between)\s*', '', query, flags=re.I)
        parts = re.split(r'\s+(?:vs\.?|versus|and|with)\s+|,', clean)
        parts = [p.strip() for p in parts if p.strip()]

        matched_products = []
        if len(parts) >= 2:
            for part in parts[:3]:
                res = rag_service.retrieve_relevant_products(db, part, limit=1)
                if res and res[0] not in matched_products:
                    matched_products.append(res[0])

        if len(matched_products) < 2:
            # Fallback to top 2 products matching general query
            matched_products = rag_service.retrieve_relevant_products(db, query, limit=2)

        if len(matched_products) < 2:
            return {
                "agent_name": self.name,
                "intent": "comparison",
                "reply": "Please specify at least two products to compare (e.g. 'Compare iPhone 16 and Samsung S25').",
                "products": matched_products,
                "comparison_data": None,
                "suggested_followups": [
                    "Compare iPhone 16 and Samsung S25",
                    "Compare MacBook Air M3 and Dell Inspiron 15",
                    "Compare ASUS TUF Gaming and Acer Nitro V"
                ]
            }

        comp_data = self._generate_comparison_result(matched_products)
        p1 = matched_products[0]
        p2 = matched_products[1]

        reply = (
            f"Here is an in-depth AI comparison between **{p1.name}** (₹{int(p1.price):,}) "
            f"and **{p2.name}** (₹{int(p2.price):,}).\n\n"
            f"🏆 **AI Verdict**: {comp_data['ai_verdict'].get('summary', '')}"
        )

        return {
            "agent_name": self.name,
            "intent": "comparison",
            "reply": reply,
            "products": matched_products,
            "comparison_data": comp_data,
            "suggested_followups": [
                f"Show price history of {comp_data['ai_verdict']['winner']}",
                f"Show customer reviews for {p1.name}",
                f"Find alternatives to {p2.name} under ₹{int(p2.price):,}"
            ]
        }

    def _generate_comparison_result(self, products: List[Product]) -> Dict[str, Any]:
        parsed_specs = []
        all_spec_keys = set()
        
        for p in products:
            try:
                sp = json.loads(p.specs) if p.specs else {}
            except Exception:
                sp = {}
            parsed_specs.append((p, sp))
            all_spec_keys.update(sp.keys())

        # Common attributes
        common_specs = ["Price", "Rating", "Brand", "Category"]
        for key in ["Display", "Processor", "RAM", "Storage", "Battery", "Camera", "Weight", "Warranty"]:
            if key in all_spec_keys:
                common_specs.append(key)
        for key in list(all_spec_keys)[:4]:
            if key not in common_specs:
                common_specs.append(key)

        # Specs Matrix
        specs_matrix = {}
        for spec_key in common_specs:
            specs_matrix[spec_key] = {}
            for p, sp in parsed_specs:
                if spec_key == "Price":
                    specs_matrix[spec_key][str(p.id)] = f"₹{int(p.price):,}"
                elif spec_key == "Rating":
                    specs_matrix[spec_key][str(p.id)] = f"★ {p.rating} / 5 ({p.rating_count} reviews)"
                elif spec_key == "Brand":
                    specs_matrix[spec_key][str(p.id)] = p.brand
                elif spec_key == "Category":
                    specs_matrix[spec_key][str(p.id)] = p.category
                else:
                    specs_matrix[spec_key][str(p.id)] = sp.get(spec_key, "N/A")

        # Determine winner and value
        winner = max(products, key=lambda x: x.rating * 1.5 - (x.price / 100000.0))
        value_pick = min(products, key=lambda x: x.price)
        feature_pick = max(products, key=lambda x: x.rating)

        # Pros and cons
        pros_cons = {}
        for p, sp in parsed_specs:
            pros = [f"High customer satisfaction rating of {p.rating}★"]
            cons = []
            if p.discount_percent > 15:
                pros.append(f"Huge discount of {p.discount_percent}% off original price")
            if p.price <= value_pick.price:
                pros.append("Best price-to-performance ratio in this group")
            else:
                cons.append(f"Priced higher at ₹{int(p.price):,}")
            
            if "Battery" in sp:
                pros.append(f"Equipped with {sp['Battery']}")
            if len(cons) == 0:
                cons.append("Limited color options in stock")
            
            pros_cons[str(p.id)] = {
                "pros": pros[:3],
                "cons": cons[:2]
            }

        # Chart scores (0-100 normalized)
        chart_labels = ["Value", "Performance", "Popularity", "Feature Richness", "Customer Satisfaction"]
        chart_datasets = []
        palette = [
            {"border": "#3b82f6", "bg": "rgba(59, 130, 246, 0.2)"},
            {"border": "#10b981", "bg": "rgba(16, 185, 129, 0.2)"},
            {"border": "#8b5cf6", "bg": "rgba(139, 92, 246, 0.2)"}
        ]
        
        for idx, (p, _) in enumerate(parsed_specs):
            val_score = round(max(30, min(95, 100 - (p.price / max(1, max([x.price for x in products]))) * 50)))
            perf_score = round(p.rating * 18 + 10)
            pop_score = round(min(98, max(60, p.rating_count / 15 + 60)))
            feat_score = round(p.rating * 19)
            csat_score = round(p.rating * 20)
            color = palette[idx % len(palette)]
            chart_datasets.append({
                "label": p.name[:20] + "...",
                "data": [val_score, perf_score, pop_score, feat_score, csat_score],
                "borderColor": color["border"],
                "backgroundColor": color["bg"],
                "borderWidth": 2
            })

        serialized_products = []
        for p, sp in parsed_specs:
            try:
                tags = json.loads(p.tags) if p.tags else []
            except Exception:
                tags = []
            serialized_products.append({
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
                "specs": sp,
                "tags": tags,
                "in_stock": p.in_stock,
                "created_at": p.created_at
            })

        return {
            "products": serialized_products,
            "common_specs": common_specs,
            "specs_matrix": specs_matrix,
            "pros_cons": pros_cons,
            "ai_verdict": {
                "winner": winner.name,
                "winner_id": winner.id,
                "best_value": value_pick.name,
                "best_value_id": value_pick.id,
                "best_performance": feature_pick.name,
                "best_performance_id": feature_pick.id,
                "summary": f"{winner.name} takes the overall recommendation for balanced performance and rating, while {value_pick.name} offers maximum value for budget."
            },
            "chart_data": {
                "labels": chart_labels,
                "datasets": chart_datasets
            }
        }
