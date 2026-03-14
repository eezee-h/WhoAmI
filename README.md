# Who Am I?

`Who Am I?`는 사용자별 자기소개 페이지를 만들고 관리할 수 있는 개인 포트폴리오 웹 서비스입니다.
회원가입 후 자신만의 `/{username}` 페이지를 만들 수 있고, 로그인한 사용자만 자신의 콘텐츠를 수정할 수 있습니다.

이 저장소는 다음 3개 서비스를 하나의 프로젝트로 관리합니다.

- `frontend`: Next.js 기반 사용자 페이지 및 설정 UI
- `backend`: Spring Boot 기반 인증/콘텐츠 API
- `db`: PostgreSQL 스키마 및 초기화 SQL

현재 프로젝트는 **Docker Compose로 전체 스택을 바로 실행할 수 있도록 구성**되어 있습니다.

## 1. 주요 기능

- 회원가입 / 로그인
- 사용자별 공개 페이지(`/{username}`) 제공
- 관리자 본인만 페이지 수정 가능
- 홈 프로필, 키워드, 소개 문구 편집
- 활동 / 프로젝트 / 아카이브 섹션 관리
- 연락처 섹션 관리
- 테마 조회 / 변경
- Docker Compose 기반 통합 실행

## 2. 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 15, React 19, TypeScript |
| Backend | Spring Boot 3.3, Java 21, Spring Security, Spring Data JPA |
| Database | PostgreSQL 16 |
| Infra | Docker, Docker Compose |
| 기타 | Lombok, Hypersistence Utils |

## 3. 전체 구조

```text
.
├── backend/                 # Spring Boot API
│   ├── src/main/java
│   ├── src/main/resources
│   ├── Dockerfile
│   └── pom.xml
├── frontend/                # Next.js App Router 앱
│   ├── app
│   ├── components
│   ├── lib
│   ├── public
│   ├── Dockerfile
│   └── package.json
├── db/
│   └── init/
│       └── init.sql         # PostgreSQL 초기 스키마
├── docker-compose.yml       # 전체 스택 실행 설정
└── README.md
```

## 4. 서비스 구성

`docker-compose.yml` 기준 기본 서비스는 아래와 같습니다.

| 서비스 | 컨테이너 이름 | 기본 포트 | 설명 |
|--------|----------------|-----------|------|
| Frontend | `whoami-frontend` | `3000` | 사용자 페이지 및 편집 UI |
| Backend | `whoami-backend` | `8080` | 인증 / 콘텐츠 API |
| Database | `whoami-db` | `5432` | PostgreSQL |

## 5. 실행 방법

### 5-1. 가장 쉬운 방법: Docker Compose

### 준비물

- Docker Desktop
- Docker Compose v2

### 실행

저장소 루트에서 실행합니다.

```bash
docker compose up -d --build
```

실행 후 접속 주소:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080`
- PostgreSQL: `localhost:5432`

### 상태 확인

```bash
docker compose ps
```

### 로그 확인

```bash
docker logs --tail 50 whoami-backend
docker logs --tail 40 whoami-frontend
docker logs --tail 50 whoami-db
```

### 종료

```bash
docker compose down
```

### DB 볼륨까지 완전히 초기화

```bash
docker compose down -v
```

주의:

- `docker compose down`만 하면 PostgreSQL 볼륨은 유지됩니다.
- 데이터를 완전히 비우고 처음부터 시작하려면 `-v` 옵션이 필요합니다.

## 6. 환경 변수

기본값만으로도 실행 가능하도록 되어 있습니다.
필요할 때만 `.env` 파일로 덮어쓰면 됩니다.

### Docker Compose에서 사용하는 값

```env
POSTGRES_DB=whoami
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

BACKEND_PORT=8080
FRONTEND_PORT=3000

NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 백엔드에서 사용하는 값

`backend/src/main/resources/application.properties` 기준:

```properties
SERVER_PORT=8080
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/whoami
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres
```

## 7. 로컬 개발 방법

