const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 회원가입
router.post('/register', authController.register);

// 로그인
router.post('/login', authController.login);

// 로그아웃
router.post('/logout', authController.logout);

// 현재 사용자 정보
router.get('/me', authController.getMe);

// 토큰 갱신
router.post('/refresh', authController.refreshToken);

module.exports = router;
