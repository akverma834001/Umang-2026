import os
import sys

# Ensure project root and backend directories are in Python's module search path
_current_dir = os.path.dirname(os.path.abspath(__file__))
_root_dir = os.path.dirname(_current_dir)
_backend_dir = os.path.join(_root_dir, "backend")

for _path in (_root_dir, _backend_dir):
    if _path not in sys.path:
        sys.path.insert(0, _path)

# Import the FastAPI application instance
from backend.app.main import app

# Vercel's @vercel/python runtime automatically detects ASGI/WSGI applications named `app` or `handler`
handler = app
