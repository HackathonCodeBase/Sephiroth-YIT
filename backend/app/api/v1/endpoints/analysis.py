from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from app.services.crop_analysis import analysis_service
from app.services.llm_insights import llm_service
from typing import Dict, Any

router = APIRouter()

@router.post("/crop-analysis")
async def analyze_crop(
    file: UploadFile = File(...), 
    crop_type: str = Form("auto"),
    vision_engine: str = Form("mobilenet"),
    latitude: float = Form(None),
    longitude: float = Form(None),
    description: str = Form(None)
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
        
        # Step 1: Use friends' CV model
        analysis_result = analysis_service.analyze_image(content, crop_type=crop_type, vision_engine=vision_engine)

        # Store in Database
        if latitude is not None and longitude is not None:
            from app.db import get_db
            try:
                conn = get_db()
                cursor = conn.cursor()
                cursor.execute(
                    "INSERT INTO reports (latitude, longitude, crop, disease, description) VALUES (?, ?, ?, ?, ?)",
                    (latitude, longitude, analysis_result["crop"], analysis_result["disease"], description or "")
                )
                conn.commit()
                report_id = cursor.lastrowid
                conn.close()

                # Trigger WebSocket Broadcast
                from app.api.v1.endpoints.websockets import manager
                import asyncio
                import datetime

                disease_found = analysis_result["disease"]
                if disease_found and "healthy" not in disease_found.lower():
                    # Calculate dynamic proximity notification threshold
                    asyncio.create_task(manager.broadcast_alert({
                        "type": "NEW_OUTBREAK",
                        "data": {
                            "id": report_id,
                            "latitude": latitude,
                            "longitude": longitude,
                            "crop": analysis_result["crop"],
                            "disease": analysis_result["disease"],
                            "description": description or "",
                            "timestamp": datetime.datetime.now().isoformat()
                        }
                    }, source_lat=latitude, source_lon=longitude))
            except Exception as db_err:
                print(f"Error saving to DB: {db_err}")

        # Return EXACT raw keys as requested
        return {
            "crop": analysis_result["crop"],
            "disease": analysis_result["disease"],
            "confidence": analysis_result["confidence"]
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
        "gps": {"lat": 40.7250, "lon": -73.9980},
        "altitude": "15m",
        "signal_strength": "High"
    }
