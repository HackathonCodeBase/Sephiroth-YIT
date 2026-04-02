from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict
import json
import math

router = APIRouter()

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    # Radius of earth in kilometers
    R = 6371.0
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
    c = 2 * math.asin(math.sqrt(a))
    return R * c

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[WebSocket, dict] = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[websocket] = {"lat": None, "lon": None}

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            del self.active_connections[websocket]

    async def update_location(self, websocket: WebSocket, lat: float, lon: float):
        if websocket in self.active_connections:
            self.active_connections[websocket] = {"lat": lat, "lon": lon}

    async def broadcast_alert(self, alert_data: dict, source_lat: float, source_lon: float):
        # Notify clients based on proximity (<= 3km radius)
        for connection, loc in self.active_connections.items():
            try:
                custom_alert = alert_data.copy()
                has_loc = loc["lat"] is not None and loc["lon"] is not None
                
                if has_loc:
                    dist = haversine_distance(source_lat, source_lon, loc["lat"], loc["lon"])
                    custom_alert["client_distance_km"] = dist
                    custom_alert["is_at_risk"] = dist <= 2.0
                else:
                    custom_alert["client_distance_km"] = None
                    custom_alert["is_at_risk"] = False

                await connection.send_text(json.dumps(custom_alert))
            except Exception as e:
                print(f"WS error: {e}")
                pass

manager = ConnectionManager()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Receive location updates from clients
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                if msg.get("type") == "REGISTER_LOCATION":
                    await manager.update_location(websocket, msg.get("latitude"), msg.get("longitude"))
            except Exception:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket)
