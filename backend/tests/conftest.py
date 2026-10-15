import sys
import os
import pytest

# Add workspace root and backend directory to sys.path so 'backend.app...' and 'app...' always resolve
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
for p in (base_dir, backend_dir):
    if p not in sys.path:
        sys.path.insert(0, p)

from backend.app.database.seed import seed_database

@pytest.fixture(scope="session", autouse=True)
def initialize_database():
    """Ensure database schema is created and default seeds exist for test suite."""
    seed_database(seed_fixtures=True)
