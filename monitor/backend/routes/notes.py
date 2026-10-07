import psycopg
from flask import Blueprint, request

from repositories.notes import create_note, delete_note, find_note, list_notes, update_note

notes_bp = Blueprint("notes", __name__, url_prefix="/api")


def serialize_note(row):
    return {
        **row,
        "created_at": row["created_at"].isoformat(),
        "updated_at": row["updated_at"].isoformat(),
    }


def clean_note_input(data):
    if not isinstance(data, dict):
        return None, None, "제목과 내용을 JSON으로 보내 주세요."

    title = data.get("title")
    content = data.get("content")

    if not isinstance(title, str) or not isinstance(content, str):
        return None, None, "제목과 내용은 문자열이어야 합니다."

    title = title.strip()
    content = content.strip()

    if not title or not content:
        return title, content, "제목과 내용은 공백만 입력할 수 없습니다."

    return title, content, None


@notes_bp.get("/notes")
def get_notes():
    try:
        rows = list_notes()
    except psycopg.Error:
        return {"error": "메모 목록을 조회할 수 없습니다."}, 503
    return {"notes": [serialize_note(row) for row in rows]}


@notes_bp.get("/notes/<int:note_id>")
def get_note(note_id):
    try:
        row = find_note(note_id)
    except psycopg.Error:
        return {"error": "메모를 조회할 수 없습니다."}, 503
    if row is None:
        return {"error": "메모를 찾을 수 없습니다."}, 404
    return {"note": serialize_note(row)}


@notes_bp.post("/notes")
def post_note():
    title, content, error = clean_note_input(request.get_json(silent=True))
    if error:
        return {"error": error}, 400
    try:
        row = create_note(title, content)
    except psycopg.Error:
        return {"error": "메모를 저장할 수 없습니다."}, 503
    return {"note": serialize_note(row)}, 201


@notes_bp.put("/notes/<int:note_id>")
def put_note(note_id):
    try:
        current = find_note(note_id)
    except psycopg.Error:
        return {"error": "메모를 확인할 수 없습니다."}, 503

    if current is None:
        return {"error": "메모를 찾을 수 없습니다."}, 404

    title, content, error = clean_note_input(request.get_json(silent=True))
    if error:
        return {"error": error}, 400

    try:
        row = update_note(note_id, title, content)
    except psycopg.Error:
        return {"error": "메모를 수정할 수 없습니다."}, 503
    return {"note": serialize_note(row)}


@notes_bp.delete("/notes/<int:note_id>")
def remove_note(note_id):
    try:
        deleted = delete_note(note_id)
    except psycopg.Error:
        return {"error": "메모를 삭제할 수 없습니다."}, 503

    if deleted is None:
        return {"error": "메모를 찾을 수 없습니다."}, 404

    return {"message": "메모를 삭제했습니다.", "id": note_id}
