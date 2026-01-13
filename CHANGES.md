# MoneyGo Frontend - 주요 변경사항

## 🎯 프로젝트 목표

기존 프론트엔드 코드의 오류를 해결하고, 백엔드 API와 완벽하게 연동되는 깔끔하고 견고한 프론트엔드를 **처음부터 새로 구현**했습니다.

## ✨ 새로 구현된 내용

### 1. 전체 아키텍처 재설계

#### 이전 구조
- 불명확한 파일 구조
- API 통신 오류
- 타입 정의 누락
- 에러 처리 미비

#### 새로운 구조
```
src/
├── lib/           # 라이브러리 설정 (Axios)
├── services/      # API 서비스 레이어
├── components/    # 재사용 가능한 컴포넌트
├── pages/         # 페이지 컴포넌트
├── types/         # TypeScript 타입 정의
├── utils/         # 유틸리티 함수
└── theme.ts       # 테마 설정
```

### 2. API 통신 시스템

**새로 구현된 Axios 설정** (`src/lib/axios.ts`)
- Request Interceptor: 모든 요청에 JWT 토큰 자동 추가
- Response Interceptor: 401 에러 시 자동 로그아웃
- 에러 핸들링 통합
- 타임아웃 설정 (15초)

**서비스 레이어 구조** (`src/services/`)
- `auth.service.ts`: 로그인, 회원가입, 인증 관리
- `account.service.ts`: 계좌 조회, 소유자 확인
- `transfer.service.ts`: 송금
- `transaction.service.ts`: 거래 내역 조회
- `qr.service.ts`: QR 코드 생성 및 결제

### 3. TypeScript 타입 시스템

**완전한 타입 정의** (`src/types/api.types.ts`)
- 모든 API 요청/응답 타입 정의
- Request 타입: `LoginRequest`, `SignupRequest`, `TransferRequest` 등
- Response 타입: `LoginResponse`, `AccountResponse`, `TransactionResponse` 등
- 페이지네이션 타입: `PageResponse<T>`

### 4. 페이지 구현

#### LoginPage (`src/pages/LoginPage.tsx`)
- 이메일/비밀번호 입력
- 비밀번호 표시/숨김 토글
- 폼 검증 및 에러 메시지
- 로그인 성공 시 자동 리다이렉트

#### SignupPage (`src/pages/SignupPage.tsx`)
- 회원가입 폼 (이메일, 이름, 전화번호, 비밀번호)
- 비밀번호 확인 검증
- 가입 성공 시 자동 로그인
- 전화번호 형식 검증

#### DashboardPage (`src/pages/DashboardPage.tsx`)
- 계좌 잔액 카드 (그라데이션 배경)
- 최근 거래 내역 5개 표시
- 입금/출금 구분 색상
- 빠른 액션 버튼 (송금, QR결제)
- 새로고침 기능

#### TransferPage (`src/pages/TransferPage.tsx`)
- 계좌번호 자동 포맷팅 (1234-5678-9012)
- 실시간 예금주 확인 (디바운싱)
- 금액 입력 시 실시간 포맷 표시
- 송금 완료 다이얼로그
- 잔액 업데이트

#### TransactionsPage (`src/pages/TransactionsPage.tsx`)
- 탭 필터링: 전체/보낸내역/받은내역
- 무한 스크롤 (더보기 버튼)
- 입금/출금 배지
- 거래 상세 정보
- 페이지네이션 지원

#### QrGeneratePage (`src/pages/QrGeneratePage.tsx`)
- QR 코드 생성 폼
- QRCode 라이브러리 활용
- 생성된 QR 이미지 표시
- 만료 시간 안내
- 탭 네비게이션 (생성/스캔)

#### QrScanPage (`src/pages/QrScanPage.tsx`)
- QR 코드 수동 입력
- 결제 확인 및 실행
- 결제 완료 다이얼로그
- 탭 네비게이션

### 5. 레이아웃 시스템

#### AppLayout (`src/components/layout/AppLayout.tsx`)
- 헤더 + 메인 콘텐츠 + 하단 네비게이션
- Outlet을 통한 자식 라우트 렌더링
- 스크롤 처리

