import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'app'))
from app.services.llm_insights import llm_service
from app.services.crop_analysis import analysis_service

def test():
    # Mocking a disease name for Tomato
    disease = "Tomato___Early_blight"
    crop = "Tomato"
    severity = "High"
    confidence = 0.95
    
    for provider in ["groq", "ollama", "auto"]:
        print(f"\nTesting provider: {provider}")
        insights = llm_service.get_agronomic_advice(disease, severity, crop, confidence, provider=provider)
        print("Engine used:", insights.get("ai_engine"))
        if "ai_insights" in insights:
            print("Summary snippet:", insights["ai_insights"].get("summary")[:50])
        else:
            print("ERROR: ai_insights missing!")

if __name__ == "__main__":
    test()
