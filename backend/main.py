"""FastAPI server for the Smart Document Generation Agent."""

import os
import shutil
import uuid
from pathlib import Path

from groq import Groq
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from pydantic import BaseModel

from agent import run_agent_stream
from mock_data import documents_db, signatures_db, TEMPLATES
from tools import OUTPUT_DIR, UPLOAD_DIR

load_dotenv()

app = FastAPI(title="Smart Document Generation Agent", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_groq_client = None


def get_groq_client() -> Groq:
    global _groq_client
    if _groq_client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="GROQ_API_KEY is not set")
        _groq_client = Groq(api_key=api_key)
    return _groq_client


# ── Request models ────────────────────────────────────────────────────────────

class GenerateRequest(BaseModel):
    document_type: str
    form_data: dict


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.post("/api/generate")
async def generate_document(body: GenerateRequest):
    """Stream agent progress events as Server-Sent Events."""
    client = get_groq_client()

    async def event_stream():
        async for chunk in run_agent_stream(body.document_type, body.form_data, client):
            yield chunk

    return StreamingResponse(event_stream(), media_type="text/event-stream", headers={"X-Accel-Buffering": "no", "Cache-Control": "no-cache"})


@app.get("/api/documents")
def list_documents():
    return documents_db


@app.get("/api/documents/{doc_id}/download")
def download_document(doc_id: str):
    """Return the PDF for a given document ID."""
    doc = next((d for d in documents_db if d["id"] == doc_id), None)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    pdf_path = OUTPUT_DIR / f"{doc_id}.pdf"
    if not pdf_path.exists():
        raise HTTPException(status_code=404, detail="PDF not yet generated")
    return FileResponse(str(pdf_path), media_type="application/pdf", filename=f"{doc_id}.pdf")


@app.get("/api/templates")
def list_templates():
    return list(TEMPLATES.values())


@app.post("/api/templates/upload")
async def upload_template(file: UploadFile = File(...)):
    """Accept a .docx or .xlsx upload and save it."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    ext = Path(file.filename).suffix.lower()
    if ext not in {".docx", ".xlsx"}:
        raise HTTPException(status_code=400, detail="Only .docx and .xlsx files are accepted")

    save_path = UPLOAD_DIR / f"{uuid.uuid4().hex}{ext}"
    with save_path.open("wb") as f:
        shutil.copyfileobj(file.file, f)

    size_kb = round(save_path.stat().st_size / 1024)
    return {
        "id": f"tpl-{uuid.uuid4().hex[:8]}",
        "name": Path(file.filename).stem,
        "extension": ext.lstrip("."),
        "size": f"{size_kb} KB",
        "file_path": str(save_path),
        "message": "Template uploaded successfully",
    }


@app.get("/api/signatures")
def list_signatures():
    return signatures_db


@app.get("/health")
def health():
    return {"status": "ok", "model": "llama-3.3-70b-versatile", "tools": 6}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
