# mini-watch React Monitoring Dashboard

SKT ALEPH 대전 A반 과제 **React와 Flask로 감시 대시보드 완성하기** 제출용 프로젝트입니다.

기존 mini-watch의 일반 게시판 흐름을 유지하면서 감시 서비스를 Flask API와 React 대시보드로 확장했습니다.

## 구성

```text
mini-watch-react-dashboard/
├─ general/
│  ├─ app.py
│  ├─ db.py
│  ├─ request_logging.py
│  ├─ post_rules.py
│  ├─ repositories/
│  ├─ routes/
│  ├─ templates/
│  ├─ static/
│  ├─ sql/
│  ├─ requirements.txt
│  └─ .env.example
├─ monitor/
│  ├─ backend/
│  │  ├─ app.py
│  │  ├─ db.py
│  │  ├─ create_user.py
│  │  ├─ routes/
│  │  │  ├─ auth.py
│  │  │  ├─ events.py
│  │  │  └─ notes.py
│  │  ├─ repositories/
│  │  │  ├─ users.py
│  │  │  ├─ events.py
│  │  │  └─ notes.py
│  │  ├─ sql/
│  │  ├─ requirements.txt
│  │  └─ .env.example
│  └─ frontend/
│     ├─ src/
│     │  ├─ App.jsx
│     │  ├─ components/
│     │  ├─ api/
│     │  └─ styles.css
│     ├─ package.json
│     ├─ package-lock.json
│     └─ vite.config.js
└─ .gitignore
```

## 사용한 시작 자료와 직접 구현한 부분

수업에서 이어서 사용하던 mini-watch의 일반 게시판 구조와 요청 기록 전송 흐름을 시작 자료로 사용했습니다.

이번 과제에서 직접 구현·정리한 부분은 다음과 같습니다.

- monitor Flask를 `routes`, `repositories`, `db.py` 역할로 분리
- `POST /api/auth/login` 로그인 API 구현
- DB 비밀번호 해시 검증으로 로그인 성공/실패 판정
- `GET /api/events` 요청 기록 조회 구현
- 관찰 메모 `GET/POST/PUT/DELETE` CRUD 구현
- 공백 입력 400, 없는 메모 404 응답 처리
- React + Vite 감시 대시보드 신규 구현
- React 화면을 역할별 컴포넌트로 분리
- API 요청 코드를 `src/api`에 분리
- 메모 작성·상세·수정·삭제 확인/취소 UI 구현
- 일반 서비스 요청 기록을 monitor Flask로 전송하는 흐름 유지
- Vite의 `/api` 요청을 5200 Flask 서버로 프록시
- 실제 설정값 대신 `.env.example` 제공

선택 심화 과제는 추가하지 않고 필수 기능 완성에 집중했습니다.

---

# 1. 필요한 프로그램

- Python 3
- PostgreSQL
- Node.js / npm

로컬 포트는 과제 기준을 그대로 사용합니다.

| 서비스 | 주소 |
| --- | --- |
| 일반 게시판 | http://127.0.0.1:5100 |
| 감시 Flask API | http://127.0.0.1:5200 |
| React 감시 화면 | http://127.0.0.1:5173 |

---

# 2. PostgreSQL 준비

PostgreSQL에서 먼저 두 데이터베이스를 만듭니다.

`general/sql/create_database.sql`

```sql
CREATE DATABASE general_db;
```

`monitor/backend/sql/create_database.sql`

```sql
CREATE DATABASE monitor_db;
```

그다음 각 DB에 접속해서 테이블 SQL을 실행합니다.

## general_db

`general/sql/posts.sql` 실행

## monitor_db

아래 순서로 실행합니다.

1. `monitor/backend/sql/users.sql`
2. `monitor/backend/sql/http_events.sql`
3. `monitor/backend/sql/notes.sql`

---

# 3. 환경 설정

실제 `.env`는 Git에 올리지 않습니다.

## general

`general/.env.example`을 복사하여 `general/.env`를 만듭니다.

```text
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=general_db
DB_USER=postgres
DB_PASSWORD=본인의_PostgreSQL_비밀번호
```

## monitor/backend

`monitor/backend/.env.example`을 복사하여 `monitor/backend/.env`를 만듭니다.

```text
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=monitor_db
DB_USER=postgres
DB_PASSWORD=본인의_PostgreSQL_비밀번호
```

---

# 4. 감시 운영자 계정 만들기

Windows CMD에서 실행합니다.

```bat
cd monitor\backend
python -m venv venv
venv\Scripts\activate
python -m pip install -r requirements.txt
python create_user.py
```

프로그램이 운영자 아이디와 비밀번호를 물어봅니다.

입력한 비밀번호는 평문 그대로 저장하지 않고 Werkzeug의 비밀번호 해시로 변환하여 `monitor_db.users`에 저장합니다.

---

# 5. 서비스 실행

세 개의 CMD 창을 사용하면 편합니다.

## CMD 1 - monitor Flask API

```bat
cd monitor\backend
venv\Scripts\activate
python app.py
```

확인:

`http://127.0.0.1:5200/health`

정상이면 monitor 서비스의 상태 JSON이 표시됩니다.

