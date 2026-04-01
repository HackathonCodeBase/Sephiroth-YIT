import os
from huggingface_hub import hf_hub_download
from dotenv import load_dotenv

load_dotenv()
token = os.getenv("HF_TOKEN")

try:
    print("Checking EfficientNet model availability...")
    path = hf_hub_download(
        repo_id="DurgeshAP/AgroCare_EffNet",
        filename="final_efficientnet_crop_model.h5",
        token=token
    )
    print(f"Model found at: {path}")
except Exception as e:
    print(f"Error: {e}")
