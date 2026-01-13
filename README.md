# MoneyGo Frontend

React + TypeScript + Vite + Material-UI로 구축된 모바일 친화적인 송금 서비스 프론트엔드

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일이 이미 생성되어 있습니다. 필요시 백엔드 API URL을 수정하세요.

```
VITE_API_BASE_URL=http://localhost:8080/api
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 으로 접속

### 4. 빌드

```bash
npm run build
```

## 📁 프로젝트 구조

```
src/
├── lib/                 # 라이브러리 설정
│   └── axios.ts         # Axios 설정 및 인터셉터
├── services/            # API 서비스
│   ├── auth.service.ts
│   ├── account.service.ts
│   ├── transfer.service.ts
│   ├── transaction.service.ts
│   └── qr.service.ts
├── components/          # 컴포넌트
│   └── layout/          # 레이아웃 컴포넌트
│       ├── AppLayout.tsx
│       ├── Header.tsx
│       └── BottomNav.tsx
├── pages/              # 페이지 컴포넌트
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   ├── DashboardPage.tsx
│   ├── TransferPage.tsx
│   ├── TransactionsPage.tsx
│   ├── QrGeneratePage.tsx
│   └── QrScanPage.tsx
├── types/              # TypeScript 타입
│   └── api.types.ts
├── utils/              # 유틸리티 함수
│   └── format.ts
├── theme.ts            # Material-UI 테마
├── App.tsx             # 앱 라우터
└── main.tsx            # 엔트리 포인트
```

## 🔑 주요 기능

- ✅ **회원가입/로그인**: JWT 기반 인증
- ✅ **대시보드**: 계좌 잔액 조회 및 최근 거래 내역
- ✅ **송금**: 계좌번호로 송금, 실시간 계좌 소유자 확인
- ✅ **QR 결제**: QR 코드 생성 및 스캔 결제
- ✅ **거래 내역**: 전체/보낸내역/받은내역 필터링

## 🛠 기술 스택

- **React 18** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Vite** - 빠른 개발 서버
- **Material-UI** - UI 컴포넌트 라이브러리
- **React Router** - 클라이언트 사이드 라우팅
- **Axios** - HTTP 클라이언트
- **QRCode** - QR 코드 생성

## 📱 주요 특징

### 반응형 디자인
- 모바일 우선 디자인
- Material-UI의 반응형 그리드 시스템
- 터치 친화적인 UI

### 사용자 경험
- 하단 네비게이션 바 (모바일 앱 스타일)
- 실시간 입력 검증
- 로딩 및 에러 상태 처리
- 성공 다이얼로그

### 보안
- JWT 토큰 기반 인증
- LocalStorage에 토큰 저장
- Axios 인터셉터로 자동 토큰 포함
- 401 에러 시 자동 로그아웃

## 🔐 인증 플로우

1. 로그인/회원가입 시 JWT 토큰 발급
2. 토큰을 LocalStorage에 저장
3. 모든 API 요청에 자동으로 토큰 포함 (Authorization 헤더)
4. 토큰 만료 또는 인증 실패 시 자동 로그아웃 및 로그인 페이지로 리다이렉트

## 📡 API 연동

### 백엔드 엔드포인트

- **인증**: `/api/auth/login`, `/api/auth/signup`
- **계좌**: `/api/accounts/me`, `/api/accounts/{accountNumber}`
- **송금**: `/api/transfers`
- **거래**: `/api/transactions`
- **QR**: `/api/qr/generate`, `/api/qr/pay`

### 에러 처리

모든 API 요청은 try-catch로 감싸져 있으며, 에러 발생 시 사용자 친화적인 메시지를 표시합니다.

## 🎨 디자인 시스템

### 색상
- Primary: `#1976d2` (파란색)
- Secondary: `#dc004e` (빨간색)
- Success: Material-UI 기본 초록색
- Error: Material-UI 기본 빨간색

### 타이포그래피
- 폰트: System 폰트 스택 (Apple, Roboto, Segoe UI 등)
- 제목: Bold, 본문: Regular

## 💡 개발 팁

### 컴포넌트 추가
새로운 페이지는 `src/pages/`에, 재사용 가능한 컴포넌트는 `src/components/`에 추가하세요.

### API 서비스 추가
새로운 API 엔드포인트는 `src/services/`에 서비스 파일을 만들어 추가하세요.

### 타입 정의
API 응답 타입은 `src/types/api.types.ts`에 정의하세요.

## 🐛 문제 해결

### CORS 에러
백엔드에서 CORS 설정이 필요합니다. Spring Boot의 경우 `@CrossOrigin` 어노테이션 또는 전역 CORS 설정을 추가하세요.

### API 연결 실패
`.env` 파일의 `VITE_API_BASE_URL`이 올바른지 확인하세요.

## 📄 라이센스

이 프로젝트는 학습 목적으로 만들어졌습니다.
