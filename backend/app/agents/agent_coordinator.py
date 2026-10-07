import re
import json
import httpx
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.config import settings
from app.models import AgentLog, User
from app.agents.product_finder import ProductFinderAgent
from app.agents.comparison_agent import ComparisonAgent
from app.agents.review_analyzer import ReviewAnalyzerAgent
from app.agents.budget_planner import BudgetPlannerAgent
from app.agents.trend_analyst import TrendAnalystAgent

class AgentCoordinator:
    def __init__(self):
        self.finder = ProductFinderAgent()
        self.comparator = ComparisonAgent()
        self.reviewer = ReviewAnalyzerAgent()
        self.budgeter = BudgetPlannerAgent()
        self.trend = TrendAnalystAgent()

    def coordinate(
        self,
        message: str,
        db: Session,
        user: Optional[User] = None,
        preferred_category: Optional[str] = None
    ) -> Dict[str, Any]:
        msg_clean = message.lower().strip()
        user_prefs = {}
        if user and user.preferences:
            try:
                user_prefs = json.loads(user.preferences)
            except Exception:
                pass

        # 1. Intent Classification
        if any(kw in msg_clean for kw in ["compare", " vs ", "versus", "difference between", "better than"]):
            selected_agent = self.comparator
            result = selected_agent.execute(message, db, user_prefs)
        elif any(kw in msg_clean for kw in ["review", "sentiment", "complaint", "is it good", "worth buying", "pros and cons", "feedback"]):
            selected_agent = self.reviewer
            result = selected_agent.execute(message, db, user_prefs)
        elif any(kw in msg_clean for kw in ["under ", "below ", "budget", "cheapest", "gift for", "affordable", "save money"]):
            selected_agent = self.budgeter
            result = selected_agent.execute(message, db, user_prefs)
        elif any(kw in msg_clean for kw in ["trending", "popular", "best seller", "bestseller", "what's hot", "top deals"]):
            selected_agent = self.trend
            result = selected_agent.execute(message, db, user_prefs)
        else:
            selected_agent = self.finder
            result = selected_agent.execute(message, db, user_prefs)

        # 2. Optional Live LLM Enrichment if API key exists
        if settings.GROQ_API_KEY:
            try:
                enriched = self._enrich_with_groq(message, result.get("reply", ""))
                if enriched:
                    result["reply"] = enriched
            except Exception:
                pass
        elif settings.GEMINI_API_KEY:
            try:
                enriched = self._enrich_with_gemini(message, result.get("reply", ""))
                if enriched:
                    result["reply"] = enriched
            except Exception:
                pass
        elif settings.OPENAI_API_KEY:
            try:
                enriched = self._enrich_with_openai(message, result.get("reply", ""))
                if enriched:
                    result["reply"] = enriched
            except Exception:
                pass

        # 3. Log agent action for Admin Dashboard tracking
        try:
            log_entry = AgentLog(
                user_id=user.id if user else None,
                agent_name=result.get("agent_name", "Coordinator"),
                prompt=message[:500],
                response_summary=result.get("reply", "")[:500]
            )
            db.add(log_entry)
            db.commit()
        except Exception:
            db.rollback()

        return result

    def _enrich_with_groq(self, prompt: str, base_reply: str) -> Optional[str]:
        headers = {"Authorization": f"Bearer {settings.GROQ_API_KEY}"}
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {"role": "system", "content": "You are ShopSmart AI, a helpful, polite, and knowledgeable shopping assistant."},
                {"role": "user", "content": f"User asked: '{prompt}'. Polished base response: '{base_reply}'. Provide an engaging 2-sentence response referencing these options."}
            ],
            "max_tokens": 150
        }
        with httpx.Client(timeout=4.0) as client:
            resp = client.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                return data["choices"][0]["message"]["content"]
        return None

    def _enrich_with_gemini(self, prompt: str, base_reply: str) -> Optional[str]:
        # Quick call to Gemini API if available
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
        system_msg = f"You are ShopSmart AI, a helpful, polite, and knowledgeable shopping assistant. Enhance this response for the user query '{prompt}':\n\n{base_reply}"
        payload = {"contents": [{"parts": [{"text": system_msg}]}]}
        with httpx.Client(timeout=4.0) as client:
            resp = client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                return data["candidates"][0]["content"]["parts"][0]["text"]
        return None

    def _enrich_with_openai(self, prompt: str, base_reply: str) -> Optional[str]:
        headers = {"Authorization": f"Bearer {settings.OPENAI_API_KEY}"}
        url = "https://api.openai.com/v1/chat/completions"
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": "You are ShopSmart AI, an ultra-smart e-commerce shopping concierge."},
                {"role": "user", "content": f"User asked: '{prompt}'. Polished base response: '{base_reply}'. Provide an engaging 2-sentence response referencing these options."}
            ],
            "max_tokens": 150
        }
        with httpx.Client(timeout=4.0) as client:
            resp = client.post(url, headers=headers, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                return data["choices"][0]["message"]["content"]
        return None

coordinator = AgentCoordinator()
