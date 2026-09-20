const io = require('socket.io-client');
const socket = io('http://localhost:4000');

socket.on('connect', () => {
  console.log('Connected to server');
  socket.emit('join_match', 18);
  setTimeout(() => {
    socket.emit('answer_question', { matchId: 18, teamId: 25, isCorrect: false, penaltySpaces: -5 });
    console.log('Emitted answer_question');
  }, 1000);
  
  socket.on('move_backward', (data) => {
    console.log('Received move_backward:', data);
    process.exit(0);
  });
});
