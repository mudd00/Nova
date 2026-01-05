/**
 * Socket.IO 이벤트 핸들러
 */
function socketHandler(io, socket) {
  // 세션 참가
  socket.on('join-session', ({ sessionId }) => {
    socket.join(sessionId);
    console.log(`📍 Socket ${socket.id} joined session: ${sessionId}`);

    socket.emit('session-joined', {
      sessionId,
      message: '세션에 연결되었습니다.'
    });
  });

  // 세션 나가기
  socket.on('leave-session', ({ sessionId }) => {
    socket.leave(sessionId);
    console.log(`📍 Socket ${socket.id} left session: ${sessionId}`);
  });

  // 메시지 전송 (실시간 타이핑 표시용)
  socket.on('send-message', ({ sessionId, message }) => {
    // 타이핑 시작 알림
    io.to(sessionId).emit('ai-typing', {
      sessionId,
      isTyping: true
    });
  });

  // 앱 생성 요청 (실시간 진행률 표시)
  socket.on('request-generation', ({ sessionId }) => {
    console.log(`🚀 Generation requested for session: ${sessionId}`);
    // 실제 생성은 REST API로 처리, 여기서는 상태만 전파
    io.to(sessionId).emit('generation-started', {
      sessionId,
      message: '앱 생성을 시작합니다...'
    });
  });

  // 수정 요청 (Phase 2)
  socket.on('request-modification', ({ sessionId, modification }) => {
    console.log(`🔧 Modification requested for session: ${sessionId}`);
    // Phase 2에서 구현
  });

  // 에러 핸들링
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
}

module.exports = socketHandler;
