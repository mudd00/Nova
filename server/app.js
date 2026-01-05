const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// 라우트 임포트
const authRoutes = require('./routes/authRoutes');
const appRoutes = require('./routes/appRoutes');
const generatorRoutes = require('./routes/generatorRoutes');

// 미들웨어 임포트
const errorHandler = require('./middleware/errorHandler');

const app = express();

// 보안 헤더 설정
app.use(helmet({
  contentSecurityPolicy: false, // React 개발 시 비활성화
}));

// CORS 설정
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// JSON 파싱
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공 (프로덕션용)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
}

// API 라우트
app.use('/api/auth', authRoutes);
app.use('/api/apps', appRoutes);
app.use('/api/generator', generatorRoutes);

// 헬스 체크 엔드포인트
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 프로덕션에서 React 앱 서빙
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// 에러 핸들러
app.use(errorHandler);

module.exports = app;
