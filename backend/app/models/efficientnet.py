from .base_classifier import BaseDiseaseClassifier

class EfficientNetClassifier(BaseDiseaseClassifier):
    def __init__(self):
        super().__init__(
            repo_id="DurgeshAP/AgroCare_EffNet",
            filename="final_effnet_crop_model (1).h5", # Assuming final name
            architecture_name="EFFICIENTNET_B4"
        )