## CMD 2 - general 게시판

처음 실행하는 경우:

```bat
cd general
python -m venv venv
venv\Scripts\activate
python -m pip install -r requirements.txt
python app.py
```

이미 설치했다면:

```bat
cd general
venv\Scripts\activate
python app.py
```

접속:

`http://127.0.0.1:5100/`

general 서비스의 각 응답은 `request_logging.py`를 통해 monitor의 `POST /api/events`로 전송됩니다.

## CMD 3 - React 감시 화면

```bat
cd monitor\frontend
npm install
npm run dev
```

접속:

`http://127.0.0.1:5173/`

Vite의 `/api` 프록시가 React 요청을 `http://127.0.0.1:5200`으로 전달합니다.

---

# 6. 주요 API

## 로그인

`POST /api/auth/login`

- 빈 입력: 400
- 계정 불일치: 401
- 성공: 사용자 정보 반환

## 요청 기록

`GET /api/events`

일반 서비스에서 수집된 요청의 메서드, 경로, 상태 코드를 조회합니다.

## 관찰 메모

| 기능 | API |
| --- | --- |
| 목록 | `GET /api/notes` |
| 상세 | `GET /api/notes/<id>` |
| 작성 | `POST /api/notes` |
| 수정 | `PUT /api/notes/<id>` |
| 삭제 | `DELETE /api/notes/<id>` |

제목과 내용은 Flask에서 `strip()`한 뒤 검사합니다.

- 제목 또는 내용이 비었거나 공백뿐이면 400
- 없는 메모 번호를 조회·수정·삭제하면 404
- SQL 입력값은 `%s` 매개변수 바인딩 사용

---

# 7. React 화면 동작

로그인 전에는 로그인 폼만 표시됩니다.

로그인 성공 후:

- 로그인한 운영자 이름 표시
- 일반 서비스 요청 기록 조회
- 메모 목록 조회
- 메모 제목 클릭 시 상세 API 조회
- 새 메모 작성
- 기존 메모 값으로 수정 폼 열기
- 수정 취소 시 API 호출 없이 원래 DB 내용 유지
- 삭제 확인 화면 표시
- 삭제 취소 시 메모 유지
- 삭제 확정 시 DELETE 호출
- 요청 기록 새로고침
- 메모 목록 새로고침
- 전체 새로고침
- 로그아웃 시 React 사용자 state 제거 후 로그인 화면으로 복귀

로그인 상태는 React state에만 있으므로 브라우저 새로고침 시 로그인 폼으로 돌아오는 것이 정상입니다.

메모와 요청 기록은 PostgreSQL에 저장되므로 새로고침하거나 서버를 다시 실행해도 유지됩니다.

---

# 8. 통합 확인 시나리오

아래 순서로 확인합니다.

1. monitor API, general, React 세 서비스를 실행합니다.
2. general에서 실제 게시글 주소에 접속합니다.
3. general에서 존재하지 않는 게시글 주소에도 접속하여 404를 발생시킵니다.
4. React 로그인 화면에서 틀린 비밀번호를 입력하여 오류 안내를 확인합니다.
5. 올바른 운영자 계정으로 로그인합니다.
6. 요청 기록 새로고침을 눌러 앞서 발생한 경로와 상태 코드를 확인합니다.
7. 새 관찰 메모를 작성합니다.
8. 메모 목록의 제목을 눌러 상세 내용을 확인합니다.
9. 메모를 수정하고 저장합니다.
10. 다시 수정 화면을 열어 내용을 공백만 입력하고 저장하여 400 오류를 확인합니다.
11. 수정 취소를 눌러 DB의 기존 내용이 보존되는지 확인합니다.
12. 테스트 메모를 만든 뒤 삭제 확인 화면에서 취소합니다.
13. 다시 삭제를 열고 삭제 확정하여 목록에서 사라지는지 확인합니다.
14. 브라우저를 새로고침하고 다시 로그인합니다.
15. 남긴 메모는 유지되고 삭제한 메모는 없는지 확인합니다.
16. 로그아웃 버튼으로 로그인 폼으로 돌아가는지 확인합니다.

---

# 9. 필수 체크리스트 대응

- Flask 백엔드 + React 프론트 + Vite 프록시 구조
- PostgreSQL + psycopg
- SQL `%s` 매개변수 바인딩
- DB 영속 저장
- React 로그인 입력 state
- Flask DB 계정 + 해시 검증
- 로그인 성공/실패 및 로그아웃 화면 전환
- 요청 기록 메서드·경로·상태 코드 표시
- 메모 목록/상세
- 메모 작성
- 메모 수정
- 삭제 확인/취소/확정
- 요청 기록/메모 새로고침
- 공백 입력 400
- 없는 메모 404
- React 오류 메시지
- React 역할별 components 분리
- React API 파일 분리
- Flask routes/repositories/db 분리
- `.env.example`, `.gitignore`, requirements/package 파일, README 제공

---

# 10. 제출 제외 파일

루트 `.gitignore`에서 다음 항목을 제외합니다.

- `.env`
- `venv/`, `.venv/`
- `node_modules/`
- `dist/`
- Python 캐시 파일
- 테스트 캐시 파일
