# Who Am I?

`Who Am I?`는 사용자별 자기소개 페이지를 만들고 직접 관리할 수 있는 개인 포트폴리오 서비스입니다.

회원가입 후 각 사용자는 `/{username}` 페이지를 가지며, 관리자 모드에서 프로필, 아카이브, 활동, 프로젝트, 커스텀 카드 섹션을 편집할 수 있습니다.

## 주요 기능

- 사용자별 공개 페이지 제공: `/{username}`
- 프로필 편집: 이름, 소개 문구, 키워드, 이미지
- 아카이브 섹션 관리: 경력, 학력, 수상 등
- 활동 / 프로젝트 카드 관리
- 커스텀 카드 섹션 추가 및 관리
- 연락처 / 테마 관리
- Docker Compose 기반 전체 스택 실행

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 15, React 19, TypeScript |
| Backend | Spring Boot 3.3, Java 21 |
| Database | PostgreSQL 16 |
| Infra | Docker, Docker Compose |

## 구성

이 저장소는 아래 3개 서비스를 포함합니다.

- `frontend`: 사용자 화면과 편집 UI
- `backend`: 인증 및 콘텐츠 API
- `db`: PostgreSQL

로컬 및 자가 호스팅 환경에서는 아래처럼 동작합니다.

```text
브라우저 -> 프론트엔드 -> 백엔드 -> PostgreSQL
```

운영 시에는 프론트엔드가 `/api` 요청을 내부 백엔드로 프록시하도록 구성할 수 있어서, 사용자는 하나의 사이트만 보게 만들 수 있습니다.

## 빠른 실행

필수:

- Docker Desktop
- Docker Compose v2

프로젝트 루트에서 실행:

```bash
docker compose up -d --build
```

기본 주소:

- 프론트엔드: `http://localhost:3000`
- 백엔드: `http://localhost:8080`
- 데이터베이스: `localhost:5432`

중지:

```bash
docker compose down
```

DB 볼륨까지 초기화:

```bash
docker compose down -v
```

## 로컬 개발

### 백엔드 실행

필수:

- Java 21
- Maven

```bash
cd backend
mvn spring-boot:run
```

### 프론트엔드 실행

필수:

- Node.js 20 이상
- npm

```bash
cd frontend
npm ci
npm run dev
```

### DB만 Docker로 실행

```bash
docker compose up -d whoami-db
```

## 환경 변수

Docker Compose에서 주로 사용하는 값:

```env
POSTGRES_DB=whoami
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

BACKEND_PORT=8080
FRONTEND_PORT=3000

NEXT_PUBLIC_API_URL=/api
BACKEND_INTERNAL_URL=http://whoami-backend:8080
```

의미:

- `NEXT_PUBLIC_API_URL=/api`
  - 브라우저 기준 공개 API 경로
- `BACKEND_INTERNAL_URL=http://whoami-backend:8080`
  - 프론트엔드 서버가 내부적으로 호출하는 백엔드 주소

## 공개 경로

- `/{username}`
- `/{username}/activities`
- `/{username}/projects`
- `/{username}/cards/{section}`
- `/{username}/contact`
- `/{username}/settings`

## 주요 API

### 인증

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/{username}/verify`
- `DELETE /api/auth/{username}`

### 콘텐츠

- `GET /api/{username}/content`
- `PUT /api/{username}/content`
- `GET /api/{username}/theme`
- `PUT /api/{username}/theme`
- `GET /api/{username}/exists`

## 디렉터리 구조

```text
.
├── backend/
│   ├── src/main/java
│   ├── src/main/resources
│   ├── Dockerfile
│   └── pom.xml
├── frontend/
│   ├── app
│   ├── components
│   ├── lib
│   ├── public
│   ├── Dockerfile
│   └── package.json
├── db/
│   └── init/
│       └── init.sql
├── docker-compose.yml
└── README.md
```

## 배포 방식

이 프로젝트는 운영 환경에서 단일 공개 진입점 구조로 사용할 수 있습니다.

- 사용자는 프론트엔드 도메인 하나만 접속
- 프론트엔드가 페이지를 렌더링
- 프론트엔드가 `/api/...` 요청을 내부 백엔드로 전달
- 데이터베이스는 외부에 공개하지 않음

즉 Mac mini 같은 자가 호스팅 환경에서는 Cloudflare Tunnel로 프론트엔드 진입점만 공개하고, 백엔드와 DB는 Docker 네트워크 내부에 둘 수 있습니다.

## 트러블슈팅

### 포트 충돌

기본 포트:

- `3000`
- `8080`
- `5432`

### 프론트는 뜨는데 데이터가 안 보임

확인 순서:

1. `docker compose ps`
2. `docker logs --tail 50 whoami-backend`
3. `NEXT_PUBLIC_API_URL` 값 확인
4. `BACKEND_INTERNAL_URL` 값 확인
5. DB 데이터가 비어 있는지 확인

### 완전히 초기화했더니 데이터가 없음

DB 볼륨을 지우면 저장된 사용자와 콘텐츠도 함께 삭제됩니다.

```bash
docker compose down -v
docker compose up -d --build
```

## 요약

`Who Am I?`는 Next.js + Spring Boot + PostgreSQL로 구성된 자기소개 페이지 서비스입니다.

다음 환경에서 실행하기 좋게 구성되어 있습니다.

- 로컬 Docker Compose 환경
- Mac mini 같은 자가 호스팅 서버
- 프론트엔드만 외부에 공개하는 운영 구조
