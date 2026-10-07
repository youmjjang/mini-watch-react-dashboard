from flask import Blueprint, redirect, render_template, request, url_for

from post_rules import validate_post_input
from repositories.posts import create_post, delete_post, find_post, list_posts, update_post

posts_bp = Blueprint("posts", __name__)


def not_found_response():
    return render_template(
        "error.html",
        title="게시글 없음",
        message="게시글을 찾을 수 없습니다.",
    ), 404


@posts_bp.get("/")
def index():
    return render_template("index.html", posts=list_posts())


@posts_bp.get("/board/<int:post_id>")
def post_detail(post_id):
    post = find_post(post_id)
    if post is None:
        return not_found_response()
    return render_template("detail.html", post=post)


@posts_bp.route("/board/new", methods=["GET", "POST"])
def new_post():
    if request.method == "GET":
        return render_template("new.html", title="", body="", error=None)

    title, body, error = validate_post_input(
        request.form.get("title"),
        request.form.get("body"),
    )
    if error:
        return render_template("new.html", title=title, body=body, error=error), 400

    post = create_post(title, body)
    return redirect(url_for("posts.post_detail", post_id=post["id"]), code=303)


@posts_bp.route("/board/<int:post_id>/edit", methods=["GET", "POST"])
def edit_post(post_id):
    post = find_post(post_id)
    if post is None:
        return not_found_response()

    if request.method == "GET":
        return render_template(
            "edit.html",
            post_id=post_id,
            title=post["title"],
            body=post["body"],
            error=None,
        )

    title, body, error = validate_post_input(
        request.form.get("title"),
        request.form.get("body"),
    )
    if error:
        return render_template(
            "edit.html",
            post_id=post_id,
            title=title,
            body=body,
            error=error,
        ), 400

    if update_post(post_id, title, body) is None:
        return not_found_response()

    return redirect(url_for("posts.post_detail", post_id=post_id), code=303)


@posts_bp.route("/board/<int:post_id>/delete", methods=["GET", "POST"])
def delete_post_route(post_id):
    post = find_post(post_id)
    if post is None:
        return not_found_response()

    if request.method == "GET":
        return render_template("delete.html", post=post)

    if delete_post(post_id) is None:
        return not_found_response()

    return redirect(url_for("posts.index"), code=303)


@posts_bp.get("/posts/<int:post_id>")
def get_post(post_id):
    post = find_post(post_id)
    if post is None:
        return {"error": "게시글을 찾을 수 없습니다."}, 404
    return post
