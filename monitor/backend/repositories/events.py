from db import connect_db

def create_event(method, path, status_code, event_type):
    with connect_db() as conn:
        return conn.execute(
            "INSERT INTO http_events (method, path, status_code, event_type) VALUES (%s, %s, %s, %s) RETURNING id, occurred_at, method, path, status_code, event_type",
            (method, path, status_code, event_type),
        ).fetchone()

def list_events(limit=100):
    with connect_db() as conn:
        return conn.execute(
            "SELECT id, occurred_at, method, path, status_code, event_type FROM http_events ORDER BY id DESC LIMIT %s",
            (limit,),
        ).fetchall()
