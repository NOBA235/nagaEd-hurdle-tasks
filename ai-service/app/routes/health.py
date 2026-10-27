from fastapi import APIRouter
from app.core.config import settings

router = APIRouter(tags=["Health"])

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "nagaed-ai-service",
        "model": settings.GROQ_MODEL,
        "environment": settings.ENVIRONMENT,
    }

