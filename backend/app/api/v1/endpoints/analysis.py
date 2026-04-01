from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from app.services.crop_analysis import analysis_service
from app.services.llm_insights import llm_service
from typing import Dict, Any

router = APIRouter()

@router.post("/crop-analysis")
async def analyze_crop(
    file: UploadFile = File(...), 
    crop_type: str = Form("auto"),
    vision_engine: str = Form("consolidated_core")
):
    """
    Main endpoint for analyzing leaf photographs/drone images.
    """
    # Validating file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    try:
        # Reading file content
        content = await file.read()
        
        # Step 1: Use Sephiroth CV model (Raw image analysis)
        analysis_result = analysis_service.analyze_image(content, crop_type=crop_type, vision_engine=vision_engine)
        
        # Step 2: Get Advanced AI recommendations (LLM Integration)
        insights = llm_service.get_agronomic_advice(
            disease_name=analysis_result["disease"],
            severity=analysis_result.get("severity", "Moderate"),
            crop_type=analysis_result["crop"],
            confidence=analysis_result["confidence"]
        )
        
        # Standardized production payload for the Sephiroth dashboard
        return {
            "crop": analysis_result["crop"],
            "disease": analysis_result["disease"],
            "confidence": analysis_result["confidence"],
            "architecture": analysis_result["architecture"],
            "severity": analysis_result.get("severity", "Moderate"),
            "intelligence": insights,
            "metadata": {
                "engine": vision_engine
            }
        }
        
    except Exception as e:
        print(f"Error during analysis: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during analysis.")

@router.get("/drone-feed-status")
async def get_drone_status():
    """
    Check if the field drone is connected to the agronomist's station.
    """
    return {
        "connected": True,
        "battery": "85%",
        "gps": {"lat": 12.9716, "lon": 77.5946},
        "altitude": "15m",
        "signal_strength": "High"
    }
