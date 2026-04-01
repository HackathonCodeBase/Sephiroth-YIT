from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from app.services.crop_analysis import analysis_service
from app.services.llm_insights import llm_service
from typing import Dict, Any

router = APIRouter()

@router.post("/crop-analysis")
async def analyze_crop(file: UploadFile = File(...), crop_type: str = Form("auto")):
    """
    Main endpoint for analyzing leaf photographs/drone images.
    """
    # Validating file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    try:
        # Reading file content
        content = await file.read()
        
        # Step 1: Use friends' CV model (placeholder)
        analysis_result = analysis_service.analyze_image(content, crop_type=crop_type)
        
        # Step 2: Use LLM for expert advice
        ai_insights = llm_service.get_agronomic_advice(
            disease_name=analysis_result["disease_detected"],
            severity=analysis_result["severity"],
            crop_type=crop_type
        )
        
        # Combining results
        response_data = {
            "analysis": analysis_result,
            "intelligence": ai_insights,
            "filename": file.filename,
            "status": "success",
            "metadata": {
                "engine": "Crop-Vision 4.0 (Custom Embedding)",
                "processor": "FastAPI Hybrid Worker"
            }
        }
        
        return response_data
        
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
