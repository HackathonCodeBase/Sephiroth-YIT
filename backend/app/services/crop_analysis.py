import time
from typing import Dict, Any
from app.models.disease_classifier import classifier_engine

class CropAnalysisService:
    @staticmethod
    def analyze_image(image_bytes: bytes, crop_type: str = "auto", vision_engine: str = "consolidated_core") -> Dict[str, Any]:
        """
        Processes image using the requested Sephiroth Vision classifier 
        and returns structured disease analysis.
        """
        # Call the actual classifier engine (ResNet, MobileNet, or Consolidated)
        prediction = classifier_engine.predict(image_bytes, engine_type=vision_engine)
        
        crop_name = prediction["crop"]
        disease_name = prediction["disease"]
        confidence = prediction["confidence"]
        architecture = prediction.get("architecture", vision_engine)
        
        # Severity Mapping logic for LMM advisory integration
        severity_map = {
            "Bacterial spot": "Moderate",
            "Early blight": "High",
            "Late blight": "Critical",
            "Leaf Mold": "Moderate",
            "Septoria leaf spot": "High",
            "Spider mites": "Moderate",
            "Target Spot": "High",
            "Yellow Leaf Curl Virus": "Critical",
            "Mosaic virus": "Moderate",
            "scab": "Moderate",
            "Black rot": "High",
            "Cedar apple rust": "Moderate",
            "Esca": "High",
            "Leaf blight": "High",
            "healthy": "None"
        }
        
        # Determine severity based on disease match
        severity = "Moderate"
        for key, val in severity_map.items():
            if key.lower() in disease_name.lower():
                severity = val
                break
        
        return {
            "crop": crop_name,
            "disease": disease_name,
            "disease_detected": f"{crop_name} {disease_name}", 
            "confidence": confidence,
            "architecture": architecture,
            "severity": severity,
            "timestamp": time.time(),
            "votes": prediction.get("votes", {})
        }

analysis_service = CropAnalysisService()
