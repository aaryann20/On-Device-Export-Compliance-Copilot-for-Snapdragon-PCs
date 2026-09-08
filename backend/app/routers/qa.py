from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.services.rag_service import rag_engine

router = APIRouter(prefix="/api/qa", tags=["Document Q&A"])


class AskRequest(BaseModel):
    query: str


class AddDocRequest(BaseModel):
    title: str
    category: str
    content: str


@router.get("/documents")
def get_documents():
    return {"documents": rag_engine.list_documents()}


@router.post("/ask")
def ask_question(payload: AskRequest):
    if not payload.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    return rag_engine.ask(payload.query)


@router.post("/upload")
async def upload_document(
    title: str = Form(...),
    category: str = Form("User Document"),
    file: UploadFile = File(...)
):
    content_bytes = await file.read()
    try:
        content = content_bytes.decode("utf-8")
    except Exception:
        content = content_bytes.decode("latin-1", errors="ignore")

    doc_info = rag_engine.add_document(title=title, category=category, content=content, source=f"Upload ({file.filename})")
    return {"status": "success", "document": doc_info}


@router.post("/add")
def add_custom_document(payload: AddDocRequest):
    doc_info = rag_engine.add_document(title=payload.title, category=payload.category, content=payload.content)
    return {"status": "success", "document": doc_info}
