from flask import Flask

from routes.auth import auth_bp
from routes.events import events_bp
from routes.notes import notes_bp


def create_app():
    app = Flask(__name__)
    app.json.ensure_ascii = False
    app.register_blueprint(auth_bp)
    app.register_blueprint(events_bp)
    app.register_blueprint(notes_bp)

    @app.get("/health")
    def health():
        return {"service": "monitor", "status": "ok"}

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5200)
