from db import connect_db

def list_notes():
    with connect_db() as conn:
        return conn.execute(
            "SELECT id, title, content, created_at, updated_at FROM notes ORDER BY id DESC"
        ).fetchall()

def find_note(note_id):
    with connect_db() as conn:
        return conn.execute(
            "SELECT id, title, content, created_at, updated_at FROM notes WHERE id = %s",
            (note_id,),
        ).fetchone()

def create_note(title, content):
    with connect_db() as conn:
        return conn.execute(
            "INSERT INTO notes (title, content) VALUES (%s, %s) RETURNING id, title, content, created_at, updated_at",
            (title, content),
        ).fetchone()

def update_note(note_id, title, content):
    with connect_db() as conn:
        return conn.execute(
            "UPDATE notes SET title = %s, content = %s, updated_at = NOW() WHERE id = %s RETURNING id, title, content, created_at, updated_at",
            (title, content, note_id),
        ).fetchone()

def delete_note(note_id):
    with connect_db() as conn:
        return conn.execute(
            "DELETE FROM notes WHERE id = %s RETURNING id",
            (note_id,),
        ).fetchone()
