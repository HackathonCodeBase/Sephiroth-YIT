import requests
import numpy as np
from PIL import Image
import io

# Create a dummy image
img = Image.fromarray(np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8))
img_byte_arr = io.BytesIO()
img.save(img_byte_arr, format='JPEG')
img_byte_arr = img_byte_arr.getvalue()

url = "http://localhost:8000/api/v1/crop-analysis"
files = {'file': ('test.jpg', img_byte_arr, 'image/jpeg')}
data = {'crop_type': 'Tomato'}

try:
    print(f"Sending request to {url}...")
    response = requests.post(url, files=files, data=data)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print("Success! Response JSON:")
        import json
        print(json.dumps(response.json(), indent=2))
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Connection failed: {e}")
