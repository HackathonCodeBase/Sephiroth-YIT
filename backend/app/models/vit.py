from .base_classifier import BaseDiseaseClassifier
import tensorflow as tf
from tensorflow.keras import layers
import os

@tf.keras.utils.register_keras_serializable()
class Patches(layers.Layer):
    def __init__(self, patch_size=None, **kwargs):
        super().__init__(**kwargs)
        self.patch_size = patch_size

    def call(self, images):
        batch_size = tf.shape(images)[0]
        patches = tf.image.extract_patches(
            images=images,
            sizes=[1, self.patch_size, self.patch_size, 1],
            strides=[1, self.patch_size, self.patch_size, 1],
            rates=[1, 1, 1, 1],
            padding="VALID",
        )
        patch_dims = patches.shape[-1]
        patches = tf.reshape(patches, [batch_size, -1, patch_dims])
        return patches

    def get_config(self):
        config = super().get_config()
        config.update({"patch_size": self.patch_size})
        return config

@tf.keras.utils.register_keras_serializable()
class PatchEncoder(layers.Layer):
    def __init__(self, num_patches=196, projection_dim=128, **kwargs):
        super().__init__(**kwargs)
        self.num_patches = num_patches
        self.projection_dim = projection_dim
        
        # We create layers here to ensure they exist for weight loading
        self.projection = layers.Dense(units=projection_dim)
        self.position_embedding = layers.Embedding(
            input_dim=num_patches, output_dim=projection_dim
        )

    def call(self, patch):
        positions = tf.range(start=0, limit=self.num_patches, delta=1)
        encoded = self.projection(patch) + self.position_embedding(positions)
        return encoded

    def get_config(self):
        config = super().get_config()
        # Ensure we return the values so they can be re-loaded
        config.update({
            "num_patches": self.num_patches,
            "projection_dim": self.projection_dim,
        })
        return config


class VisionTransformerClassifier(BaseDiseaseClassifier):
    def __init__(self):
        # We'll prioritize use of VIT_MODEL_URL from environment if available
        repo_id = os.getenv("VIT_REPO_ID", "DurgeshAP/AgroCare__Vision_Transformer")
        filename = os.getenv("VIT_FILENAME", "final_vision_transformer_crop_model.h5")
        
        super().__init__(
            repo_id=repo_id,
            filename=filename,
            architecture_name="VISION_TRANSFORMER_VIT"
        )

    def _load_model(self):
        if self.model:
            return self.model
            
        try:
            current_dir = os.path.dirname(os.path.abspath(__file__))
            local_model_path = os.path.join(current_dir, self.filename)
            
            if not os.path.exists(local_model_path):
                from huggingface_hub import hf_hub_download
                print(f"Downloading {self.repo_id}/{self.filename}...")
                downloaded_path = hf_hub_download(
                    repo_id=self.repo_id, 
                    filename=self.filename, 
                    token=self.hf_token
                )
                import shutil
                shutil.copy(downloaded_path, local_model_path)
            
            # Use custom_object_scope to load the ViT model
            custom_objects = {
                "Patches": Patches,
                "PatchEncoder": PatchEncoder
            }
            
            with tf.keras.utils.custom_object_scope(custom_objects):
                self.model = tf.keras.models.load_model(local_model_path)
                
            print(f"Vision Engine [{self.architecture_name}] loaded with custom layers.")
            return self.model
        except Exception as e:
            print(f"Error loading {self.architecture_name}: {e}")
            return None
