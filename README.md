# MoneyGo Frontend

React + TypeScript + Vite + Material-UI로 구축된 모바일 친화적인 송금 서비스 프론트엔드

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 백엔드 API URL을 설정하세요:

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
├── api/              # API 통신 (Axios)
├── components/       # 재사용 가능한 컴포넌트
│   ├── common/      # 공통 컴포넌트 (Header, BottomNav 등)
│   ├── auth/        # 인증 관련
│   ├── account/     # 계좌 관련
│   ├── transfer/    # 송금 관련
│   ├── transaction/ # 거래 내역 관련
│   └── qr/          # QR 결제 관련
├── pages/           # 페이지 컴포넌트
├── store/           # 전역 상태 관리 (Zustand)
├── types/           # TypeScript 타입 정의
└── utils/           # 유틸리티 함수
```

## 🔑 주요 기능

- ✅ 로그인/회원가입
- ✅ 대시보드 (잔액 조회)
- 🔄 송금 (구현 예정)
- 🔄 QR 결제 (구현 예정)
- 🔄 거래 내역 (구현 예정)

## 🛠 기술 스택

- **React 18** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Vite** - 빠른 개발 서버
- **Material-UI** - UI 컴포넌트
- **React Router** - 라우팅
- **Zustand** - 상태 관리
- **Axios** - HTTP 클라이언트
- **Tailwind CSS** - 유틸리티 CSS

## 📱 모바일 최적화

- 반응형 디자인
- 터치 친화적인 UI
- PWA 준비 완료
- 하단 네비게이션

## 🔐 인증

JWT 토큰 기반 인증:
- 로그인 시 토큰 저장 (localStorage)
- API 요청 시 자동으로 토큰 포함
- 401 에러 시 자동 로그아웃