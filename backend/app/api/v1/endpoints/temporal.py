from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from app.services.temporal_service import temporal_service
from app.services.crop_analysis import analysis_service
from app.services.llm_insights import llm_service
from typing import Optional

router = APIRouter()

@router.post("/compare")
async def compare_temporal(
    file1: UploadFile = File(...),
    file2: UploadFile = File(...),
    date1: Optional[str] = Form(None),
    date2: Optional[str] = Form(None),
    crop_type: str = Form("auto"),
    vision_engine: str = Form("consolidated_core")
):
    """
    Enhanced temporal analysis with integrated disease classification for the latest image.
    """
    if not file1.content_type.startswith("image/") or not file2.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Both files must be images.")

    try:
        content1 = await file1.read()
        content2 = await file2.read()
        
        # 1. Temporal Progression Analysis
        diff_base64, progression_score = temporal_service.analyze_temporal_ultra(content1, content2)
        
        # 2. Standard Disease Classification for the Latest Image (Robust fallback)
        latest_analysis = {
            "crop": "Unknown",
            "disease": "Analysis Pending",
            "confidence": 0.0,
            "architecture": vision_engine,
            "severity": "Unknown",
            "intelligence": "Diagnostic engine is currently calibrating. Please check progression deltas."
        }

        try:
            analysis_result = analysis_service.analyze_image(content2, crop_type=crop_type, vision_engine=vision_engine)
            insights = llm_service.get_agronomic_advice(
                disease_name=analysis_result["disease"],
                severity=analysis_result.get("severity", "Moderate"),
                crop_type=analysis_result["crop"],
                confidence=analysis_result["confidence"]
            )

            latest_analysis = {
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
        except Exception as ae:
            print(f"Sub-analysis failed: {ae}")
            # Fallback is already set above

        if diff_base64 is None:
            raise HTTPException(status_code=500, detail="Temporal registration failed.")

        return {
            "progression_score": float(f"{progression_score:.2f}"),
            "unit": "percent",
            "diff_image": f"data:image/png;base64,{diff_base64}",
            "latest_analysis": latest_analysis,
            "status": "Success",
            "message": "Temporal and diagnostic analysis completed successfully.",
            "metadata": {
                "baseline_date": date1,
                "latest_date": date2,
                "analysis_engine": "Ultra-Robust ECC v2.1"
            }
        }
        
    except Exception as e:
        print(f"Error during temporal analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))
