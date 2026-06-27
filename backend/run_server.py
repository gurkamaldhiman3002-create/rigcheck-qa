from __future__ import annotations

import asyncio
import os
import sys
from pathlib import Path

import uvicorn


BACKEND_ROOT = Path(__file__).resolve().parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))


async def main() -> None:
    port = int(os.getenv("PORT", "8000"))
    config = uvicorn.Config("app.main:app", host="0.0.0.0", port=port)
    server = uvicorn.Server(config)
    await server.serve()


if __name__ == "__main__":
    asyncio.run(main())