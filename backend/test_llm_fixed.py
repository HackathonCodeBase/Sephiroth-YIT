import sys
import os
import json
sys.path.append(os.getcwd())
from app.services.llm_insights import llm_service

def test():
    # Mocking a disease name for Tomato
    disease = "Tomato___Early_blight"
    crop = "Tomato"
    severity = "High"
    confidence = 0.95
    
    for provider in ["groq", "auto"]:
        print(f"\n--- Testing provider: {provider} ---")
        result = llm_service.get_agronomic_advice(disease, severity, crop, confidence, provider=provider)
        print("Engine:", result.get("ai_engine"))
        insights = result.get("ai_insights")
        if isinstance(insights, dict):
            print("Summary:", insights.get("summary"))
        else:
            print("Insights is NOT a dict, it's:", type(insights), insights)

if __name__ == "__main__":
    test()
