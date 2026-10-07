CREATE TABLE IF NOT EXISTS posts (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT NOT NULL
);

INSERT INTO posts (title, body)
SELECT '첫 번째 공지', '새 프로젝트를 시작합니다.'
WHERE NOT EXISTS (SELECT 1 FROM posts);

INSERT INTO posts (title, body)
SELECT '실습 안내', '게시글 번호를 바꿔 보세요.'
WHERE (SELECT COUNT(*) FROM posts) = 1;
