# Crop Analysis API Documentation

## 🎯 Endpoint Overview

The crop analysis endpoint performs three sequential operations:
1. **Image Clarity Validation** — Ensures image quality for disease detection
2. **Disease Classification** — Identifies crop disease from image
3. **LLM Analysis** — Generates agronomic advice using Groq (online) or Ollama (offline)

---

## 📍 Endpoint Details

### Request

**Path:** `/api/v1/crop-analysis`  
**Method:** `POST`  
**Content-Type:** `multipart/form-data`

### Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `file` | binary (image) | ✅ Yes | Image file (JPG, PNG, etc.) | `leaf.jpg` |
| `crop_type` | string | ❌ No | Crop type for context | `"tomato"`, `"potato"`, `"grape"`, `"apple"`, or `"auto"` (default) |

### Request Examples

#### cURL
```bash
curl -X POST http://localhost:8000/api/v1/crop-analysis \
  -F "file=@leaf.jpg" \
  -F "crop_type=tomato"
```

#### Python (requests library)
```python
import requests

files = {'file': open('leaf.jpg', 'rb')}
data = {'crop_type': 'tomato'}

response = requests.post(
    'http://localhost:8000/api/v1/crop-analysis',
    files=files,
    data=data
)

print(response.json())
```

#### JavaScript (fetch API)
```javascript
const formData = new FormData();
formData.append('file', document.getElementById('fileInput').files[0]);
formData.append('crop_type', 'tomato');

const response = await fetch('http://localhost:8000/api/v1/crop-analysis', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result);
```

---

## 📤 Response Format

### Success Response (HTTP 200)

```json
{
  "status": "success",
  "filename": "leaf.jpg",
  "analysis": {
    "disease_detected": "Tomato Yellow Leaf Curl Virus",
    "severity": "High",
    "confidence": 0.95,
    "architecture": "EfficientNet-B4 + Transformer",
    "timestamp": 1712000000.0,
    "detected_objects": [
      {
        "label": "Pathology-Region",
        "box": [100, 100, 300, 300],
        "score": 0.95
      }
    ]
  },
  "intelligence": {
    "disease": "Tomato Yellow Leaf Curl Virus",
    "severity_level": "High",
    "crop_type": "tomato",
    "provider": "groq",
    "online": true,
    "ai_engine": "groq:llama-3.1-8b-instant",
    "timestamp": 1712000000.0,
    "ai_insights": {
      "summary": "Tomato Yellow Leaf Curl Virus is a viral disease that causes yellowing of leaves and stunted growth...",
      "remedies": [
        "Use resistant varieties of tomatoes",
        "Practice good sanitation and hygiene in the field",
        "Remove and destroy infected plants",
        "Use insecticides to control whiteflies...",
        "Apply foliar sprays of neem oil..."
      ],
      "location": "Ahmedabad, Gujarat, India",
      "time_context": "Best time for action is during the early stages of infection, ideally within 7-10 days...",
      "recovery": "Recovery time range is 2-4 weeks, depending on severity and treatment effectiveness.",
      "preventive_note": "Use crop rotation and intercropping to break the disease cycle..."
    }
  },
  "metadata": {
    "engine": "Crop-Vision 4.0 (Custom Embedding)",
    "processor": "FastAPI Hybrid Worker"
  }
}
```

### Response Fields Breakdown

#### Top-Level Fields
| Field | Type | Description |
|-------|------|-------------|
| `status` | string | `"success"` if analysis completed |
| `filename` | string | Original uploaded filename |
| `analysis` | object | CV model disease detection output |
| `intelligence` | object | LLM agronomic advice output |
| `metadata` | object | Engine/processor information |

#### `analysis` Object (CV Model Output)
| Field | Type | Description |
|-------|------|-------------|
| `disease_detected` | string | Disease name identified by CV model |
| `severity` | string | `"Low"`, `"Moderate"`, `"High"` |
| `confidence` | float | Detection confidence (0.0–1.0) |
| `architecture` | string | ML model architecture used |
| `timestamp` | float | Unix timestamp of analysis |
| `detected_objects` | array | Bounding boxes and confidence scores |

