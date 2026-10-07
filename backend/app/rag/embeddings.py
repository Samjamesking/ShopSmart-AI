import re
import numpy as np
from typing import List, Dict, Any, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class VectorSearchEngine:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            stop_words='english',
            sublinear_tf=True,
            max_features=10000
        )
        self.product_ids: List[int] = []
        self.product_corpus: List[str] = []
        self.tfidf_matrix = None
        self.is_fitted = False

    def build_index(self, products: List[Dict[str, Any]]):
        if not products:
            return
        
        self.product_ids = []
        self.product_corpus = []

        for p in products:
            self.product_ids.append(p["id"])
            # Combine textual features
            tags_str = " ".join(p.get("tags", [])) if isinstance(p.get("tags"), list) else str(p.get("tags", ""))
            specs_dict = p.get("specs", {})
            if isinstance(specs_dict, dict):
                specs_str = " ".join([f"{k} {v}" for k, v in specs_dict.items()])
            else:
                specs_str = str(specs_dict)
            
            doc = (
                f"{p.get('name', '')} {p.get('brand', '')} {p.get('brand', '')} "
                f"{p.get('category', '')} {p.get('subcategory', '')} "
                f"{p.get('description', '')} {tags_str} {specs_str}"
            )
            self.product_corpus.append(doc)

        self.tfidf_matrix = self.vectorizer.fit_transform(self.product_corpus)
        self.is_fitted = True

    def semantic_search(
        self,
        query: str,
        top_k: int = 20,
        category: str = None,
        max_price: float = None,
        min_price: float = None,
        brand: str = None,
        products_dict: Dict[int, Dict[str, Any]] = None
    ) -> List[Tuple[int, float]]:
        """
        Performs semantic vector search with cosine similarity and metadata filters.
        Returns list of (product_id, similarity_score).
        """
        if not self.is_fitted or not query.strip():
            return []

        clean_query = query.lower().strip()
        query_vec = self.vectorizer.transform([clean_query])
        similarities = cosine_similarity(query_vec, self.tfidf_matrix)[0]

        scored_results = []
        for idx, score in enumerate(similarities):
            pid = self.product_ids[idx]
            final_score = float(score)

            if products_dict and pid in products_dict:
                prod = products_dict[pid]
                
                # Filter checks
                if category and prod.get("category", "").lower() != category.lower():
                    continue
                if brand and prod.get("brand", "").lower() != brand.lower():
                    continue
                if max_price is not None and prod.get("price", 0) > max_price:
                    continue
                if min_price is not None and prod.get("price", 0) < min_price:
                    continue

                # Hybrid boost for query tokens in name/brand
                p_name_lower = prod.get("name", "").lower()
                p_brand_lower = prod.get("brand", "").lower()
                for token in re.findall(r'\b\w+\b', clean_query):
                    if len(token) > 2:
                        if token in p_name_lower:
                            final_score += 0.15
                        if token in p_brand_lower:
                            final_score += 0.20

                # Slight rating boost (normalized 0 to 0.05)
                final_score += (prod.get("rating", 4.0) / 5.0) * 0.05

            if final_score > 0.05:
                scored_results.append((pid, final_score))

        # Sort descending by final score
        scored_results.sort(key=lambda x: x[1], reverse=True)
        return scored_results[:top_k]

# Global search engine singleton
vector_engine = VectorSearchEngine()
