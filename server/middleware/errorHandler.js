/**
 * 전역 에러 핸들러 미들웨어
 */
function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Supabase 에러
  if (err.code && err.message) {
    return res.status(400).json({
      success: false,
      error: err.message,
      code: err.code
    });
  }

  // Anthropic API 에러
  if (err.status && err.error) {
    return res.status(err.status).json({
      success: false,
      error: 'AI 서비스 오류가 발생했습니다.',
      details: process.env.NODE_ENV === 'development' ? err.error : undefined
    });
  }

  // 일반 에러
  const statusCode = err.statusCode || 500;
  const message = err.message || '서버 오류가 발생했습니다.';

  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}

module.exports = errorHandler;
