import os

os.environ.setdefault("JWT_SECRET", "test-jwt-secret-for-pytest-min-32-chars-long")
os.environ.setdefault("JWT_ALGORITHM", "HS256")
os.environ.setdefault(
    "DATABASE_URL",
    "postgresql+psycopg://jobtrack:jobtrack@localhost:5432/jobtrack",
)
