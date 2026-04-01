import uvicorn
import os

if __name__ == "__main__":
    # Ensure dependencies are loaded correctly
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
