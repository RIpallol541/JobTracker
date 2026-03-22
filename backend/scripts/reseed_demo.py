"""
Повторное заполнение демо-данными: удаляет пользователя demo@example.com и все связанные записи (CASCADE),
затем вызывает seed().

Запуск из контейнера backend (после пересборки образа: docker compose build backend):
  python -m scripts.reseed_demo

Или по пути к файлу (то же самое, если PYTHONPATH=/app):
  python /app/scripts/reseed_demo.py

Локально при настроенном DATABASE_URL и PYTHONPATH=корень backend:
  python -m scripts.reseed_demo
"""

from sqlalchemy import select

from app.db.models import User
from app.db.session import get_session_local

from scripts.seed import seed


def main() -> None:
    SessionLocal = get_session_local()
    db = SessionLocal()
    try:
        u = db.execute(select(User).where(User.email == "demo@example.com")).scalar_one_or_none()
        if u:
            db.delete(u)
            db.commit()
    finally:
        db.close()
    seed()


if __name__ == "__main__":
    main()
