def validate_post_input(title, body):
    clean_title = (title or "").strip()
    clean_body = (body or "").strip()

    if not clean_title or not clean_body:
        return clean_title, clean_body, "제목과 내용을 모두 입력해 주세요."

    return clean_title, clean_body, None
