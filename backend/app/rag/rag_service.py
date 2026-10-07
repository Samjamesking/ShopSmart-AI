import json
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models import Product, Review
from app.rag.embeddings import vector_engine

class RAGService:
    def __init__(self):
        pass

    def get_product_dict(self, db: Session) -> Dict[int, Dict[str, Any]]:
        products = db.query(Product).all()
        result = {}
        for p in products:
            try:
                specs = json.loads(p.specs) if p.specs else {}
            except Exception:
                specs = {}
            try:
                tags = json.loads(p.tags) if p.tags else []
            except Exception:
                tags = []
            result[p.id] = {
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
                "specs": specs,
                "tags": tags,
                "in_stock": p.in_stock
            }
        return result

    def ensure_index_built(self, db: Session):
        if not vector_engine.is_fitted:
            p_dict = self.get_product_dict(db)
            vector_engine.build_index(list(p_dict.values()))

    def retrieve_relevant_products(
        self,
        db: Session,
        query: str,
        limit: int = 10,
        category: Optional[str] = None,
        max_price: Optional[float] = None,
        min_price: Optional[float] = None,
        brand: Optional[str] = None
    ) -> List[Product]:
        self.ensure_index_built(db)
        p_dict = self.get_product_dict(db)
        
        scored = vector_engine.semantic_search(
            query=query,
            top_k=limit,
            category=category,
            max_price=max_price,
            min_price=min_price,
            brand=brand,
            products_dict=p_dict
        )

        matched_ids = [pid for pid, score in scored]
        if not matched_ids:
            # Fallback to keyword matching on name/brand/category
            q = db.query(Product)
            if category:
                q = q.filter(Product.category.ilike(f"%{category}%"))
            if max_price:
                q = q.filter(Product.price <= max_price)
            if min_price:
                q = q.filter(Product.price >= min_price)
            if brand:
                q = q.filter(Product.brand.ilike(f"%{brand}%"))
            
            terms = query.split()
            if terms:
                first_term = terms[0]
                q = q.filter(
                    (Product.name.ilike(f"%{first_term}%")) |
                    (Product.brand.ilike(f"%{first_term}%")) |
                    (Product.description.ilike(f"%{first_term}%"))
                )
            return q.limit(limit).all()

        # Preserve order of relevance
        products_map = {p.id: p for p in db.query(Product).filter(Product.id.in_(matched_ids)).all()}
        return [products_map[pid] for pid in matched_ids if pid in products_map]

    def get_similar_products(self, db: Session, product_id: int, limit: int = 4) -> List[Product]:
        target = db.query(Product).filter(Product.id == product_id).first()
        if not target:
            return []
        
        query = f"{target.brand} {target.category} {target.subcategory or ''} {target.name}"
        similar = self.retrieve_relevant_products(db, query, limit=limit + 1, category=target.category)
        return [p for p in similar if p.id != product_id][:limit]

    def get_frequently_bought_together(self, db: Session, product_id: int, limit: int = 3) -> List[Product]:
        target = db.query(Product).filter(Product.id == product_id).first()
        if not target:
            return []
        
        # Cross-category pairings
        complementary_categories = {
            "Electronics": ["Electronics", "Home Appliances"],
            "Fashion": ["Fashion"],
            "Home Appliances": ["Home Appliances", "Electronics"],
            "Sports Equipment": ["Fashion", "Sports Equipment"],
            "Books": ["Books", "Electronics"]
        }
        
        target_cat = target.category
        allowed_cats = complementary_categories.get(target_cat, [target_cat])
        
        # Find high-rated accessories or complementary items
        results = db.query(Product).filter(
            Product.category.in_(allowed_cats),
            Product.id != product_id,
            Product.price < target.price * 0.8
        ).order_by(Product.rating.desc()).limit(limit).all()
        return results

rag_service = RAGService()
