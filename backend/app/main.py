from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.database import check_database_connection

app = FastAPI(
    title="RigCheck QA API",
    description="Hardware quality assurance and defect management API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root() -> dict[str, str]:
    return {
        "message": "RigCheck QA API is running",
    }


@app.get("/health")
async def health_check() -> JSONResponse:
    try:
        await check_database_connection()
        return JSONResponse(
            status_code=200,
            content={
                "status": "healthy",
                "service": "rigcheck-qa-api",
                "database": "connected",
            },
        )
    except Exception:
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "service": "rigcheck-qa-api",
                "database": "disconnected",
            },
        )