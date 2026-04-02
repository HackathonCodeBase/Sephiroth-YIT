import sys
import os
sys.path.append(os.getcwd())
try:
    from app.models.resnet import ResNetClassifier
    from app.models.efficientnet import EfficientNetClassifier
    
    print("Testing ResNet download...")
    resnet = ResNetClassifier()
    resnet._load_model()
    
    print("Testing EfficientNet download...")
    effnet = EfficientNetClassifier()
    effnet._load_model()
except Exception as e:
    print(f"Error: {e}")
