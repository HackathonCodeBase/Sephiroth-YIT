import os
import io
import numpy as np
from PIL import Image
import tensorflow as tf
from huggingface_hub import hf_hub_download
from dotenv import load_dotenv

load_dotenv()

class BaseDiseaseClassifier:
    def __init__(self, repo_id: str, filename: str, architecture_name: str):
        self.repo_id = repo_id
        self.filename = filename
        self.architecture_name = architecture_name
        self.model = None
        self.hf_token = os.getenv("HF_TOKEN")
        self.classes = [
            "Apple Scab", "Apple Black Rot", "Apple Cedar Rust", "Apple Healthy",
            "Grape Black Rot", "Grape Esca", "Grape Leaf Blight", "Grape Healthy",
            "Potato Early Blight", "Potato Late Blight", "Potato Healthy",
            "Tomato Bacterial Spot", "Tomato Early Blight", "Tomato Late Blight",
            "Tomato Leaf Mold", "Tomato Septoria Spot", "Tomato Spider Mite", "Tomato Healthy"
        ]

    def _load_model(self):
        if self.model:
            return self.model
            
        try:
            current_dir = os.path.dirname(os.path.abspath(__file__))
            local_model_path = os.path.join(current_dir, self.filename)
            
            if not os.path.exists(local_model_path):
                print(f"Downloading {self.repo_id}/{self.filename}...")
                downloaded_path = hf_hub_download(
                    repo_id=self.repo_id, 
                    filename=self.filename, 
                    token=self.hf_token
                )
                import shutil
                shutil.copy(downloaded_path, local_model_path)
            
            self.model = tf.keras.models.load_model(local_model_path)
            print(f"Vision Engine [{self.architecture_name}] loaded.")
            return self.model
        except Exception as e:
            print(f"Error loading {self.architecture_name}: {e}")
            return None

    def preprocess_image(self, image_bytes, target_size=(224, 224)):
        image = Image.open(io.BytesIO(image_bytes))
        image = image.convert("RGB")
        image = image.resize(target_size)
        img_array = np.array(image).astype(np.float32)
        img_array = (img_array / 127.5) - 1.0
        img_array = np.expand_dims(img_array, axis=0)
        return img_array

    def predict(self, image_bytes):
        model = self._load_model()
        if not model:
            return {"label": "Neural Error", "confidence": 0.0, "architecture": self.architecture_name}
            
        processed_data = self.preprocess_image(image_bytes)
        predictions = model.predict(processed_data)
        idx = np.argmax(predictions[0])
        confidence = float(predictions[0][idx])
        
        raw_label = self.classes[idx] if idx < len(self.classes) else "Unknown Pathology"
        
        # Parse label into crop and disease (split by first space)
        parts = raw_label.split(' ', 1)
        crop = parts[0] if len(parts) > 0 else "Unknown"
        disease = parts[1] if len(parts) > 1 else "Unknown"
        
        return {
            "crop": crop,
            "disease": disease,
            "confidence": confidence,
            "architecture": self.architecture_name
        }
