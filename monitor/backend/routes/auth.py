import psycopg
from flask import Blueprint, request
from werkzeug.security import check_password_hash

from repositories.users import find_user_by_username

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return {"error": "아이디와 비밀번호를 JSON으로 보내 주세요."}, 400

    username = data.get("username")
    password = data.get("password")

    if not isinstance(username, str) or not isinstance(password, str):
        return {"error": "아이디와 비밀번호를 문자열로 입력해 주세요."}, 400

    username = username.strip()
    if not username or not password.strip():
        return {"error": "아이디와 비밀번호를 모두 입력해 주세요."}, 400

    try:
        user = find_user_by_username(username)
    except psycopg.Error:
        return {"error": "계정 정보를 확인할 수 없습니다."}, 503

    if user is None or not check_password_hash(user["password_hash"], password):
        return {"error": "아이디 또는 비밀번호가 올바르지 않습니다."}, 401

    return {
        "message": "로그인 성공",
        "user": {"id": user["id"], "username": user["username"]},
    }
