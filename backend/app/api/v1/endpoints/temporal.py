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
    vision_engine: str = Form("consolidated_core"),
    llm_provider: str = Form("auto"),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None)
):
    """
    Enhanced temporal analysis with integrated disease classification for the latest image.
    """
    if not file1.content_type.startswith("image/") or not file2.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Both files must be images.")

    try:
        content1 = await file1.read()
        content2 = await file2.read()
        
        print(f"[TEMPORAL] Incoming request | Engine: {vision_engine} | LLM: {llm_provider}")
        
        # 1. Temporal Progression Analysis
        diff_base64, progression_score, status = temporal_service.analyze_temporal_ultra(content1, content2)
        
        # 2. Pathological Identity Continuity
        try:
            # Analyze baseline
            try:
                res1 = analysis_service.analyze_image(content1, crop_type=crop_type, vision_engine=vision_engine)
            except:
                res1 = {"disease": "Unknown", "crop": crop_type, "confidence": 0.0, "architecture": "NONE", "severity": "Moderate"}
            
            # Analyze follow-up
            try:
                res2 = analysis_service.analyze_image(content2, crop_type=crop_type, vision_engine=vision_engine)
            except:
                res2 = {"disease": "Unknown", "crop": crop_type, "confidence": 0.0, "architecture": "NONE", "severity": "Moderate"}
            
            # Determine primary pathology identity
            is_res2_healthy = "healthy" in str(res2["disease"]).lower()
            is_res1_healthy = "healthy" in str(res1["disease"]).lower()
            
            if not is_res2_healthy:
                primary_res = res2
            elif not is_res1_healthy:
                primary_res = res1
            else:
                primary_res = res2 # Both healthy
                
            # Apply Status Suffix
            original_disease = primary_res["disease"]
            display_disease = original_disease
            if status == "recovery" and "healthy" not in str(original_disease).lower():
                display_disease = f"{original_disease} (Recovered)"
            elif status == "progression" and not is_res2_healthy:
                display_disease = f"{original_disease} (Progression)"

            # Get insights using the base disease name for better LLM consistency
            insights = llm_service.get_agronomic_advice(
                disease_name=original_disease,
                severity=primary_res.get("severity", "Moderate"),
                crop_type=primary_res["crop"],
                confidence=primary_res["confidence"],
                provider=llm_provider,
                temporal_status=status,
                latitude=latitude,
                longitude=longitude
            )

            latest_analysis = {
                "crop": primary_res["crop"],
                "disease": display_disease,
                "confidence": primary_res["confidence"],
                "architecture": primary_res["architecture"],
                "severity": primary_res.get("severity", "Moderate"),
                "intelligence": insights,
                "metadata": {
                    "engine": vision_engine,
                    "timeline_direction": status,
                    "original_identity": original_disease
                }
            }
        except Exception as ae:
            print(f"Pathology continuity node failure: {ae}")
            # Ultra-safe fallback structure
            latest_analysis = {
                "crop": "Crop",
                "disease": "Temporal Signature Detection",
                "confidence": 0.5,
                "architecture": "SEPHIROTH_FALLBACK",
                "severity": "Moderate",
                "intelligence": llm_service.get_agronomic_advice(
                    "Unknown", "Moderate", crop_type, provider=llm_provider,
                    latitude=latitude, longitude=longitude
                )
            }

        if diff_base64 is None:
            raise HTTPException(status_code=500, detail="Temporal registration failed.")

        return {
            "progression_score": float(f"{progression_score:.2f}"),
            "unit": "percent",
            "diff_image": f"data:image/png;base64,{diff_base64}",
            "latest_analysis": latest_analysis,
            "status": "Success",
            "compare_status": status,
            "message": "Temporal and diagnostic analysis completed successfully.",
            "metadata": {
                "baseline_date": date1,
                "latest_date": date2,
                "analysis_engine": "Ultra-Robust ECC v2.1",
                "latitude": latitude,
                "longitude": longitude
            }
        }
        
    except Exception as e:
        print(f"Error during temporal analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))
