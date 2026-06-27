import os
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes.builds import router as builds_router
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.defects import router as defects_router
from app.database import check_database_connection

app = FastAPI(
    title="RigCheck QA API",
    description="Hardware quality assurance and defect management API",
    version="0.1.0",
)

if os.name == "nt":
    # Use the selector event loop on Windows to be compatible with psycopg async
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(builds_router)
app.include_router(defects_router)
app.include_router(dashboard_router)


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