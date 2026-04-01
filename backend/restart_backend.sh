#!/bin/bash
pkill -f uvicorn
source venv/bin/activate
nohup python3 run.py > backend.log 2>&1 &
echo $!
