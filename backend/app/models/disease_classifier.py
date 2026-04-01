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

    def predict(self, image_bytes, engine_type="mobilenet"):
        engine_type = engine_type.lower()
        if engine_type not in self.engines:
            engine_type = "mobilenet"
            
        return self.engines[engine_type].predict(image_bytes)

# Singleton
classifier_engine = DiseaseClassifier()
