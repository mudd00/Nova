require('dotenv').config();
const http = require('http');
const app = require('./app');
const { initializeSocket } = require('./config/socket');

const PORT = process.env.PORT || 3001;

// HTTP 서버 생성
const server = http.createServer(app);

// Socket.IO 초기화
initializeSocket(server);

// 서버 시작
server.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║     Mini App Generator Server Started     ║
  ╠═══════════════════════════════════════════╣
  ║  Local:   http://localhost:${PORT}           ║
  ║  Mode:    ${process.env.NODE_ENV || 'development'}                    ║
  ╚═══════════════════════════════════════════╝
  `);
});

// 에러 핸들링
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
