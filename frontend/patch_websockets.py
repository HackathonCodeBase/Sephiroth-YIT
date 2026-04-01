import re

with open('../backend/app/api/v1/endpoints/websockets.py', 'r') as f:
    content = f.read()

content = content.replace("dist <= 3.0", "dist <= 2.0")

with open('../backend/app/api/v1/endpoints/websockets.py', 'w') as f:
    f.write(content)
