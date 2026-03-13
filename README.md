# WhoAmI

나만의 포트폴리오 페이지를 만들고 관리할 수 있는 웹 서비스입니다.
회원가입 후 `사이트주소/{username}` 으로 접근 가능한 개인 페이지가 생성됩니다.

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 15, TypeScript |
| Backend | Spring Boot 3, Java 21 |
| Database | PostgreSQL 16 |
| Infra | Docker, Docker Compose |

## 프로젝트 구조

```
├── frontend/        # Next.js 앱
├── backend/         # Spring Boot 앱
├── db/init/         # DB 초기화 SQL
└── docker-compose.yml
```

## 실행 방법

### 요구사항
- Docker, Docker Compose

### 실행

```bash
docker compose up -d
```

| 서비스 | 주소 |
|--------|------|
| 프론트엔드 | http://localhost:3000 |
| 백엔드 API | http://localhost:8080 |

### 환경변수 (선택)

루트에 `.env.local` 파일을 생성해 기본값을 변경할 수 있습니다.

```env
POSTGRES_DB=whoami
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## 주요 기능

- 회원가입 / 로그인
- 개인 포트폴리오 페이지 생성 (`/{username}`)
- 경력, 학력, 프로젝트, 대외활동 등 섹션 관리
- 이미지 업로드, 테마 변경
- 관리자 본인만 편집 가능
