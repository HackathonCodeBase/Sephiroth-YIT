from app.models.base_classifier import BaseDiseaseClassifier

class MobileNetClassifier(BaseDiseaseClassifier):
    def __init__(self):
        super().__init__(
            repo_id="DurgeshAP/AgroCare_MobileNet",
            filename="final_mobilenet_crop_model.h5",
            architecture_name="MOBILENET_V2"
        )
