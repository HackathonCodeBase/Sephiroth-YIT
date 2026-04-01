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
        """Context-aware fallback for critical mission safety when LLMs are offline."""
        
        # Knowledge Base for common diseases
        pathology_db = {
            "scab": [
                "Remove and destroy infected fallen leaves to reduce inoculum",
                "Prune the canopy to increase sunlight penetration and air circulation",
                "Apply organic sulfur-based fungicides during humid periods",
                "Avoid overhead irrigation which spreads fungal spores",
                "Monitor new growth weekly for olive-colored spots"
            ],
            "blight": [
                "Improve soil drainage to prevent root moisture accumulation",
                "Remove heavily infected lower leaves immediately",
                "Apply copper-based fungicides as a preventative layer",
                "Disinfect pruning tools with 70% alcohol between plants",
                "Increase plant spacing to ensure rapid leaf drying after rain"
            ],
            "virus": [
                "There is no chemical cure; rogue out and burn infected plants",
                "Control aphid and whitefly populations which act as vectors",
                "Wash hands with soap after handling infected foliage",
                "Ensure weed control around the field to remove viral hosts",
                "Use only certified virus-free seed stock for next cycle"
            ],
            "healthy": [
                "Continue current irrigation and nutrient protocols",
                "Schedule periodic soil tests to monitor nutrient balance",
                "Inspect lower canopy bi-weekly for early pest signatures",
                "Maintain mulch layers to suppress weed competition",
                "Document environmental conditions for future success modeling"
            ]
        }

        # Select relevant advice or default to general care
        advice_key = "healthy"
        for key in pathology_db:
            if key in disease_name.lower():
                advice_key = key
                break
        
        remedies = pathology_db.get(advice_key, pathology_db["healthy"])

        return {
            "disease": disease_name,
            "severity_level": severity,
            "crop_type": crop_type,
            "ai_insights": {
                "summary": f"Pathogen identification: {disease_name}. Local humidity context in Mangalore indicates {severity.lower()} risk levels.",
                "remedies": remedies,
                "location": "Mangalore, KA (Coastal Belt)",
                "time_context": "Safe Windows: 6:00 AM — 9:00 AM",
                "recovery": "14-25 Days with protocol adherence",
                "preventive_note": f"Maintain strict sanitation to prevent {disease_name} spread."
            },
            "ai_engine": "Sephiroth Logic-Guard (Offline)",
            "timestamp": time.time()
        }

llm_service = LLMInsightsService()
