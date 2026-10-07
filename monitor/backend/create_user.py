import getpass

from werkzeug.security import generate_password_hash

from db import connect_db


def main():
    username = input("운영자 아이디: ").strip()
    password = getpass.getpass("운영자 비밀번호: ")

    if not username or not password.strip():
        print("아이디와 비밀번호는 비워 둘 수 없습니다.")
        return

    password_hash = generate_password_hash(password)

    with connect_db() as conn:
        row = conn.execute(
            """
            INSERT INTO users (username, password_hash)
            VALUES (%s, %s)
            ON CONFLICT (username)
            DO UPDATE SET password_hash = EXCLUDED.password_hash
            RETURNING id, username
            """,
            (username, password_hash),
        ).fetchone()

    print(f"운영자 계정 준비 완료: {row['username']} (id={row['id']})")


if __name__ == "__main__":
    main()