#### `intelligence` Object (LLM Output)
| Field | Type | Description |
|-------|------|-------------|
| `disease` | string | Disease name passed to LLM |
| `severity_level` | string | `"Low"`, `"Moderate"`, `"High"` |
| `crop_type` | string | Crop type used for context |
| `provider` | string | `"groq"`, `"ollama"`, or `"fallback"` |
| `online` | boolean | Whether internet was available |
| `ai_engine` | string | Model identifier (e.g., `"groq:llama-3.1-8b-instant"`) |
| `timestamp` | float | Unix timestamp of LLM analysis |
| `ai_insights` | object | Structured agronomic advice |

#### `ai_insights` Object (Always Present)
| Field | Type | Description |
|-------|------|-------------|
| `summary` | string | Disease summary and context |
| `remedies` | array[string] | 5 actionable treatment steps |
| `location` | string | Recommended location/region context |
| `time_context` | string | Best time of day for intervention |
| `recovery` | string | Estimated recovery timeframe |
| `preventive_note` | string | Long-term prevention strategy |

---

## ❌ Error Responses

### 400 Bad Request — Invalid Image
```json
{
  "detail": "Image clarity validation failed: Image too blurry (sharpness below threshold)."
}
```

**Common image clarity errors:**
- `"Image too blurry"` — Laplacian sharpness < 130
- `"Image too dark"` — Brightness mean < 50

### 400 Bad Request — Invalid File Type
```json
{
  "detail": "Uploaded file must be an image."
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error during analysis."
}
```

---

## 🔄 Provider Behavior

### Online (Internet Available)
- Uses **Groq** LLM for real-time inference
- Provider: `"groq"`
- Engine: `"groq:llama-3.1-8b-instant"`
- Fast, contextual agronomic advice

### Offline (No Internet)
- Falls back to **Ollama** (local model)
- Provider: `"ollama"`
- Engine: `"ollama:llama3"`
- Local inference, no external API dependency

### Both Unavailable
- Falls back to **static advice template**
- Provider: `"fallback"`
- Engine: `"fallback:static"`
- Generic but safe recommendations

---

## 🚀 Complete Example (Python)

```python
import requests
import json

# 1. Prepare file and parameters
image_path = "tomato_leaf.jpg"
crop_type = "tomato"

# 2. Make API request
with open(image_path, 'rb') as f:
    files = {'file': f}
    data = {'crop_type': crop_type}
    
    response = requests.post(
        'http://localhost:8000/api/v1/crop-analysis',
        files=files,
        data=data,
        timeout=30
    )

# 3. Handle response
if response.status_code == 200:
    result = response.json()
    
    # Extract key information
    disease = result['analysis']['disease_detected']
    severity = result['analysis']['severity']
    confidence = result['analysis']['confidence']
    
    # Get agronomic advice
    advice = result['intelligence']['ai_insights']
    provider = result['intelligence']['provider']
    
    print(f"Disease: {disease} ({severity} severity, {confidence:.0%} confidence)")
    print(f"Provider: {provider}")
    print(f"\nSummary: {advice['summary']}")
    print(f"\nRemedies:")
    for i, remedy in enumerate(advice['remedies'], 1):
        print(f"  {i}. {remedy}")
    print(f"\nRecovery: {advice['recovery']}")
    print(f"Preventive: {advice['preventive_note']}")
else:
    print(f"Error: {response.status_code}")
    print(response.json()['detail'])
```

---

## ⚙️ Environment Configuration

Required `.env` file in `backend/` directory:

```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant
GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions

OLLAMA_URL=http://localhost:11434/api/generate
OLLAMA_MODEL=llama3

LLM_TIMEOUT_SECONDS=20
```

---

## 📊 Summary Table

| Aspect | Details |
|--------|---------|
| **Endpoint** | `POST /api/v1/crop-analysis` |
| **Required Parameters** | 1: `file` (binary image) |
| **Optional Parameters** | 1: `crop_type` (string) |
| **Total Parameters** | 2 |
| **Content-Type** | `multipart/form-data` |
| **Response Fields** | 5 top-level + 15+ nested |
| **Providers** | Groq (online), Ollama (offline), Fallback (both unavailable) |
| **Response Times** | 3–8s (Groq), 2–5s (Ollama/Fallback) |
