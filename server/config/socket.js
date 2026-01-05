const { Server } = require('socket.io');
const socketHandler = require('../socket/socketHandler');

let io = null;

/**
 * Socket.IO 서버 초기화
 * @param {http.Server} server - HTTP 서버 인스턴스
 */
function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // 연결 이벤트 핸들러
  io.on('connection', (socket) => {
    console.log(`🔌 클라이언트 연결됨: ${socket.id}`);

    // 소켓 이벤트 핸들러 등록
    socketHandler(io, socket);

    socket.on('disconnect', (reason) => {
      console.log(`❌ 클라이언트 연결 해제: ${socket.id} (${reason})`);
    });
  });

  console.log('✅ Socket.IO 서버 초기화 완료');
  return io;
}

/**
 * Socket.IO 인스턴스 반환
 */
function getIO() {
  if (!io) {
    throw new Error('Socket.IO가 초기화되지 않았습니다.');
  }
  return io;
}

module.exports = { initializeSocket, getIO };
