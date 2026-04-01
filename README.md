# Sephiroth-YIT: Crop-Sense AI

An AI-powered crop disease intelligence system designed for field agronomists. Analyze leaf photographs using Computer Vision (TensorFlow) and Large Language Models (LLM) in real-time.

## 🚀 Key Features
- **Intelligent Diagnostics**: Supports ResNet and MobileNet architectures for disease classification.
- **LLM Insights**: Real-time expert advice and remediation strategies.
- **Drone Integration**: Dashboard uplink for field mission data.
- **Field Metrics**: Soil moisture, ambient temperature, and growth trend analysis.

## 📁 Project Structure
- `frontend/` - Next.js 15 UI with Tailwind CSS & Framer Motion.
- `backend/` - FastAPI Python backend with TensorFlow integration.

## 🛠️ Getting Started

### Backend (Python)
1. `cd backend`
2. `pip install -r requirements.txt`
3. Create `.env` from `.env.example` and set your API keys.
4. `python run.py` (Runs on `http://localhost:8000`)

### Backend LLM Environment Variables
- `GROQ_API_KEY`: Required for Groq online inference.
- `GROQ_MODEL`: Optional Groq model name (default: `llama-3.1-8b-instant`).
- `GROQ_API_URL`: Optional Groq endpoint URL.
- `OLLAMA_URL`: Local Ollama generate endpoint (default: `http://localhost:11434/api/generate`).
- `OLLAMA_MODEL`: Local model for offline fallback (default: `llama3`).
- `LLM_TIMEOUT_SECONDS`: Request timeout for LLM calls (default: `20`).

### LLM Provider Behavior
- If internet is available, backend uses Groq.
- If internet is unavailable, backend uses Ollama as fallback.
- API response format remains structured under `intelligence.ai_insights`.

### Frontend (Next.js)
1. `cd frontend`
2. `npm install`
3. `npm run dev` (Runs on `http://localhost:3000`)

## 🤖 Deployment
This application is designed to be deployable as a **local web application** for real-time field use.

---
Built with excellence for the Hackathon.
