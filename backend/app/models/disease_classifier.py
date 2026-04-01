from .mobilenet import MobileNetClassifier
from .densenet import DenseNetClassifier
from .resnet import ResNetClassifier
from .efficientnet import EfficientNetClassifier

class DiseaseClassifier:
    def __init__(self):
        self.engines = {
            "mobilenet": MobileNetClassifier(),
            "densenet": DenseNetClassifier(),
            "resnet": ResNetClassifier(),
            "efficientnet": EfficientNetClassifier()
        }

    def predict(self, image_bytes, engine_type="consolidated_core"):
        engine_type = engine_type.lower()
        
        # Recognize all ensemble/fusion aliases
        if any(term in engine_type for term in ["ensemble", "fusion", "consolidated", "agrocare", "expert"]):
            return self._predict_ensemble(image_bytes)
            
        if engine_type not in self.engines:
            # Check if it was meant to be one of the registered engines (safe fallback)
            for engine_name in self.engines:
                if engine_name in engine_type:
                    return self.engines[engine_name].predict(image_bytes)
            # Default to ensemble for safety or mobilenet if specified
            return self._predict_ensemble(image_bytes)
            
        return self.engines[engine_type].predict(image_bytes)

    def _predict_ensemble(self, image_bytes):
        results = []
        for name, engine in self.engines.items():
            try:
                results.append(engine.predict(image_bytes))
            except Exception as e:
                print(f"Ensemble member {name} failed: {e}")
        
        if not results:
            return {"crop": "Unknown", "disease": "Error", "confidence": 0.0, "architecture": "ENSEMBLE_FAILURE"}

        # Voting logic
        votes = {}
        for r in results:
            key = (r["crop"], r["disease"])
            if key not in votes:
                votes[key] = {"count": 0, "confidences": []}
            votes[key]["count"] += 1
            votes[key]["confidences"].append(r["confidence"])
            
        # Find majority
        # Primary sort: count (desc), Secondary: average confidence (desc)
        winner_key = max(votes.keys(), key=lambda k: (votes[k]["count"], sum(votes[k]["confidences"])/len(votes[k]["confidences"])))
        winner_data = votes[winner_key]
        
        return {
            "crop": winner_key[0],
            "disease": winner_key[1],
            "confidence": sum(winner_data["confidences"]) / len(winner_data["confidences"]),
            "architecture": "SEPHIROTH_AGROCARE_EXPERT_CONSOLIDATED",
            "votes": {f"{k[0]} {k[1]}": v["count"] for k, v in votes.items()}
        }

# Singleton
classifier_engine = DiseaseClassifier()
