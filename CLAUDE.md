# Nova - AI Mini App Generator

## 프로젝트 소개
사용자가 채팅으로 요구사항을 입력하면 AI(Claude)가 HTML/CSS/JS 미니 앱을 실시간으로 생성해주는 웹 서비스.

- **브랜드명**: Nova (새로운 별의 탄생 = 새로운 앱의 탄생)
- **테마**: 다크 모드 메인, 라이트 모드 지원
- **GitHub**: https://github.com/mudd00/Nova.git

---

## 기술 스택
- **Frontend**: React 18, Vite, Tailwind CSS, Socket.io-client
- **Backend**: Express.js, Socket.io, Anthropic Claude API, SQLite
- **인증**: JWT

---

## 실행 방법
```bash
# 환경변수 설정 (server/.env에 ANTHROPIC_API_KEY 필수)
cp .env.example .env
cp client/.env.example client/.env
cp server/.env.example server/.env

# 의존성 설치
npm install && cd client && npm install && cd ../server && npm install && cd ..

# 실행
npm run dev
```
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

---

## 프로젝트 구조
```
Nova/
├── client/                 # React 프론트엔드
│   ├── src/
│   │   ├── components/layout/Header.jsx
│   │   ├── context/        # Auth, Socket, Theme
│   │   ├── pages/          # Home, Generator, MyApps, AppDetail, Login, Register
│   │   └── hooks/
│   └── tailwind.config.js  # xs:475px 브레이크포인트 추가됨
├── server/                 # Express 백엔드
│   ├── controllers/
│   ├── services/           # AppGeneratorService, CodeExplainerService
│   ├── prompts/            # AI 프롬프트
│   ├── socket/
│   └── routes/
└── database/schema.sql
```

---

## 완료된 작업
- [x] 기본 앱 생성 기능 (채팅 → AI 코드 생성 → 미리보기)
- [x] 사용자 인증 (회원가입/로그인)
- [x] 다크/라이트 테마 토글
- [x] ZIP 다운로드 기능
- [x] 모바일 최적화
  - GeneratorPage: 채팅/미리보기 탭 전환
  - Header: 햄버거 메뉴
  - AppDetailPage: 반응형 레이아웃
  - HomePage: 반응형 타이포그래피
- [x] 브랜딩: "Mini App Generator" → "Nova"
- [x] 로고 생성 프롬프트 작성 (LOGO_PROMPTS.md)

---

## TODO (다음 작업)
- [ ] **로고 제작**: LOGO_PROMPTS.md 프롬프트로 Gemini에서 생성
- [ ] **브랜딩 적용**: 코드 내 "Mini App Generator" 텍스트 → "Nova" 변경
- [ ] **파비콘/메타태그**: 새 로고로 파비콘, OG 태그 설정
- [ ] 코드 내보내기 옵션 확장
- [ ] 앱 공유 기능
- [ ] 배포 (Vercel/Railway)

---

## 컨벤션
- Tailwind 브레이크포인트: xs(475px), sm(640px), md(768px), lg(1024px)
- 테마 컬러: Cyan #00d4ff, Purple #8b5cf6, Magenta #ec4899
- 다크 배경: #0f172a, #1e293b

---

## 참고 파일
- `LOGO_PROMPTS.md`: 로고 생성용 Gemini 프롬프트
- `PROJECT_HANDOFF.md`: 상세 핸드오프 문서
