from typing import List
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Product
from app.agents.comparison_agent import ComparisonAgent
from app.routers.products import format_product_out

router = APIRouter(prefix="/compare", tags=["Product Comparison"])

@router.post("")
def compare_products(
    product_ids: List[int] = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    if len(product_ids) < 2:
        raise HTTPException(status_code=400, detail="Please select at least 2 products to compare.")
    
    agent = ComparisonAgent()
    comp_result = agent.compare_products_by_ids(product_ids[:4], db)

    if not comp_result or not comp_result.get("products"):
        raise HTTPException(status_code=404, detail="Selected products could not be found.")

    return {
        "products": comp_result["products"],
        "common_specs": comp_result["common_specs"],
        "specs_matrix": comp_result["specs_matrix"],
        "pros_cons": comp_result["pros_cons"],
        "ai_verdict": comp_result["ai_verdict"],
        "chart_data": comp_result["chart_data"]
    }
