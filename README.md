# Who Am I?

`Who Am I?`는 사용자별 자기소개 페이지를 만들고 직접 관리할 수 있는 개인 포트폴리오 서비스입니다.

회원가입 후 각 사용자는 자신의 `/{username}` 페이지를 가지며, 관리자 모드에서 프로필, 아카이브, 활동, 프로젝트, 커스텀 카드 섹션을 수정할 수 있습니다.

이 저장소는 아래 3개 서비스를 한 프로젝트로 관리합니다.

- `frontend`: Next.js 기반 사용자 페이지 및 편집 UI
- `backend`: Spring Boot 기반 인증 / 콘텐츠 API
- `db`: PostgreSQL 스키마 및 초기화 SQL

현재 프로젝트는 `docker-compose.yml` 기준으로 전체 스택을 한 번에 실행할 수 있도록 구성되어 있습니다.

## 1. 주요 기능

- 회원가입 / 로그인
- 사용자별 공개 페이지 제공: `/{username}`
- 관리자 본인만 페이지 수정 가능
- 프로필 이름, 소개 문구, 키워드, 사진 편집
- 아카이브 섹션 추가 / 삭제 / 정렬 / 수정
- 활동 카드 관리
- 프로젝트 카드 관리
- 커스텀 카드 섹션 추가 / 삭제 / 수정
- 연락처 섹션 관리
- 테마 조회 / 변경
- Docker Compose 기반 통합 실행

## 2. 최근 반영된 편집 동작

현재는 아래 소개 문구도 고정 문장이 아니라 직접 수정할 수 있습니다.

- 활동 페이지 상단 설명
  - 기본값: `동아리, 봉사, 대회, 학회 등 다양한 활동들을 기록합니다.`
- 프로젝트 페이지 상단 설명
  - 기본값: `직접 만든 것들을 모아뒀어요.`
- 새로 만든 커스텀 카드 섹션 상단 설명
  - 새 섹션 생성 시 기본 설명이 함께 만들어지고, 해당 페이지 상단에서 바로 수정 가능

즉, 카드만 수정하는 구조가 아니라 섹션 자체에도 `이 섹션이 무엇을 보여주는지` 설명 문구를 저장합니다.

## 3. 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 15, React 19, TypeScript |
| Backend | Spring Boot 3.3, Java 21, Spring Security, Spring Data JPA |
| Database | PostgreSQL 16 |
| Infra | Docker, Docker Compose |
| 기타 | Lombok, Hypersistence Utils |

## 4. 프로젝트 구조

```text
.
├── backend/                 # Spring Boot API
│   ├── src/main/java
│   ├── src/main/resources
│   ├── Dockerfile
│   └── pom.xml
├── frontend/                # Next.js App Router
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

## 5. 서비스 구성

`docker-compose.yml` 기준 기본 서비스는 아래와 같습니다.

| 서비스 | 컨테이너 이름 | 기본 포트 | 설명 |
|--------|----------------|-----------|------|
| Frontend | `whoami-frontend` | `3000` | 사용자 페이지 및 편집 UI |
| Backend | `whoami-backend` | `8080` | 인증 / 콘텐츠 API |
| Database | `whoami-db` | `5432` | PostgreSQL |

## 6. 실행 방법

### 6-1. 가장 쉬운 방법: Docker Compose

준비물:

- Docker Desktop
- Docker Compose v2

저장소 루트에서 실행:

```bash
docker compose up -d --build
```

실행 후 접속 주소:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080`
- PostgreSQL: `localhost:5432`

상태 확인:

```bash
docker compose ps
```

로그 확인:

```bash
docker logs --tail 50 whoami-backend
docker logs --tail 40 whoami-frontend
docker logs --tail 50 whoami-db
```

종료:

```bash
docker compose down
```

DB 볼륨까지 완전히 초기화:

```bash
docker compose down -v
```

주의:

- `docker compose down`만 하면 PostgreSQL 볼륨은 유지됩니다.
- 데이터를 완전히 비우고 처음부터 시작하려면 `-v` 옵션이 필요합니다.

## 7. 환경 변수

기본값만으로도 실행 가능하도록 구성되어 있습니다.
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

### 백엔드 기본 설정

`backend/src/main/resources/application.properties`

```properties
SERVER_PORT=8080
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/whoami
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres
```

## 8. 로컬 개발 방법

Docker 없이도 개발할 수 있지만, 보통 DB만 Docker로 띄우는 방식이 가장 편합니다.

### 8-1. DB만 Docker로 실행

```bash
docker compose up -d whoami-db
```

### 8-2. 백엔드 로컬 실행

필수:

- Java 21
- Maven

```bash
cd backend
mvn spring-boot:run
```

기본 주소:

- `http://localhost:8080`

