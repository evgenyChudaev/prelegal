from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from app.db import init_db
from app.routers import auth, chat

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"


@asynccontextmanager
async def lifespan(_app: FastAPI):
    load_dotenv()
    init_db()
    yield


app = FastAPI(title="Prelegal", lifespan=lifespan)
app.include_router(auth.router)
app.include_router(chat.router)


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


if STATIC_DIR.exists():
    app.mount("/_next", StaticFiles(directory=STATIC_DIR / "_next"), name="next-assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        """Serve the Next.js static export. Tries `<path>.html` then `<path>/index.html`, falling back to 404.html."""
        if full_path.startswith("api/"):
            return JSONResponse({"detail": "Not Found"}, status_code=404)

        candidates = []
        if full_path:
            candidates.append(STATIC_DIR / f"{full_path}.html")
            candidates.append(STATIC_DIR / full_path / "index.html")
            candidates.append(STATIC_DIR / full_path)
        else:
            candidates.append(STATIC_DIR / "index.html")

        for candidate in candidates:
            if candidate.is_file():
                return FileResponse(candidate)

        not_found = STATIC_DIR / "404.html"
        if not_found.is_file():
            return FileResponse(not_found, status_code=404)
        return JSONResponse({"detail": "Not Found"}, status_code=404)
