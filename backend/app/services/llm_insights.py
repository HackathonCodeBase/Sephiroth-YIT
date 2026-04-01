import time
import os
import json
from typing import Dict, Any
from huggingface_hub import InferenceClient
from dotenv import load_dotenv

load_dotenv()

class LLMInsightsService:
    def __init__(self):
        self.token = os.getenv("HF_TOKEN")
        # Use a high-quality instruction-following model
        self.client = InferenceClient(model="mistralai/Mistral-7B-Instruct-v0.2", token=self.token)

    def get_agronomic_advice(self, disease_name: str, severity: str, crop_type: str = "auto") -> Dict[str, Any]:
        """
        Simplified formatter to return raw model data without LLM intervention.
        """
        summary = f"Neural detection of {disease_name} in {crop_type} (Severity: {severity})."
        
        insight = {
            "summary": summary,
            "remedies": [],
            "location": "",
            "time_context": "",
            "recovery": "",
            "preventive_note": ""
        }
        
        return {
            "disease": disease_name,
            "severity_level": severity,
            "crop_type": crop_type,
            "ai_insights": insight,
            "ai_engine": "Sephiroth Neural Core (Raw)",
            "timestamp": time.time()
        }

    def _get_fallback_advice(self, disease_name: str, severity: str, crop_type: str) -> Dict[str, Any]:
        """
        Semi-dynamic fallback for when the API fails.
        """
        return {
            "disease": disease_name,
            "severity_level": severity,
            "crop_type": crop_type,
            "ai_insights": {
                "summary": f"Detection of {disease_name} in {crop_type} requires immediate attention.",
                "remedies": [
                    "Isolate the affected plants.",
                    "Review local moisture and humidity levels.",
                    "Apply general organic fungicides if appropriate.",
                    "Contact local agricultural extension for specific chemicals."
                ],
                "location": "Mangalore, Karnataka, India",
                "time_context": "Morning hours",
                "recovery": "10-20 days",
                "preventive_note": "Regular scouting and sanitation is recommended."
            },
            "ai_engine": "Hybrid Fallback Processor",
            "timestamp": time.time()
        }

llm_service = LLMInsightsService()
