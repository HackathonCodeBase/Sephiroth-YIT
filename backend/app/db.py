import os
import sqlite3

DATABASE_URL = os.getenv("TURSO_DATABASE_URL", "sqlite:///./outbreaks.db").replace("sqlite:///", "")

def get_db():
    conn = sqlite3.connect(DATABASE_URL, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            latitude REAL,
            longitude REAL,
            crop TEXT,
            disease TEXT,
            description TEXT
        )
    """)
    conn.commit()
    conn.close()

init_db()
