from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routes import health, suggestions

app = FastAPI(
    title="NagaEd AI Username Microservice",
    description="Groq-powered AI username suggestion service for the NagaEd Software Developer platform.",
    version="1.0.0",
    docs_url="/docs",
    openapi_url="/openapi.json"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# Standardized Error Handler for Request Validation Errors (HTTP 422/400)
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    details = []
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error["loc"] if loc not in ("body",))
        details.append({
            "field": field or "body",
            "message": error["msg"]
        })

    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Invalid request data",
                "details": details
            }
        }
    )

# Standardized Error Handler for HTTPExceptions
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    if isinstance(exc.detail, dict):
        code = exc.detail.get("code", "ERROR")
        message = exc.detail.get("message", "An error occurred")
        details = exc.detail.get("details", [])
    else:
        code = "HTTP_ERROR"
        message = str(exc.detail)
        details = []

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": code,
                "message": message,
                "details": details
            }
        }
    )

# Include Routers
app.include_router(health.router)
app.include_router(suggestions.router)

