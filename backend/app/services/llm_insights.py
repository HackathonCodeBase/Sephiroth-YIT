import json
import os
import socket
import time
from typing import Any, Dict, List

import requests


SYSTEM_PROMPT = """
You are an expert agricultural advisor for Indian farmers.

STRICT INSTRUCTIONS:
- Return only valid JSON
- No markdown
- No extra keys

REQUIRED JSON SHAPE:
{{
    "summary": "short disease summary",
    "remedies": ["step 1", "step 2", "step 3", "step 4", "step 5"],
    "location": "City, State, India",
    "time_context": "best time for action",
    "recovery": "estimated time range",
    "preventive_note": "one preventive note"
}}

CONTEXT:
Crop: {crop}
Disease: {disease}
Confidence: {confidence}%
Severity: {severity}
""".strip()

class LLMInsightsService:
    def __init__(self) -> None:
        self.groq_api_key = os.getenv("GROQ_API_KEY", "")
        self.groq_model = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
        self.groq_api_url = os.getenv("GROQ_API_URL", "https://api.groq.com/openai/v1/chat/completions")

        self.ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
        self.ollama_model = os.getenv("OLLAMA_MODEL", "llama3")
        self.timeout_seconds = float(os.getenv("LLM_TIMEOUT_SECONDS", "20"))

    @staticmethod
    def _normalize_confidence(conf: float | int | None) -> int:
        if conf is None:
            return 90
        if conf <= 1:
            return int(conf * 100)
        return int(conf)

    @staticmethod
    def _is_online() -> bool:
        try:
            socket.create_connection(("8.8.8.8", 53), timeout=3)
            return True
        except OSError:
            return False

    def _build_prompt(self, crop_type: str, disease_name: str, severity: str, confidence: int) -> str:
        return SYSTEM_PROMPT.format(
            crop=crop_type,
            disease=disease_name,
            confidence=confidence,
            severity=severity,
        )

    def _query_groq(self, prompt: str) -> str:
        if not self.groq_api_key:
            raise RuntimeError("Missing GROQ_API_KEY")

        headers = {
            "Authorization": f"Bearer {self.groq_api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.groq_model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.3,
        }
        response = requests.post(
            self.groq_api_url,
            headers=headers,
            json=payload,
            timeout=self.timeout_seconds,
        )
        response.raise_for_status()

        parsed = response.json()
        return parsed["choices"][0]["message"]["content"]

    def _query_ollama(self, prompt: str) -> str:
        payload = {
            "model": self.ollama_model,
            "prompt": prompt,
            "stream": False,
        }
        response = requests.post(
            self.ollama_url,
            json=payload,
            timeout=self.timeout_seconds,
        )
        response.raise_for_status()

        parsed = response.json()
        return parsed["response"]

    @staticmethod
    def _extract_json_blob(raw_text: str) -> Dict[str, Any]:
        try:
            return json.loads(raw_text)
        except json.JSONDecodeError:
            start = raw_text.find("{")
            end = raw_text.rfind("}")
            if start == -1 or end == -1 or end <= start:
                return {}
            try:
                return json.loads(raw_text[start : end + 1])
            except json.JSONDecodeError:
                return {}

    @staticmethod
    def _fallback_insights(disease_name: str, severity: str) -> Dict[str, Any]:
        return {
            "summary": f"Detected {disease_name} with {severity} severity. Detailed AI response unavailable.",
            "remedies": [
                "Isolate affected plants and monitor nearby leaves.",
                "Avoid overwatering and improve ventilation in the field.",
                "Use crop-safe treatment recommended by local agronomists.",
                "Inspect early morning and remove severely infected tissue.",
                "Track spread daily and reassess with fresh images.",
            ],
            "location": "Field location not provided",
            "time_context": "Early morning",
            "recovery": "Depends on intervention speed",
            "preventive_note": "Maintain weekly scouting and field hygiene.",
        }

    def _normalize_insights(self, llm_text: str, disease_name: str, severity: str) -> Dict[str, Any]:
        parsed = self._extract_json_blob(llm_text)
        default = self._fallback_insights(disease_name, severity)
        remedies: List[str] = parsed.get("remedies", []) if isinstance(parsed, dict) else []

        if not isinstance(remedies, list):
            remedies = []

        normalized = {
            "summary": parsed.get("summary", default["summary"]) if isinstance(parsed, dict) else default["summary"],
            "remedies": remedies if remedies else default["remedies"],
            "location": parsed.get("location", default["location"]) if isinstance(parsed, dict) else default["location"],
            "time_context": parsed.get("time_context", default["time_context"]) if isinstance(parsed, dict) else default["time_context"],
            "recovery": parsed.get("recovery", default["recovery"]) if isinstance(parsed, dict) else default["recovery"],
            "preventive_note": parsed.get("preventive_note", default["preventive_note"]) if isinstance(parsed, dict) else default["preventive_note"],
        }
        return normalized

    def get_agronomic_advice(
        self,
        disease_name: str,
        severity: str,
        crop_type: str = "auto",
        confidence: float | int | None = None,
    ) -> Dict[str, Any]:
        confidence_percent = self._normalize_confidence(confidence)
        prompt = self._build_prompt(crop_type, disease_name, severity, confidence_percent)

        provider = "groq"
        online = self._is_online()
        llm_text = ""

        if online:
            try:
                llm_text = self._query_groq(prompt)
                engine = f"groq:{self.groq_model}"
            except Exception as exc:
                print(f"Groq request failed while online: {exc}")
                provider = "fallback"
                engine = "fallback:static"
        else:
            provider = "ollama"
            try:
                llm_text = self._query_ollama(prompt)
                engine = f"ollama:{self.ollama_model}"
            except Exception as exc:
                print(f"Ollama request failed while offline: {exc}")
                provider = "fallback"
                engine = "fallback:static"

        if provider == "fallback":
            insights = self._fallback_insights(disease_name, severity)
        else:
            insights = self._normalize_insights(llm_text, disease_name, severity)

        return {
            "disease": disease_name,
            "severity_level": severity,
            "crop_type": crop_type,
            "provider": provider,
            "online": online,
            "ai_insights": insights,
            "ai_engine": engine,
            "timestamp": time.time(),
        }

llm_service = LLMInsightsService()
