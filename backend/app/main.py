import time
import uuid

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import api_router
from app.core.config import get_settings
from app.core.logging import configure_logging, get_logger
from app.utils.exceptions import AppError

configure_logging(get_settings().log_level)
log = get_logger(__name__)

app = FastAPI(title="JobTrack API", version="1.0.0")

settings = get_settings()
_origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
# Нельзя использовать allow_origins=["*"] вместе с allow_credentials=True (браузер отклонит).
if not _origins:
    _origins = [
        "http://localhost",
        "http://localhost:80",
        "http://127.0.0.1",
        "http://127.0.0.1:80",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _http_detail(detail: str | list | dict | None) -> str | list | dict:
    if isinstance(detail, str):
        return detail
    if isinstance(detail, (list, dict)):
        return detail
    if detail is None:
        return "Error"
    return str(detail)


@app.middleware("http")
async def request_logging(request: Request, call_next):
    request_id = str(uuid.uuid4())
    start = time.perf_counter()
    try:
        response = await call_next(request)
    except Exception:
        log.error("request_failed", request_id=request_id, path=request.url.path)
        raise
    duration_ms = (time.perf_counter() - start) * 1000
    log.info(
        "request",
        request_id=request_id,
        method=request.method,
        path=request.url.path,
        status_code=response.status_code,
        duration_ms=round(duration_ms, 2),
    )
    return response


@app.exception_handler(AppError)
async def app_error_handler(_: Request, exc: AppError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": exc.code, "message": exc.message}},
    )


@app.exception_handler(HTTPException)
async def http_exc_handler(_: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": "http_error", "message": _http_detail(exc.detail)}},
    )


@app.exception_handler(RequestValidationError)
async def validation_handler(_: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"error": {"code": "validation_error", "message": "Validation failed", "details": exc.errors()}},
    )


@app.exception_handler(Exception)
async def unhandled(request: Request, exc: Exception):
    if isinstance(exc, HTTPException):
        return await http_exc_handler(request, exc)
    log.exception("unhandled", error=str(exc))
    return JSONResponse(
        status_code=500,
        content={"error": {"code": "internal_error", "message": "Internal server error"}},
    )


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(api_router, prefix="/api")
