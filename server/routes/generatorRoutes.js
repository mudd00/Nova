const express = require('express');
const router = express.Router();
const generatorController = require('../controllers/generatorController');
const authMiddleware = require('../middleware/authMiddleware');

// 모든 라우트에 인증 필요
router.use(authMiddleware);

// 대화 세션 시작
router.post('/session/start', generatorController.startSession);

// 대화 메시지 전송
router.post('/session/:sessionId/chat', generatorController.sendMessage);

// 앱 생성 요청
router.post('/session/:sessionId/generate', generatorController.generateApp);

// 생성 상태 조회
router.get('/session/:sessionId/status', generatorController.getSessionStatus);

// 코드 설명 요청
router.post('/explain', generatorController.explainCode);

// 코드 수정 요청 (Phase 2)
router.post('/modify', generatorController.modifyCode);

// 코드 품질 점수 조회 (Phase 2)
router.get('/quality/:appId', generatorController.getQualityScore);

module.exports = router;
