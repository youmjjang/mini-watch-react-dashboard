import psycopg
from flask import Blueprint, request

from repositories.events import create_event, list_events

events_bp = Blueprint("events", __name__, url_prefix="/api")
ALLOWED_METHODS = {"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"}


def serialize_event(row):
    return {**row, "occurred_at": row["occurred_at"].isoformat()}


@events_bp.post("/events")
def receive_event():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return {"error": "요청 기록 형식이 올바르지 않습니다."}, 400

    method = data.get("method")
    path = data.get("path")
    status_code = data.get("status_code")

    if not isinstance(method, str) or method.upper() not in ALLOWED_METHODS:
        return {"error": "method가 올바르지 않습니다."}, 400
    if not isinstance(path, str) or not path.startswith("/") or len(path) > 500:
        return {"error": "path가 올바르지 않습니다."}, 400
    if type(status_code) is not int or not 100 <= status_code <= 599:
        return {"error": "status_code가 올바르지 않습니다."}, 400

    try:
        row = create_event(method.upper(), path, status_code, "http_request")
    except psycopg.Error:
        return {"error": "감시 기록을 저장할 수 없습니다."}, 503

    return {"event": serialize_event(row)}, 201


@events_bp.get("/events")
def get_events():
    try:
        rows = list_events()
    except psycopg.Error:
        return {"error": "요청 기록을 조회할 수 없습니다."}, 503

    return {"events": [serialize_event(row) for row in rows]}
