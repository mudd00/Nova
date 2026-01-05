const express = require('express');
const router = express.Router();
const appController = require('../controllers/appController');
const authMiddleware = require('../middleware/authMiddleware');

// 모든 라우트에 인증 필요
router.use(authMiddleware);

// 내 앱 목록 조회
router.get('/', appController.getMyApps);

// 앱 상세 조회
router.get('/:id', appController.getAppById);

// 앱 삭제
router.delete('/:id', appController.deleteApp);

// 앱 ZIP 다운로드 (Phase 2)
router.get('/:id/download', appController.downloadApp);

// 버전 히스토리 조회 (Phase 3)
router.get('/:id/versions', appController.getVersionHistory);

// 특정 버전으로 롤백 (Phase 3)
router.post('/:id/rollback/:versionId', appController.rollbackVersion);

module.exports = router;
