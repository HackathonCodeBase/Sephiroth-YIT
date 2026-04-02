import os
import json
from app.services.llm_insights import LLMInsightsService

def run_tests():
    service = LLMInsightsService()
    
    print("=== Testing GROQ ===")
    if not service.config.groq_api_key:
        print("WARNING: GROQ_API_KEY is not set in environment or .env file.")
    else:
        print("Groq API Key length:", len(service.config.groq_api_key))
    
    try:
        groq_result = service.get_agronomic_advice(
            disease_name="Tomato Late Blight", 
            severity="High", 
            crop_type="Tomato", 
            confidence=0.95,
            provider="groq"
        )
        print("Groq Result Engine:", groq_result.get("ai_engine"))
        print("Groq Result Keys:", list(groq_result.get("ai_insights", {}).keys()) if groq_result.get("ai_insights") else "None")
    except Exception as e:
        print(f"Groq Test Failed: {e}")

    print("\n=== Testing OLLAMA ===")
    print("Ollama URL:", service.config.ollama_url)
    try:
        ollama_result = service.get_agronomic_advice(
            disease_name="Tomato Late Blight", 
            severity="High", 
            crop_type="Tomato", 
            confidence=0.95,
            provider="ollama"
        )
        print("Ollama Result Engine:", ollama_result.get("ai_engine"))
        print("Ollama Result Keys:", list(ollama_result.get("ai_insights", {}).keys()) if ollama_result.get("ai_insights") else "None")
    except Exception as e:
        print(f"Ollama Test Failed: {e}")

if __name__ == "__main__":
    run_tests()