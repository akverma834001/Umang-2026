import os
import sys

# Add project root and backend directories to sys.path
_current_dir = os.path.dirname(os.path.abspath(__file__))
_root_dir = os.path.dirname(_current_dir)
_backend_dir = os.path.join(_root_dir, "backend")

for _p in (_root_dir, _backend_dir):
    if _p not in sys.path:
        sys.path.insert(0, _p)

# Import the FastAPI instance for Vercel Serverless Function runtime
from backend.app.main import app
