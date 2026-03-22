from fastapi import APIRouter

from app.api.routes import applications, auth, dashboard, interviews, notes, offers, vacancies

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(vacancies.router)
api_router.include_router(applications.router)
api_router.include_router(interviews.router)
api_router.include_router(offers.router)
api_router.include_router(notes.router)
api_router.include_router(dashboard.router)
