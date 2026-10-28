import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sbu_events.db")

# If user provided a postgres:// URL (older format or from Heroku/Neon), convert to postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

is_serverless = bool(os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME"))

# Ensure relative SQLite path resolves reliably to project root or backend db
if DATABASE_URL in ("sqlite:///./sbu_events.db", "sqlite:///sbu_events.db") or DATABASE_URL.startswith("sqlite:///"):
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
    root_db = os.path.join(root_dir, "sbu_events.db")
    backend_db = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "sbu_events.db"))
    target_db = root_db if os.path.exists(root_db) else backend_db

    # On Vercel / serverless environment, the function filesystem is read-only.
    # Copy pre-seeded sqlite database to /tmp if running under Vercel
    if is_serverless:
        import shutil
        tmp_db = "/tmp/sbu_events.db"
        candidates = [
            target_db,
            root_db,
            backend_db,
            os.path.join(os.getcwd(), "sbu_events.db"),
            os.path.join(os.getcwd(), "backend", "sbu_events.db"),
            "/var/task/sbu_events.db",
            "/var/task/backend/sbu_events.db",
        ]
        source_db = next((c for c in candidates if c and os.path.exists(c) and os.path.isfile(c)), None)
        if source_db and not os.path.exists(tmp_db):
            try:
                shutil.copy2(source_db, tmp_db)
            except Exception as e:
                print(f"[Warning] Failed to copy pre-seeded database to /tmp: {e}")
        # Always use /tmp on serverless when SQLite is active
        target_db = tmp_db

    DATABASE_URL = f"sqlite:///{target_db.replace(os.sep, '/')}"

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
    echo=False
)

# Enable foreign keys and safe journal mode for SQLite
if DATABASE_URL.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        try:
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            if is_serverless:
                cursor.execute("PRAGMA journal_mode=DELETE")
            else:
                cursor.execute("PRAGMA journal_mode=WAL")
            cursor.close()
        except Exception:
            pass

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
