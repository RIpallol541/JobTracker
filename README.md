# JobTrack

Веб-приложение для учёта поиска работы: вакансии, отклики, собеседования, офферы, заметки, дашборд и сравнение офферов по настраиваемым весам критериев.

## Стек

| Слой | Технологии |
|------|------------|
| Backend | Python 3.12, FastAPI, SQLAlchemy 2.0, Alembic, Pydantic v2, psycopg 3, JWT (python-jose), **bcrypt**, Uvicorn, structlog |
| Frontend | React 18, TypeScript, Vite, React Router, Axios, Tailwind CSS, Zustand, react-hot-toast |
| БД | PostgreSQL 16 |
| Запуск | **Docker Compose**: сервисы `db`, `backend`, `frontend` (Nginx отдаёт собранный SPA, `/api` проксируется на backend) |

---

## Запуск (основной сценарий — Docker)

### 1. Установите и запустите Docker

- **Windows / macOS:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) — дождитесь статуса **Running**.
- **Linux:** Docker Engine + Docker Compose plugin.

Проверка:

```powershell
docker version
```

Должны быть и **Client**, и **Server**. Если Server нет — демон Docker не запущен.

### 2. Перейдите в корень репозитория

Каталог, где лежит `docker-compose.yml` (пример):

```powershell
cd C:\Users\ВашПользователь\PycharmProjects\Alxi
```

### 3. Создайте файл окружения

```powershell
copy .env.example .env
```

Файл `.env` подхватывает `docker compose`. Для локальной разработки значений из `.env.example` обычно достаточно. Для «боевого» развертывания смените **`JWT_SECRET`** и пароли БД.

### 4. Соберите образы и поднимите контейнеры

```powershell
docker compose up -d --build
```

- Первый запуск может занять **несколько минут** (сборка `backend`/`frontend`, `pip`/`npm`, миграции Alembic, при `RUN_SEED=true` — демо-данные).
- Порядок: `db` → healthy → `backend` (миграции, опционально seed, Uvicorn) → healthy → `frontend`.

Просмотр логов:

```powershell
docker compose logs -f backend
```

### 5. Откройте приложение

| Ресурс | URL |
|--------|-----|
| Интерфейс (Nginx + SPA) | http://localhost |
| Swagger (API) | http://localhost:8000/docs |
| Проверка API | http://localhost:8000/health |

Браузер ходит на тот же хост: запросы к **`/api/...`** обрабатывает Nginx и проксирует на backend.

**Демо-вход** (после успешного seed):

| Поле | Значение |
|------|----------|
| Электронная почта | `demo@example.com` |
| Пароль | `DemoPass123!` |

### Остановка

```powershell
docker compose down
```

Данные PostgreSQL по умолчанию хранятся в **именованном томе** `postgres_data` — при `docker compose down` **без** `-v` база сохраняется. Полное удаление данных БД: `docker compose down -v` (осторожно).

---

## Что происходит при старте backend

1. `alembic upgrade head` — миграции.
2. Если `RUN_SEED` включён (`true` / `1` / `yes` / `on`), выполняется `python -m scripts.seed`.
3. Seed **идемпотентен**: если пользователь `demo@example.com` уже есть, повторная вставка демо-данных **не выполняется**.
4. Запуск Uvicorn на порту 8000.

---

## Повторная заливка демо-данных (reseed)

Чтобы снова создать расширенный набор демо (вакансии, отклики, собеседования, офферы, заметки), после обновления кода **пересоберите backend** (в образ попадают скрипты из `backend/scripts/`), затем:

```powershell
docker compose build backend
docker compose up -d
docker compose exec backend python -m scripts.reseed_demo
```

Альтернатива той же команде:

```powershell
docker compose exec backend python /app/scripts/reseed_demo.py
```

Скрипт удаляет пользователя `demo@example.com` и связанные с ним строки (каскадом), затем снова вызывает `seed()`. Остальные учётные записи в БД не трогаются.

---

## Пересборка после правок кода

```powershell
docker compose build --no-cache
docker compose up -d
```

