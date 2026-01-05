# Nova 프로젝트 핸드오프 문서

## 프로젝트 개요
- **프로젝트명**: Nova (이전: Mini App Generator)
- **설명**: AI를 활용한 미니 앱 생성기. 사용자가 채팅으로 요구사항을 입력하면 AI가 HTML/CSS/JS 코드를 생성해주는 웹 서비스
- **GitHub**: https://github.com/mudd00/Nova.git

---

## 기술 스택

### Frontend (client/)
- React 18 + Vite
- Tailwind CSS (다크/라이트 테마 지원)
- Socket.io-client (실시간 통신)
- React Router DOM

### Backend (server/)
- Express.js
- Socket.io
- Anthropic Claude API (AI 코드 생성)
- SQLite (better-sqlite3)
- JWT 인증

---

## 프로젝트 구조
```
Nova/
├── client/                 # 프론트엔드
│   ├── src/
│   │   ├── components/
│   │   │   └── layout/
│   │   │       └── Header.jsx      # 헤더 (모바일 햄버거 메뉴 포함)
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # 인증 상태 관리
│   │   │   ├── SocketContext.jsx   # 소켓 연결 관리
│   │   │   └── ThemeContext.jsx    # 다크/라이트 테마 관리
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   └── useSocket.js
│   │   ├── pages/
│   │   │   ├── HomePage.jsx        # 랜딩 페이지
│   │   │   ├── GeneratorPage.jsx   # 앱 생성 페이지 (채팅 + 미리보기)
│   │   │   ├── MyAppsPage.jsx      # 내 앱 목록
│   │   │   ├── AppDetailPage.jsx   # 앱 상세 페이지
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── tailwind.config.js          # xs 브레이크포인트(475px) 추가됨
│   └── vite.config.js
│
├── server/                 # 백엔드
│   ├── config/
│   │   ├── anthropic.js            # Claude API 설정
│   │   ├── database.js             # SQLite 설정
│   │   └── socket.js
│   ├── controllers/
│   │   ├── appController.js
│   │   ├── authController.js
│   │   └── generatorController.js
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT 검증
│   │   └── errorHandler.js
│   ├── prompts/
│   │   ├── appGenerationPrompt.js  # AI 앱 생성 프롬프트
│   │   └── requirementPrompt.js    # 요구사항 분석 프롬프트
│   ├── routes/
│   │   ├── appRoutes.js
│   │   ├── authRoutes.js
│   │   └── generatorRoutes.js
│   ├── services/
│   │   ├── AppGeneratorService.js  # 앱 생성 로직
│   │   └── CodeExplainerService.js # 코드 설명 기능
│   ├── socket/
│   │   └── socketHandler.js        # 실시간 통신 핸들러
│   ├── app.js
│   └── index.js
│
├── database/
│   └── schema.sql                  # DB 스키마
│
├── .env.example
├── .gitignore
├── LOGO_PROMPTS.md                 # 로고 생성용 Gemini 프롬프트
├── package.json
└── package-lock.json
```

---

## 완료된 작업

### 1. 모바일 최적화
- **GeneratorPage.jsx**: 모바일에서 채팅/미리보기 탭 전환 방식 구현
- **Header.jsx**: 햄버거 메뉴 추가 (md 브레이크포인트 이하에서 표시)
- **AppDetailPage.jsx**: 모바일 뒤로가기 버튼, 반응형 높이 적용
- **HomePage.jsx**: 반응형 타이포그래피, 간격, CTA 버튼 최적화
- **tailwind.config.js**: xs 브레이크포인트(475px) 및 iOS safe-area 지원 추가

### 2. 브랜딩
- 프로젝트명 "Mini App Generator" → "Nova"로 변경
- 브랜드 컨셉: 새로운 별의 탄생 = 새로운 앱의 탄생
- 다크 테마 메인으로 설정
- **LOGO_PROMPTS.md**: Gemini AI용 로고 생성 프롬프트 작성 완료

### 3. 기타 기능 (이전 세션)
- 다크/라이트 테마 토글
- ZIP 다운로드 기능
- 실시간 코드 생성 (스트리밍)
- 사용자 인증 (회원가입/로그인)

---

## 실행 방법

### 환경 설정
```bash
# Nova 폴더로 이동
cd Nova

# 환경변수 설정
cp .env.example .env
cp client/.env.example client/.env
cp server/.env.example server/.env

# server/.env에 Anthropic API 키 설정 필요
# ANTHROPIC_API_KEY=your_api_key_here
```

### 의존성 설치 및 실행
```bash
# 루트에서 전체 설치
npm install
cd client && npm install
cd ../server && npm install

# 개발 서버 실행 (루트에서)
npm run dev
```

### 포트
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

---

## 다음 작업 (TODO)

### 우선순위 높음
1. **로고 제작**: LOGO_PROMPTS.md의 프롬프트로 Gemini에서 로고 생성
2. **브랜딩 적용**: 사이트 내 "Mini App Generator" 텍스트를 "Nova"로 변경
3. **파비콘 및 메타태그**: 새 로고로 파비콘 설정, OG 태그 추가

### 기능 개선
4. **코드 내보내기 옵션**: HTML 단일 파일 외에 분리된 파일 구조 지원
5. **앱 공유 기능**: 생성된 앱을 다른 사용자와 공유
6. **버전 히스토리**: 앱 수정 이력 관리

### 기타
7. **배포 준비**: Vercel/Railway 등 배포 설정
8. **테스트 작성**: 주요 기능 테스트 코드

---

## 주요 파일 수정 이력

| 파일 | 변경 내용 |
|------|----------|
| `client/src/pages/GeneratorPage.jsx` | 모바일 탭 전환 (채팅/미리보기) |
| `client/src/components/layout/Header.jsx` | 햄버거 메뉴 추가 |
| `client/src/pages/AppDetailPage.jsx` | 모바일 뒤로가기, 반응형 높이 |
| `client/src/pages/HomePage.jsx` | 반응형 타이포그래피/간격 |
| `client/tailwind.config.js` | xs 브레이크포인트, safe-area |
| `LOGO_PROMPTS.md` | 로고 생성 프롬프트 (신규) |

---

## 참고 사항

### Tailwind 브레이크포인트
```
xs: 475px   (추가됨)
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### 테마 컬러 (로고용)
- Primary Cyan: #00d4ff
- Secondary Purple: #8b5cf6
- Accent Magenta: #ec4899
- Dark Background: #0f172a, #1e293b

### Git 브랜치
- `main`: 메인 브랜치
- `dev`: 백업/개발용 브랜치

---

## 마지막 업데이트
- 날짜: 2026-01-05
- 상태: 모바일 최적화 완료, Nova 브랜딩 결정, 파일 마이그레이션 완료
