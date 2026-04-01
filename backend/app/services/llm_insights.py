import time
import os
import json
import requests
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

@dataclass
class LLMConfig:
    """Config for Sephiroth advanced insights engine."""
    groq_api_key: Optional[str] = os.getenv("GROQ_API_KEY")
    groq_model: str = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
    ollama_url: str = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
    ollama_model: str = os.getenv("OLLAMA_MODEL", "llama3.1:8b")
    fallback_enabled: bool = True

class LLMInsightsService:
    def __init__(self, config: Optional[LLMConfig] = None):
        self.config = config or LLMConfig()
        self.system_prompt = (
            "You are the Sephiroth AI Agronomist, a world-class plant pathologist. "
            "Analyze the given crop disease and severity. Provide structured, actionable agronomic advice. "
            "You MUST respond ONLY with a valid JSON object following the EXACT structure provided. "
            "Keep advice focused on Mangalore, Karnataka, India humidity and seasonal context (Early April — pre-monsoon)."
        )

    def _get_groq_response(self, prompt: str) -> Optional[Dict[str, Any]]:
        """Query Groq Cloud for high-performance inference."""
        if not self.config.groq_api_key:
            return None
            
        try:
            url = "https://api.groq.com/openai/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {self.config.groq_api_key}",
                "Content-Type": "application/json"
            }
            data = {
                "model": self.config.groq_model,
                "messages": [
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": prompt}
                ],
                "response_format": {"type": "json_object"},
                "temperature": 0.2
            }
            
            response = requests.post(url, headers=headers, json=data, timeout=10)
            if response.status_code == 200:
                result = response.json()
                content = result['choices'][0]['message']['content']
                return json.loads(content)
            return None
        except Exception as e:
            print(f"Groq Inference Error: {e}")
            return None

    def _get_ollama_response(self, prompt: str) -> Optional[Dict[str, Any]]:
        """Query local Ollama instance as a privacy-focused fallback."""
        if not self.config.fallback_enabled:
            return None
            
        try:
            data = {
                "model": self.config.ollama_model,
                "prompt": f"System: {self.system_prompt}\nUser: {prompt}\nJSON Output:",
                "stream": False,
                "format": "json"
            }
            response = requests.post(self.config.ollama_url, json=data, timeout=15)
            if response.status_code == 200:
                content = response.json().get('response', '{}')
                return json.loads(content)
            return None
        except Exception as e:
            print(f"Ollama Fallback Error: {e}")
            return None

    def get_agronomic_advice(
        self, 
        disease_name: str, 
        severity: str, 
        crop_type: str = "auto",
        confidence: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Main entry point for generating expert AI recommendations.
        """
        # Formulate a precise prompt for the LLM
        prompt = (
            f"Crop: {crop_type}\n"
            f"Detected Disease: {disease_name}\n"
            f"Severity Index: {severity}\n"
            f"Vision Model Confidence: {confidence if confidence else 'N/A'}\n\n"
            "Generate JSON with these keys: summary, remedies (list of 5 brief steps), location, time_context, recovery, preventive_note."
        )

        insights = None
        engine = "Cloud (Groq Llama-3.1)"

        # 1. Try Groq (Primary)
        if self.config.groq_api_key:
            insights = self._get_groq_response(prompt)
            
        # 2. Try Ollama (Secondary Fallback)
        if not insights:
            insights = self._get_ollama_response(prompt)
            engine = "Local (Ollama Llama-3.1)"

        # 3. Static Conservative Fallback (Safety Layer)
        if not insights:
            insights = self._get_fallback_advice(disease_name, severity, crop_type)["ai_insights"]
            engine = "Legacy (AgroCare Rulebook)"

        return {
            "disease": disease_name,
            "severity_level": severity,
            "crop_type": crop_type,
            "ai_insights": insights,
            "ai_engine": engine,
            "timestamp": time.time()
        }

    def _get_fallback_advice(self, disease_name: str, severity: str, crop_type: str) -> Dict[str, Any]:
        """Static rule-based fallback for critical mission safety."""
        return {
            "disease": disease_name,
            "severity_level": severity,
            "crop_type": crop_type,
            "ai_insights": {
                "summary": f"Pathogen {disease_name} identified. Pre-monsoon humidity in Mangalore increases risk.",
                "remedies": [
                    "Isolate infected plants from the main field flux immediately",
                    "Monitor soil moisture levels to prevent root anaerobic stress",
                    "Review irrigation schedules — early morning spraying is optimal",
                    "Apply general organic copper-based fungicides if humidity > 70%",
                    "Prune affected yellow foliage to improve airflow through canopy"
                ],
                "location": "Mangalore, KA (Coastal Belt)",
                "time_context": "Safe Windows: 6:00 AM — 9:00 AM",
                "recovery": "14-25 Days with protocol adherence",
                "preventive_note": "Ensure certified pathology-free seeds for next cultivation cycle."
            },
            "ai_engine": "Sephiroth Static Guard",
            "timestamp": time.time()
        }

llm_service = LLMInsightsService()
