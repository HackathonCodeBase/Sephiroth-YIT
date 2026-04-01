from .base_classifier import BaseDiseaseClassifier

class ResNetClassifier(BaseDiseaseClassifier):
    def __init__(self):
        super().__init__(
            repo_id="DurgeshAP/AgroCare_ResNet",
            filename="final_resnet_crop_model.h5",
            architecture_name="RESNET_50"
        )
