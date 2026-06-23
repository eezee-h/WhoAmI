# Who Am I?

`Who Am I?`는 개인 포트폴리오 페이지를 만들고 직접 관리할 수 있는 웹 서비스입니다.

회원가입 후 사용자는 로그인하여 프로필, 경력, 활동, 프로젝트, 연락처를 직접 수정할 수 있습니다.

## 주요 기능

- 사용자별 공개 포트폴리오 페이지
- 회원가입 및 로그인
- 프로필, 키워드, 이미지 편집
- 경력, 학력, 수상, 자격증 등 아카이브 관리
- 대외활동 및 프로젝트 카드 관리
- 커스텀 카드 섹션 추가
- 카드 상세 내용에 텍스트, 이미지, 영상, 링크 추가
- 연락처와 색상 테마 관리
- Docker Compose 기반 실행

## 기술 스택

| 영역 | 기술 |
| --- | --- |
| Frontend | Next.js 15, React 19, TypeScript |
| Backend | Spring Boot 3.3, Java 21 |
| Database | PostgreSQL 16 |
| Infra | Docker, Docker Compose |

## 실행

프로젝트 루트에서 실행합니다.

```bash
docker compose up -d --build
```

기본 주소:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`
- PostgreSQL: `localhost:5432`

중지:

```bash
docker compose down
```

## 관리자 편집

관리자는 공개 페이지에서 편집 모드를 켜고 내용을 수정합니다.

- `편집 시작` / `편집 종료`로 보기 모드와 편집 모드를 전환합니다.
- `편집 종료`는 로그인 상태를 유지하고 편집 UI만 끕니다.
- 완전히 인증을 해제하려면 `로그아웃`을 사용합니다.

## 디렉터리 구조

```text
.
├── backend/
├── frontend/
├── db/
├── docker-compose.yml
└── README.md
```
