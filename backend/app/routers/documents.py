import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.auth_utils import get_current_user
from app.db import get_conn

router = APIRouter(prefix="/api/documents", tags=["documents"])


class SaveDocumentRequest(BaseModel):
    documentType: str
    fields: dict


class DocumentResponse(BaseModel):
    id: int
    documentType: str
    fields: dict
    createdAt: str
    updatedAt: str


def _row_to_doc(row) -> DocumentResponse:
    return DocumentResponse(
        id=row["id"],
        documentType=row["document_type"],
        fields=json.loads(row["fields_json"]),
        createdAt=row["created_at"],
        updatedAt=row["updated_at"],
    )


@router.get("", response_model=list[DocumentResponse])
def list_documents(user: dict = Depends(get_current_user)) -> list[DocumentResponse]:
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM documents WHERE user_id = ? ORDER BY created_at DESC",
            (user["id"],),
        ).fetchall()
    return [_row_to_doc(r) for r in rows]


@router.post("", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
def save_document(body: SaveDocumentRequest, user: dict = Depends(get_current_user)) -> DocumentResponse:
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    with get_conn() as conn:
        cursor = conn.execute(
            "INSERT INTO documents (user_id, document_type, fields_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
            (user["id"], body.documentType, json.dumps(body.fields), now, now),
        )
        doc_id = cursor.lastrowid
        row = conn.execute("SELECT * FROM documents WHERE id = ?", (doc_id,)).fetchone()
    return _row_to_doc(row)


@router.get("/{doc_id}", response_model=DocumentResponse)
def get_document(doc_id: int, user: dict = Depends(get_current_user)) -> DocumentResponse:
    with get_conn() as conn:
        row = conn.execute(
            "SELECT * FROM documents WHERE id = ? AND user_id = ?", (doc_id, user["id"])
        ).fetchone()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return _row_to_doc(row)


@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(doc_id: int, user: dict = Depends(get_current_user)) -> None:
    with get_conn() as conn:
        result = conn.execute(
            "DELETE FROM documents WHERE id = ? AND user_id = ?", (doc_id, user["id"])
        )
    if result.rowcount == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