#### Header (`src/components/layout/Header.tsx`)
- 앱 제목
- 사용자 이름 표시
- 로그아웃 버튼

#### BottomNav (`src/components/layout/BottomNav.tsx`)
- 4개 탭: 홈, 송금, 거래내역, QR결제
- 현재 경로 자동 감지
- Material-UI BottomNavigation

### 6. 유틸리티 함수

**포맷팅 함수** (`src/utils/format.ts`)
- `formatCurrency()`: 금액 포맷 (1,000,000원)
- `formatAccountNumber()`: 계좌번호 포맷 (1234-5678-9012)
- `formatDate()`: 날짜 포맷 (2024.01.13)
- `formatDateTime()`: 날짜/시간 포맷 (2024.01.13 14:30)
- `formatPhoneNumber()`: 전화번호 포맷 (010-1234-5678)

### 7. 라우팅 시스템

**보호된 라우트** (`App.tsx`)
- `ProtectedRoute`: 인증된 사용자만 접근 가능
- `PublicRoute`: 비인증 사용자만 접근 가능 (로그인/회원가입)
- 자동 리다이렉트
- 404 폴백

### 8. Material-UI 테마

**커스텀 테마** (`src/theme.ts`)
- Primary: 파란색 (#1976d2)
- Secondary: 빨간색 (#dc004e)
- 버튼 스타일 오버라이드
- 카드 border-radius 설정
- 폰트 스택 설정

## 🔧 주요 개선사항

### 1. 에러 처리
- 모든 API 호출을 try-catch로 감싸기
- 사용자 친화적인 에러 메시지
- Alert 컴포넌트로 일관된 에러 표시

### 2. 로딩 상태
- 모든 비동기 작업에 로딩 상태 관리
- CircularProgress 표시
- 버튼 비활성화

### 3. 사용자 경험
- 실시간 입력 검증
- 자동 포맷팅
- 디바운싱 (계좌번호 확인)
- 성공 다이얼로그
- 확인 버튼

### 4. 코드 품질
- TypeScript strict 모드
- 일관된 코드 스타일
- 컴포넌트 분리
- 재사용 가능한 서비스 레이어

### 5. 성능 최적화
- useEffect 의존성 배열 최적화
- 불필요한 리렌더링 방지
- Axios 인터셉터로 중복 코드 제거

## 📦 새로 추가된 의존성

```json
{
  "qrcode": "^1.5.3",
  "@types/qrcode": "^1.5.5"
}
```

QR 코드 생성을 위한 라이브러리

## 🚀 실행 방법

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```

### 3. 프로덕션 빌드
```bash
npm run build
```

## 🎓 배운 점 및 베스트 프랙티스

1. **서비스 레이어 패턴**: API 호출 로직을 별도 파일로 분리
2. **Axios 인터셉터**: 중복 코드 제거 및 일관된 에러 처리
3. **TypeScript 타입 시스템**: 컴파일 타임 에러 방지
4. **Material-UI 활용**: 빠른 UI 개발
5. **React Router 보호된 라우트**: 인증 상태 기반 접근 제어

## ⚠️ 알려진 제한사항

1. **QR 스캔 기능**: 실제 카메라 스캔은 미구현 (모바일 앱에서 구현 필요)
2. **알림 기능**: UI만 구현 (백엔드 API 연동 필요)
3. **오프라인 지원**: PWA 기능 미구현
4. **실시간 업데이트**: WebSocket 미사용

## 🔮 향후 개선 계획

1. React Query 도입으로 서버 상태 관리 개선
2. Zustand/Redux로 전역 상태 관리
3. PWA로 오프라인 지원
4. WebSocket으로 실시간 알림
5. 단위 테스트 추가 (Jest + React Testing Library)
6. E2E 테스트 추가 (Playwright/Cypress)

---

이 프로젝트는 백엔드 API와 완벽하게 연동되며, 프로덕션 레벨의 코드 품질을 목표로 작성되었습니다.
