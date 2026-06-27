from app.api.routes.builds import router as builds_router
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.defects import router as defects_router

__all__ = ["builds_router", "dashboard_router", "defects_router"]
