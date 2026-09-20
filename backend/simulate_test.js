const io = require('socket.io-client');
const socket = io('http://localhost:4000');
socket.on('connect', () => {
  console.log('Connected');
  socket.emit('join_match', "18");
  socket.emit('answer_question', { matchId: "18", teamId: 25, isCorrect: false, penaltySpaces: -5 });
});
socket.on('move_backward', (data) => {
  console.log('Move backward received:', data);
  process.exit(0);
});
