from .base_classifier import BaseDiseaseClassifier

class DenseNetClassifier(BaseDiseaseClassifier):
    def __init__(self):
        super().__init__(
            repo_id="DurgeshAP/AgroCrop_DenseNet",
            filename="final_densenet_crop_model (1).h5",
            architecture_name="DENSENET_121"
        )