### 8-3. 프론트 로컬 실행

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

## 9. 주요 API

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

## 10. 콘텐츠 데이터 구조

프론트 기준 전체 콘텐츠는 대략 아래 구조를 가집니다.

```ts
type SiteContent = {
  home: {
    name: string
    tagline: string
    snapshot: string
    keywords: string[]
    avatar?: string
    avatarX?: number
    avatarY?: number
  }
  homeSections: Array<{
    id: string
    type: 'archive' | 'activity' | 'project' | 'card'
    name: string
    description?: string
  }>
  archive: ArchiveItem[]
  cards: CardItem[]
  contact: ContactLink[]
}
```

핵심 포인트:

- `homeSections`는 섹션 순서와 이름만이 아니라 섹션 설명도 저장합니다.
- `activity`, `project`는 고정 타입이지만 설명 문구는 수정 가능합니다.
- `card` 타입은 사용자 정의 섹션이며 이름과 설명을 함께 가집니다.
- 커스텀 카드 아이템은 해당 섹션 이름을 기준으로 묶입니다.

## 11. 데이터베이스 구조

초기 스키마는 `db/init/init.sql`에서 생성합니다.

주요 테이블:

- `site_user`: 사용자 계정 정보
- `home_profile`: 사용자 프로필
- `home_section`: 페이지 섹션 메타데이터
  - `section_kind`: `archive`, `activity`, `project`, `card`
  - `title`: 섹션 이름
  - `description`: 섹션 상단 소개 문구
- `archive_item`: 경력 / 학력 / 수상 등 아카이브 항목
- `card_item`: 활동 / 프로젝트 / 커스텀 카드 섹션 항목
- `card_block`: 카드 상세 블록
- `contact_link`: 연락처 정보

## 12. 화면 경로

대표 경로는 아래와 같습니다.

- `/{username}`: 메인 페이지
- `/{username}/activities`
- `/{username}/projects`
- `/{username}/cards/{section}`
- `/{username}/contact`
- `/{username}/settings`

## 13. 편집 방식 요약

- 메인 페이지에서 섹션을 추가할 수 있습니다.
- 아카이브 섹션은 항목 중심으로 관리합니다.
- 활동 / 프로젝트 / 커스텀 카드 섹션은 카드 목록과 별도로 섹션 소개 문구를 가집니다.
- 활동 / 프로젝트 / 커스텀 카드 상세 페이지 상단에서 소개 문구를 바로 수정할 수 있습니다.
- 새 커스텀 카드 섹션을 만들면 기본 설명 문구가 함께 생성됩니다.
- 저장은 관리자 인증 후 콘텐츠 API에 전체 구조를 다시 저장하는 방식입니다.

## 14. Docker 관련 참고

GitHub에서 저장소를 내려받는다고 Docker가 자동 실행되지는 않습니다.

`docker-compose.yml`은 실행 방법을 정의한 파일이므로 아래 조건이 필요합니다.

- 저장소 전체를 clone 또는 download
- Docker Desktop 설치 및 실행
- 루트 디렉터리에서 `docker compose up -d --build` 실행

즉, 실제 컨테이너가 뜨려면 `프로젝트 파일 + Docker 환경 + compose 실행 명령`이 모두 필요합니다.

## 15. 트러블슈팅

### 포트 충돌

아래 포트가 이미 사용 중이면 실행되지 않을 수 있습니다.

- `3000`
- `8080`
- `5432`

필요하면 `.env`로 포트를 변경하세요.

### 프론트는 뜨는데 데이터가 안 보임

확인 순서:

1. `docker compose ps`
2. `docker logs --tail 50 whoami-backend`
3. `NEXT_PUBLIC_API_URL` 값 확인
4. DB 데이터가 비어 있는지 확인

### DB를 비운 뒤 다시 시작했더니 화면이 비어 있음

DB를 초기화하면 저장된 사용자와 콘텐츠도 함께 사라집니다.
이 경우 회원가입부터 다시 진행해야 합니다.

```bash
docker compose down -v
docker compose up -d --build
```

### 백엔드 빌드는 되는데 테스트는 안 돌음

현재 Dockerfile에서는 아래처럼 테스트를 건너뜁니다.

```bash
mvn -B -DskipTests package
```

테스트까지 확인하려면 로컬 `backend/` 디렉터리에서 직접 `mvn test`를 실행하세요.

## 16. 정리

이 프로젝트는 사용자별 자기소개 페이지를 직접 만들고 관리하는 서비스를 목표로 합니다.

가장 쉬운 실행 방법은 Docker Compose입니다.
개발 중에는 필요에 따라 프론트 / 백엔드만 로컬로 띄우고 DB만 Docker로 사용하는 방식도 가능합니다.
