from fastapi import APIRouter
from app.db import get_db

router = APIRouter()

@router.get("/outbreaks")
async def get_outbreaks():
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id, timestamp, latitude, longitude, crop, disease, description FROM reports")
        rows = cursor.fetchall()
        
        result = []
        for row in rows:
            result.append(dict(row))
        
        conn.close()
        return result
    except Exception as e:
        print(f"Error reading from DB: {e}")
        return []
