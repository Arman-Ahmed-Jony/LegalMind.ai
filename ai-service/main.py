"""LegalMind AI service entrypoint.

Phase 0 only exposes a health check. Document processing, embeddings,
and LangChain are added in later phases.
"""

import os

from dotenv import load_dotenv
from fastapi import FastAPI

from app.api.health import router as health_router

load_dotenv()

app = FastAPI(title="LegalMind AI Service")
app.include_router(health_router)


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
