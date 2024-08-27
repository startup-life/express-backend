# Express-Backend 프로젝트

이 프로젝트는 기본적인 사용자 인증, 게시글 관리, 파일 업로드, 댓글 관리 기능을 제공하는 Express.js 기반의 백엔드 애플리케이션입니다. 이 README는 프로젝트의 구조, 설치 방법, 실행 방법 및 주요 기능을 설명합니다.

## 목차

-   [파일 구조](#파일-구조)
-   [설치](#설치)
-   [실행](#실행)
-   [환경 변수 설정](#환경-변수-설정)
-   [협업 및 코드 스타일](#협업-및-코드-스타일)
-   [주요 기능](#주요-기능)
-   [API 엔드포인트](#api-엔드포인트)
-   [사용된 기술 스택](#사용된-기술-스택)

## 파일 구조

```
express-backend/
├── .github/                    # GitHub 설정 파일
├── .husky/                     # Husky 설정 파일 (Git hooks)
│   ├── commit-msg
│   ├── pre-commit
│   └── pre-push
├── controller/                 # 비즈니스 로직을 처리하는 컨트롤러
│   ├── commentController.js
│   ├── fileController.js
│   ├── postController.js
│   └── userController.js
├── database/                   # 데이터베이스 연결 설정
│   └── index.js
├── model/                      # 데이터베이스와의 상호작용을 담당하는 모델
│   ├── commentModel.js
│   ├── postModel.js
│   └── userModel.js
├── public/                     # 정적 파일 (이미지 등)
│   └── image/
│       └── profile/
│           └── default.jpg
├── route/                      # 라우터 설정 파일
│   ├── commentRoute.js
│   ├── fileRoute.js
│   ├── index.js
│   ├── postRoute.js
│   └── userRoute.js
├── util/                       # 유틸리티 함수 및 미들웨어
│   ├── authUtil.js
│   ├── multerUtil.js
│   └── validUtil.js
├── .dockerignore               # Docker에서 무시할 파일/디렉토리 설정
├── .env                        # 환경 변수 설정 파일
├── .gitignore                  # Git에서 무시할 파일/디렉토리 설정
├── .gitmessage.txt             # 커밋 메시지 템플릿
├── .prettierignore             # Prettier에서 무시할 파일/디렉토리 설정
├── .releaserc.json             # Semantic Release 설정 파일
├── app.js                      # Express 앱 설정 파일
├── commitlint.config.cjs       # Commitlint 설정 파일
├── Dockerfile                  # Docker 이미지 생성 설정 파일
├── ecosystem.json              # PM2 설정 파일
├── eslint.config.js            # ESLint 설정 파일
├── package-lock.json           # 프로젝트의 의존성 트리 잠금 파일
├── package.json                # 프로젝트 설정 및 의존성 관리
├── prettier.config.js          # Prettier 설정 파일
├── README.md                   # 프로젝트 설명 파일
└── schema.sql                  # 데이터베이스 스키마 정의
```

## 설치

1. **프로젝트 포크** GitHub에서 [이 프로젝트](https://github.com/username/express-backend)를 포크하세요.

2. **클론** 포크한 프로젝트를 자신의 로컬 머신으로 클론합니다.

    ```bash
    git clone https://github.com/your-username/express-backend.git
    cd express-backend
    ```

3. **의존성 설치**
    ```bash
    npm install
    ```

## 실행

1. **개발 모드로 실행**

    ```bash
    npm run dev
    ```

2. **프로덕션 모드로 실행**
    ```bash
    npm start
    ```

## 환경 변수 설정

프로젝트 루트 디렉토리에 `.env` 파일을 생성하고, 다음과 같은 환경 변수를 설정해야 합니다:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_DATABASE=databbase
DB_PORT=3306

BACKEND_PORT=3000

SESSION_SECRET=secret

NODE_ENV=development
```

## 협업 및 코드 스타일

이 프로젝트에서는 코드 스타일, 커밋 메시지, 그리고 Pull Request 작성 시 준수해야 할 규칙을 설정해두었습니다. 다음 파일들을 참고하여 협업 시 일관성을 유지하세요:

-   **`.gitmessage.txt`**: 커밋 메시지 작성 시 사용할 템플릿입니다. 주제, 내용, 꼬리말의 형식을 준수하여 커밋 메시지를 작성해주세요.
-   **`eslint.config.js`**: 이 파일은 프로젝트의 코드 스타일을 관리합니다. AirBnB 스타일 가이드를 따르며, Prettier와의 호환성도 유지됩니다.
-   **`.github/PULL_REQUEST_TEMPLATE.md`**: Pull Request를 작성할 때 사용되는 템플릿입니다. PR 작성 시 이 템플릿을 따라 내용을 작성하세요.

이러한 파일들은 프로젝트의 루트 디렉토리에 위치해 있으며, GitHub에서 직접 확인할 수 있습니다.

## 주요 기능

-   **사용자 관리**
    -   회원가입, 로그인, 로그아웃, 사용자 정보 수정, 비밀번호 변경, 사용자 삭제
-   **게시글 관리**
    -   게시글 작성, 수정, 삭제, 목록 조회, 상세 조회
-   **댓글 관리**
    -   댓글 작성, 수정, 삭제, 조회
-   **파일 업로드**
    -   프로필 이미지 및 게시글 이미지 업로드

## API 엔드포인트

### 사용자 관리

-   **POST** `/users/signup` - 회원가입
-   **POST** `/users/login` - 로그인
-   **POST** `/users/logout` - 로그아웃
-   **GET** `/users/:user_id` - 사용자 정보 조회
-   **PUT** `/users/:user_id` - 사용자 정보 수정
-   **PATCH** `/users/:user_id/password` - 비밀번호 변경
-   **DELETE** `/users/:user_id` - 사용자 삭제

### 게시글 관리

-   **POST** `/posts` - 게시글 작성
-   **GET** `/posts` - 게시글 목록 조회
-   **GET** `/posts/:post_id` - 게시글 상세 조회
-   **PATCH** `/posts/:post_id` - 게시글 수정
-   **DELETE** `/posts/:post_id` - 게시글 삭제

### 댓글 관리

-   **POST** `/posts/:post_id/comments` - 댓글 작성
-   **GET** `/posts/:post_id/comments` - 댓글 목록 조회
-   **PATCH** `/posts/:post_id/comments/:comment_id` - 댓글 수정
-   **DELETE** `/posts/:post_id/comments/:comment_id` - 댓글 삭제

### 파일 업로드

-   **POST** `/files/upload/profile` - 프로필 이미지 업로드
-   **POST** `/files/upload/post` - 게시글 이미지 업로드

## 사용된 기술 스택

-   **백엔드 프레임워크**: Express.js
-   **데이터베이스**: MySQL
-   **ORM/ODM**: 직접 SQL 쿼리 사용
-   **파일 업로드**: Multer
-   **인증 및 권한**: bcrypt, Express-Session
-   **로깅**: morgan, rotating-file-stream
-   **기타**: dotenv, cors, cookie-parser