Docker 없이도 개발할 수 있지만, DB는 Docker로 띄우는 방식이 가장 편합니다.

### 7-1. DB만 Docker로 띄우기

```bash
docker compose up -d whoami-db
```

### 7-2. 백엔드 로컬 실행

필수:

- Java 21
- Maven

```bash
cd backend
mvn spring-boot:run
```

기본 주소:

- `http://localhost:8080`

### 7-3. 프론트 로컬 실행

필수:

- Node.js 20 이상
- npm

```bash
cd frontend
npm ci
npm run dev
```

기본 주소:

- `http://localhost:3000`

## 8. 주요 API

### 인증

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `POST` | `/api/auth/register` | 회원가입 |
| `POST` | `/api/auth/login` | 로그인 |
| `POST` | `/api/auth/{username}/verify` | 관리자 인증 확인 |
| `DELETE` | `/api/auth/{username}` | 사용자 삭제 |

### 콘텐츠

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/{username}/content` | 페이지 콘텐츠 조회 |
| `PUT` | `/api/{username}/content` | 페이지 콘텐츠 저장 |
| `GET` | `/api/{username}/theme` | 테마 조회 |
| `PUT` | `/api/{username}/theme` | 테마 변경 |
| `GET` | `/api/{username}/exists` | 사용자 존재 여부 확인 |

## 9. 데이터베이스 구조

초기 스키마는 `db/init/init.sql`에서 생성됩니다.
핵심 테이블은 아래와 같습니다.

- `site_user`: 사용자 계정 정보
- `home_profile`: 사용자 프로필
- `home_section`: 페이지 섹션 메타데이터
- `archive_item`: 경력/학력/수상 등 아카이브성 항목
- `card_item`: 활동/프로젝트 카드
- `card_block`: 카드 상세 블록
- `contact_link`: 연락처 정보

## 10. 현재 프론트 라우트 개요

대표적인 화면 경로는 다음과 같습니다.

- `/{username}`: 메인 페이지
- `/{username}/activities`
- `/{username}/projects`
- `/{username}/cards/{section}`
- `/{username}/contact`
- `/{username}/settings`

## 11. Docker 관련 참고

이 저장소를 GitHub에서 내려받는다고 해서 Docker가 자동으로 실행되지는 않습니다.
`docker-compose.yml`은 실행 설정 파일일 뿐이므로, 아래 조건이 필요합니다.

- 저장소 전체를 clone 또는 download
- Docker Desktop 설치 및 실행
- 루트 디렉터리에서 `docker compose up -d --build` 실행

즉, **프로젝트 파일 + Docker 환경 + compose 실행 명령**이 있어야 실제 컨테이너가 올라옵니다.

## 12. 트러블슈팅

### 포트 충돌

아래 포트가 이미 사용 중이면 실행되지 않을 수 있습니다.

- `3000`
- `8080`
- `5432`

필요하면 `.env` 파일로 포트를 변경하세요.

### 프론트는 뜨는데 데이터가 안 보임

확인 순서:

1. `docker compose ps`
2. `docker logs --tail 50 whoami-backend`
3. `NEXT_PUBLIC_API_URL` 값 확인

### DB를 비웠는데 다시 시작하고 싶음

다음을 실행한 뒤 회원가입부터 다시 진행하면 됩니다.

```bash
docker compose down -v
docker compose up -d --build
```

### 백엔드 빌드는 되는데 테스트는 안 돈다

현재 Dockerfile에서는 아래처럼 테스트를 건너뜁니다.

```bash
mvn -B -DskipTests package
```

로컬에서 테스트까지 확인하려면 `backend/`에서 직접 `mvn test`를 실행하세요.

## 13. 정리

이 프로젝트는 "사용자별 자기소개 페이지를 직접 만들고 관리하는 서비스"를 목표로 합니다.
가장 쉬운 실행 방법은 Docker Compose이고, 개발 중에는 필요에 따라 프론트/백엔드만 로컬로 띄우고 DB만 Docker로 사용하는 방식도 가능합니다.
