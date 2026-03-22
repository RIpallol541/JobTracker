#!/bin/sh
set -e
cd /app
export PYTHONPATH=/app

alembic upgrade head

# Seed не должен ронять весь контейнер (иначе Uvicorn не стартует и frontend не стартует).
case "$(printf '%s' "${RUN_SEED:-false}" | tr '[:upper:]' '[:lower:]')" in
  true|1|yes|on)
    if ! python -m scripts.seed; then
      echo "WARN: seed script failed, continuing without seed" >&2
    fi
    ;;
  *) ;;
esac

exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --proxy-headers --forwarded-allow-ips='*'
