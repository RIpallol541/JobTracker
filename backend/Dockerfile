FROM python:3.12-slim

WORKDIR /app

# Без apt-get: сборка не зависит от зеркал Debian (избегаем 502/сетевых сбоев на deb.debian.org).

COPY requirements.txt .
# Долгий timeout и больше повторов: иначе на медленной сети падает на files.pythonhosted.org (дефолт pip ~15s).
RUN pip install --no-cache-dir --timeout=120 --retries=10 -r requirements.txt

COPY alembic.ini alembic.ini
COPY alembic alembic
COPY app app
COPY scripts scripts

ENV PYTHONPATH=/app

# Убрать CR, если скрипт сохранён в Windows с CRLF (иначе в контейнере ломается запуск)
RUN sed -i 's/\r$//' /app/scripts/entrypoint.sh && chmod +x /app/scripts/entrypoint.sh

EXPOSE 8000

# Явный /bin/sh + абсолютный путь: на Windows при CRLF в .sh прямой exec по shebang даёт "no such file or directory"
ENTRYPOINT ["/bin/sh", "/app/scripts/entrypoint.sh"]
