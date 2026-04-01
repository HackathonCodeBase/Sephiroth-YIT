import time
from typing import Dict, Any
from app.models.disease_classifier import classifier_engine

class CropAnalysisService:
    @staticmethod
    def analyze_image(image_bytes: bytes, crop_type: str = "auto", vision_engine: str = "mobilenet") -> Dict[str, Any]:
        """
        Processes image using the requested Vision classifier 
        and returns disease analysis.
        """
        # Call the actual classifier engine
        prediction = classifier_engine.predict(image_bytes, engine_type=vision_engine)
        
        crop_name = prediction["crop"]
        disease_name = prediction["disease"]
        confidence = prediction["confidence"]
        architecture = prediction["architecture"]
        
        full_label = f"{crop_name} {disease_name}"
        
        return {
            "crop": crop_name,
            "disease": disease_name,
            "disease_detected": full_label, 
            "confidence": confidence,
            "architecture": architecture,
            "severity": "Moderate",
            "timestamp": time.time(),
            "detected_objects": [
                {"label": "Infected Area", "box": [120, 150, 280, 320], "score": confidence}
            ]
        }

analysis_service = CropAnalysisService()
