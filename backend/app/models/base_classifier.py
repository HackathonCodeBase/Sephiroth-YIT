import os
import io
import numpy as np
from PIL import Image
import tensorflow as tf
from huggingface_hub import hf_hub_download
from dotenv import load_dotenv

# BRAIN CALIBRATION: Monkey-patch Keras to handle serialization mismatches (Keras 2/3)
import keras
from keras import layers

def _patch_keras():
    print("[MATRIX_CORE] Patching Keras layers for cross-version compatibility...")
    
    # Patch Dense layer to ignore quantization_config from legacy H5 files
    original_dense_from_config = layers.Dense.from_config
    @classmethod
    def patched_dense_from_config(cls, config):
        config.pop('quantization_config', None)
        return original_dense_from_config(config)
    layers.Dense.from_config = patched_dense_from_config
    
    # Patch InputLayer for configuration key mapping
    original_input_from_config = layers.InputLayer.from_config
    @classmethod
    def patched_input_from_config(cls, config):
        # Keras 3 uses 'batch_shape', Keras 2 used 'input_shape' / 'batch_input_shape'
        # Most Keras 3 loaders handle this, but we ensure 'optional' is removed if present
        config.pop('optional', None)
        return original_input_from_config(config)
    layers.InputLayer.from_config = patched_input_from_config

_patch_keras()

load_dotenv()

class BaseDiseaseClassifier:
    def __init__(self, repo_id: str, filename: str, architecture_name: str):
        self.repo_id = repo_id
        self.filename = filename
        self.architecture_name = architecture_name
        self.model = None
        self.hf_token = os.getenv("HF_TOKEN")
        self.classes = [
            "Apple___Apple_scab", "Apple___Black_rot", "Apple___Cedar_apple_rust", "Apple___healthy",
            "Grape___Black_rot", "Grape___Esca_(Black_Measles)", "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)", "Grape___healthy",
            "Tomato___Bacterial_spot", "Tomato___Early_blight", "Tomato___Late_blight",
            "Tomato___Leaf_Mold", "Tomato___Septoria_leaf_spot", "Tomato___Spider_mites Two-spotted_spider_mite",
            "Tomato___Target_Spot", "Tomato___Tomato_Yellow_Leaf_Curl_Virus", "Tomato___Tomato_mosaic_virus", "Tomato___healthy"
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
            
            # Use compile=False and specific loading options for Keras 3 compatibility
            self.model = tf.keras.models.load_model(local_model_path, compile=False)
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
            return {
                "crop": "System", 
                "disease": "Neural Error", 
                "confidence": 0.0, 
                "architecture": self.architecture_name
            }
            
        processed_data = self.preprocess_image(image_bytes)
        predictions = model.predict(processed_data)
        idx = np.argmax(predictions[0])
        confidence = float(predictions[0][idx])
        
        raw_label = self.classes[idx] if idx < len(self.classes) else "Unknown___Pathology"
        
        # Parse label into crop and disease (split by '___')
        if "___" in raw_label:
            parts = raw_label.split("___")
        else:
            parts = raw_label.split(" ", 1)

        crop = parts[0].replace("_", " ") if len(parts) > 0 else "Unknown"
        disease = parts[1].replace("_", " ") if len(parts) > 1 else "Unknown"
        
        # Remove redundant crop name from disease if it exists
        if disease.lower().startswith(crop.lower() + " "):
            disease = disease[len(crop)+1:]
        elif disease.lower().startswith(crop.lower()):
            disease = disease[len(crop):].strip()
        
        return {
            "crop": crop,
            "disease": disease,
            "confidence": confidence,
            "architecture": self.architecture_name
        }