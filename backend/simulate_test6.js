const io = require('socket.io-client');
const socket = io('http://localhost:4000');

socket.on('connect', () => {
  console.log('Connected to server');
  const matchId = "19"; // Assuming they are on 19 or 20
  socket.emit('join_match', matchId);
  
  // Simulate clicking 'ดวง เดินหน้า 1'
  socket.emit('answer_question', { matchId, teamId: 32, isCorrect: false, penaltySpaces: -1 });
  
  socket.on('move_backward', (data) => {
    console.log('Received move_backward:', data);
    process.exit(0);
  });
});