Только backend или только frontend:

```powershell
docker compose build backend
docker compose build frontend
```

---

## Переменные окружения (корневой `.env`)

Шаблон — `.env.example`. Основное:

| Переменная | Назначение |
|------------|------------|
| `POSTGRES_*` | Пользователь, пароль и имя БД для контейнера PostgreSQL |
| `JWT_SECRET` | Секрет подписи JWT (в продакшене — длинная случайная строка) |
| `JWT_ALGORITHM` | Алгоритм JWT (по умолчанию `HS256`) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Время жизни токена |
| `CORS_ORIGINS` | Разрешённые origin для браузера (через запятую) |
| `RUN_SEED` | Запускать ли демо-seed при старте backend |
| `LOG_LEVEL` | Уровень логов backend |

`DATABASE_URL` для контейнера backend задаётся в `docker-compose.yml` и обычно не прописывается в `.env` вручную.

---

## Устранение неполадок

| Симптом | Что сделать |
|---------|-------------|
| Ошибка `dockerDesktopLinuxEngine` / pipe | Запустите Docker Desktop, дождитесь готовности демона. |
| Поднялся только `db` | `docker compose logs backend -f` — смотрите миграции, подключение к БД, `JWT_SECRET`. |
| `No module named scripts.reseed_demo` | Пересоберите образ: `docker compose build backend`. |
| Ошибка bcrypt / passlib в контейнере | В проекте пароли хешируются через **bcrypt** напрямую; пересоберите backend: `docker compose build --no-cache backend`. |
| `entrypoint.sh: no such file` | В образе используется `/bin/sh` и правка CRLF; пересоберите backend: `docker compose build --no-cache backend`. |
| Таймауты `pip` при сборке backend | В `backend/Dockerfile` заданы увеличенные timeout/retries; повторите сборку или проверьте сеть/VPN/DNS. |
| Логи Postgres `locale: not found` | Для образа `postgres:alpine` часто не критично. |

---

## Локальный запуск без Docker (опционально)

Нужны **Python 3.12**, **Node.js 20+**, установленный **PostgreSQL**, переменные как в `backend/.env.example` (в т.ч. `DATABASE_URL` на вашу БД).

- Backend: `cd backend` → виртуальное окружение → `pip install -r requirements.txt` → `alembic upgrade head` → `uvicorn app.main:app --reload --host 127.0.0.1 --port 8000` (задайте `PYTHONPATH` на каталог `backend`).
- Frontend: `cd frontend` → `npm install` → `npm run dev` → http://localhost:5173 (в `vite.config.ts` прокси `/api` на порт backend).

---

## Структура репозитория

```
.
├── docker-compose.yml
├── .env.example
├── README.md
├── docs/
│   └── ЗАПУСК.md          # краткая памятка по запуску
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── alembic/
│   ├── app/
│   └── scripts/
│       ├── entrypoint.sh  # миграции, seed, uvicorn
│       ├── seed.py        # первичные демо-данные
│       └── reseed_demo.py # повторная заливка демо для demo@example.com
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    └── src/
```

---

## Миграции и seed вручную (локальный backend)

```powershell
cd backend
alembic upgrade head
python -m scripts.seed
```

---

## Тесты backend

```powershell
cd backend
$env:JWT_SECRET="your-test-secret-at-least-32-chars-long-ok"
pytest tests -v
```

---

## API (префикс `/api`)

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- CRUD: вакансии, отклики, собеседования, офферы, заметки
- `GET /api/dashboard/summary`
- `GET /api/offers/compare`, `POST /api/offers/compare-score`
- `GET /health` — без авторизации

---

## Безопасность

- Пароли хранятся как bcrypt-хэши.
- Секрет JWT только в переменных окружения.
- Доступ к данным по `user_id` из JWT.

---

## Примечания по реализации (кратко)

CORS без `*` при credentials; маршруты списков откликов/интервью согласованы с путями фронта; healthcheck backend через встроенный Python; образ backend без `apt-get`; Nginx проксирует `/api` на backend с таймаутами и лимитом тела запроса.
