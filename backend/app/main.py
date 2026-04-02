from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from app.api.v1.endpoints.analysis import router as analysis_router
from app.api.v1.endpoints.websockets import router as websockets_router
from app.api.v1.endpoints.outbreaks import router as outbreaks_router
from app.api.v1.endpoints.temporal import router as temporal_router

load_dotenv()

app = FastAPI(
    title="Crop-Sense AI",
    description="Agronomist Real-Time Intelligence & Crop Disease System",
    version="2.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Crop-Sense AI Hub (Backend API)"}

@app.get("/api/health")
def health_check():
    return {"status": "active", "version": "2.1.0"}

# Including routers
app.include_router(analysis_router, prefix="/api/v1", tags=["Analysis"])
app.include_router(outbreaks_router, prefix="/api/v1", tags=["Outbreaks"])
app.include_router(websockets_router, prefix="/api/v1", tags=["WebSockets"])
app.include_router(temporal_router, prefix="/api/v1/temporal", tags=["Temporal Analysis"])
