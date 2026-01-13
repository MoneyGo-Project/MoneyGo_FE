# MoneyGo Frontend - 설치 및 실행 가이드

## 📦 생성된 프로젝트 구조

```
moneygo-frontend/
├── src/
│   ├── components/
│   │   └── layout/
│   │       ├── AppLayout.tsx       # 메인 레이아웃
│   │       ├── Header.tsx          # 헤더
│   │       └── BottomNav.tsx       # 하단 네비게이션
│   ├── pages/
│   │   ├── LoginPage.tsx           # 로그인 페이지
│   │   ├── SignupPage.tsx          # 회원가입 페이지
│   │   ├── DashboardPage.tsx       # 대시보드 (홈)
│   │   ├── TransferPage.tsx        # 송금 페이지
│   │   ├── TransactionsPage.tsx    # 거래내역 페이지
│   │   ├── QrGeneratePage.tsx      # QR 생성 페이지
│   │   └── QrScanPage.tsx          # QR 스캔 페이지
│   ├── services/
│   │   ├── auth.service.ts         # 인증 API
│   │   ├── account.service.ts      # 계좌 API
│   │   ├── transfer.service.ts     # 송금 API
│   │   ├── transaction.service.ts  # 거래내역 API
│   │   └── qr.service.ts           # QR 결제 API
│   ├── lib/
│   │   └── axios.ts                # Axios 설정
│   ├── types/
│   │   └── api.types.ts            # TypeScript 타입 정의
│   ├── utils/
│   │   └── format.ts               # 포맷팅 유틸리티
│   ├── theme.ts                    # Material-UI 테마
│   ├── App.tsx                     # 앱 라우터
│   └── main.tsx                    # 엔트리 포인트
├── .env                            # 환경 변수
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md

총 26개 파일
```

## 🚀 설치 방법

### 1단계: 백엔드 API 서버 실행

먼저 Spring Boot 백엔드 서버가 `http://localhost:8080`에서 실행 중인지 확인하세요.

### 2단계: 프론트엔드 의존성 설치

```bash
cd moneygo-frontend
npm install
```

### 3단계: 환경 변수 확인

`.env` 파일이 생성되어 있으며, 다음 내용이 포함되어 있습니다:

```
VITE_API_BASE_URL=http://localhost:8080/api
```

백엔드 서버 주소가 다른 경우 이 값을 수정하세요.

### 4단계: 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 으로 접속합니다.

## ✨ 구현된 주요 기능

### 1. 인증 시스템
- **회원가입**: 이메일, 비밀번호, 이름, 전화번호로 가입
- **로그인**: JWT 토큰 기반 인증
- **자동 로그아웃**: 토큰 만료 시 자동 처리

### 2. 대시보드
- 현재 계좌 잔액 표시
- 최근 거래 내역 5개 표시
- 빠른 액션 버튼 (송금, QR결제)

### 3. 송금
- 계좌번호 입력 시 실시간 예금주 확인
- 송금액 입력 및 자동 포맷팅
- 비밀번호 확인
- 송금 완료 후 결과 다이얼로그

### 4. 거래내역
- 전체/보낸내역/받은내역 필터링
- 무한 스크롤 (더보기 버튼)
- 입금/출금 구분 표시
- 거래 상세 정보

### 5. QR 결제
- **QR 생성**: 금액과 메모 입력하여 QR 코드 생성
- **QR 스캔**: QR 코드로 결제 (실제 스캔은 모바일 앱에서 구현 필요)
- 10분 만료 시간 표시

## 🎨 UI/UX 특징

### Material-UI 컴포넌트
- 일관된 디자인 시스템
- 반응형 레이아웃
- 터치 친화적인 인터페이스

### 모바일 최적화
- 하단 네비게이션 바
- 카드 기반 레이아웃
- 터치 제스처 지원

### 사용자 피드백
- 로딩 스피너
- 에러 메시지 (Alert 컴포넌트)
- 성공 다이얼로그
- 실시간 입력 검증

## 🔒 보안 기능

### JWT 인증
- 로그인 시 토큰 발급
- LocalStorage에 토큰 저장
- Axios 인터셉터로 자동 토큰 포함
- 401 에러 시 자동 로그아웃

### 입력 검증
- 이메일 형식 검증
- 비밀번호 일치 확인
- 금액 범위 확인
- 계좌번호 형식 검증

## 🐛 문제 해결

### 1. CORS 에러
백엔드에서 CORS 설정 필요:

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowCredentials(true);
    }
}
```

### 2. API 연결 실패
- 백엔드 서버가 실행 중인지 확인
- `.env` 파일의 API URL 확인
- 브라우저 콘솔에서 네트워크 탭 확인

### 3. 빌드 에러
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules
npm install
```

## 📝 다음 단계

### 추가 구현 권장 사항

1. **알림 기능**
   - 실시간 알림 조회
   - 읽음/읽지 않음 상태 관리
   - 알림 배지

2. **송금 한도 관리**
   - 일일 한도 조회
   - 거래당 한도 표시
   - 한도 초과 시 경고

3. **예약 송금**
   - 예약 송금 등록
   - 예약 내역 조회
   - 예약 취소

4. **프로필 관리**
   - 사용자 정보 수정
   - 비밀번호 변경
   - 계좌 설정

5. **실제 QR 스캔**
   - 카메라 API 통합
   - QR 코드 인식
   - 스캔 결과 처리

6. **오프라인 지원**
   - Service Worker
   - PWA 구성
   - 오프라인 캐싱

## 🎓 학습 포인트

이 프로젝트를 통해 배울 수 있는 내용:

- React 18의 최신 기능 (Hooks)
- TypeScript를 활용한 타입 안전성
- Material-UI로 빠른 UI 개발
- Axios를 이용한 API 통신
- JWT 인증 처리
- React Router로 SPA 구현
- 반응형 웹 디자인

## 📚 참고 자료

- [React 공식 문서](https://react.dev/)
- [TypeScript 공식 문서](https://www.typescriptlang.org/)
- [Material-UI 문서](https://mui.com/)
- [Vite 문서](https://vitejs.dev/)
- [Axios 문서](https://axios-http.com/)

---

프로젝트에 대한 질문이나 문제가 있으면 이슈를 등록해주세요!
