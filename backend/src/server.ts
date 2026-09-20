import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import * as xlsx from 'xlsx';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const prisma = new PrismaClient();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

const getVal = (row: any, keys: string[]) => {
  for (const key of keys) {
    // Try exact match or lowercased match
    const foundKey = Object.keys(row).find(k => k.trim().toLowerCase() === key.trim().toLowerCase() || k.includes(key));
    if (foundKey && row[foundKey] !== undefined) return row[foundKey];
  }
  return null;
};

// --- ADMIN APIs ---
app.post('/api/admin/upload-game', upload.single('file'), async (req, res) => {
  try {
    const { gameName } = req.body;
    const file = req.file;

    if (!file || !gameName) {
      return res.status(400).json({ error: 'Missing file or gameName' });
    }

    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data: any[] = xlsx.utils.sheet_to_json(sheet);

    const game = await prisma.game.create({ data: { name: gameName } });

    const questionsToInsert = data.map((row) => {
      const qText = getVal(row, ['โจทย์', 'คำถาม', 'Question', 'รายละเอียด']) || '';
      return {
        gameId: game.id,
        category: getVal(row, ['หมวดหมู่', 'category', 'หมวด']) || 'ทั่วไป',
        questionText: String(qText),
        optionA: getVal(row, ['A', 'ก', 'ตัวเลือก 1', 'ตัวเลือก A']) ? String(getVal(row, ['A', 'ก', 'ตัวเลือก 1', 'ตัวเลือก A'])) : null,
        optionB: getVal(row, ['B', 'ข', 'ตัวเลือก 2', 'ตัวเลือก B']) ? String(getVal(row, ['B', 'ข', 'ตัวเลือก 2', 'ตัวเลือก B'])) : null,
        optionC: getVal(row, ['C', 'ค', 'ตัวเลือก 3', 'ตัวเลือก C']) ? String(getVal(row, ['C', 'ค', 'ตัวเลือก 3', 'ตัวเลือก C'])) : null,
        optionD: getVal(row, ['D', 'ง', 'ตัวเลือก 4', 'ตัวเลือก D']) ? String(getVal(row, ['D', 'ง', 'ตัวเลือก 4', 'ตัวเลือก D'])) : null,
        correctAnswer: String(getVal(row, ['เฉลย', 'Answer', 'ถูกต้อง']) || '').trim().toUpperCase(),
        timeLimit: parseInt(getVal(row, ['เวลา', 'time'])) || 60,
        points: parseInt(getVal(row, ['คะแนน', 'points'])) || 0,
        penaltySpaces: parseInt(getVal(row, ['ลงโทษ', 'penalty', 'ถอยหลัง'])) || 0,
      }
    });

    // filter out empty questions
    const validQuestions = questionsToInsert.filter(q => q.questionText && q.questionText.trim() !== '' && q.questionText !== 'undefined' && q.questionText !== 'null');

    if (validQuestions.length === 0) {
      return res.status(400).json({ error: 'ไม่พบโจทย์ในไฟล์ Excel กรุณาตรวจสอบหัวคอลัมน์ (ต้องมีคำว่า โจทย์ หรือ คำถาม)' });
    }

    await prisma.question.createMany({ data: validQuestions });

    res.json({ success: true, gameId: game.id, questionsCount: validQuestions.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/games', async (req, res) => {
  const games = await prisma.game.findMany({ include: { _count: { select: { questions: true } } } });
  res.json(games);
});

app.delete('/api/admin/games/:id', async (req, res) => {
  try {
    const gameId = Number(req.params.id);
    await prisma.game.delete({ where: { id: gameId } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete game' });
  }
});

app.post('/api/admin/matches', async (req, res) => {
  try {
    const pinCode = Math.floor(100000 + Math.random() * 900000).toString(); 
    const match = await prisma.match.create({
      data: { gameId: Number(req.body.gameId), pinCode }
    });
    res.json(match);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create match' });
  }
});

app.get('/api/admin/matches', async (req, res) => {
  const matches = await prisma.match.findMany({ 
    include: { game: true, teams: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json(matches);
});

app.delete('/api/admin/matches/:id', async (req, res) => {
  try {
    const matchId = Number(req.params.id);
    await prisma.match.delete({
      where: { id: matchId }
    });
    io.to(`match_${matchId}`).emit('match_closed');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete match' });
  }
});

app.post('/api/admin/matches/:id/reset', async (req, res) => {
  try {
    const matchId = Number(req.params.id);
    await prisma.match.update({
      where: { id: matchId },
      data: { status: 'playing' }
    });
    await prisma.team.updateMany({
      where: { matchId },
      data: { currentPosition: 0, score: 0 } // ใช้ score เก็บอันดับที่ (1, 2, 3)
    });
    io.to(`match_${matchId}`).emit('match_reset');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset match' });
  }
});

// --- PLAYER APIs ---
app.post('/api/player/join', async (req, res) => {
  try {
    const { pinCode, teamName } = req.body;
    const match = await prisma.match.findUnique({
      where: { pinCode: String(pinCode) },
      include: { teams: true }
    });
    if (!match) return res.status(404).json({ success: false, error: 'ไม่พบรหัส PIN นี้' });
    if (match.teams.length >= 12 && !match.teams.find(t => t.name === teamName)) {
      return res.status(400).json({ success: false, error: 'ห้องนี้เต็มแล้ว (12 ทีม)' });
    }

    let team = match.teams.find(t => t.name === teamName);
    if (!team) {
      team = await prisma.team.create({
        data: { matchId: match.id, name: teamName }
      });
      io.to(`match_${match.id}`).emit('team_joined', team);
    }
    res.json({ success: true, teamId: team.id, matchId: match.id });
  } catch (error) {
    res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาด' });
  }
});

app.get('/api/player/match/:matchId', async (req, res) => {
  try {
    const matchId = Number(req.params.matchId);
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { 
        teams: true,
        game: {
          include: { questions: true }
        }
      }
    });
    res.json(match);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching match' });
  }
});

// --- SOCKET.IO ---
io.on('connection', (socket) => {
  socket.on('join_match', (matchId) => {
    socket.join(`match_${matchId}`);
  });

  socket.on('roll_dice', async ({ matchId, teamId }) => {
    const dice = Math.floor(Math.random() * 6) + 1;
    
    const match = await prisma.match.findUnique({ where: { id: Number(matchId) }, include: { teams: true } });
    const team = match?.teams.find(t => t.id === Number(teamId));
    if (!team || !match) return;
    if (team.score > 0) return; // เข้าเส้นชัยไปแล้ว ห้ามทอยอีก

    let newPosition = team.currentPosition + dice;
    let isWinner = false;
    let place = 0;
    let isGameOver = false;

    if (newPosition === 20) {
      isWinner = true;
      newPosition = 0;
      
      const finishedTeams = match.teams.filter(t => t.score > 0).length;
      place = finishedTeams + 1;
      
      if (place >= 3 || place >= match.teams.length) {
        isGameOver = true;
        await prisma.match.update({ where: { id: Number(matchId) }, data: { status: 'finished' } });
      }
    } else if (newPosition > 20) {
      const overshoot = newPosition - 20;
      newPosition = 20 - overshoot;
    }

    const updatedTeam = await prisma.team.update({
      where: { id: Number(teamId) },
      data: { currentPosition: newPosition, score: isWinner ? place : 0 }
    });

    io.to(`match_${matchId}`).emit('dice_rolled', { 
      teamId, 
      dice, 
      actualDice: dice,
      newPosition,
      teamName: team.name,
      isWinner,
      place,
      isGameOver
    });
  });

  socket.on('answer_question', async ({ matchId, teamId, isCorrect, penaltySpaces }) => {
    console.log(`[answer_question] matchId=${matchId}, teamId=${teamId}, isCorrect=${isCorrect}, penaltySpaces=${penaltySpaces}`);
    const team = await prisma.team.findUnique({ where: { id: Number(teamId) } });
    if (!team) {
       console.log(`[answer_question] Team ${teamId} not found!`);
       return;
    }
    console.log(`[answer_question] Team found, currentPosition=${team.currentPosition}`);

    let newPosition = team.currentPosition;
    let isWinner = false;
    let place = 0;
    let isGameOver = false;

    if (!isCorrect) {
      newPosition -= penaltySpaces; 
      if (newPosition <= 0) {
         newPosition = 0; // ไม่ให้ถอยต่ำกว่าจุด Start
      } else if (newPosition === 20) {
         isWinner = true;
         newPosition = 0;
         
         const match = await prisma.match.findUnique({ where: { id: Number(matchId) }, include: { teams: true } });
         if (match) {
           const finishedTeams = match.teams.filter(t => t.score > 0).length;
           place = finishedTeams + 1;
           if (place >= 3 || place >= match.teams.length) {
             isGameOver = true;
             await prisma.match.update({ where: { id: Number(matchId) }, data: { status: 'finished' } });
           }
         }
      } else if (newPosition > 20) {
         const overshoot = newPosition - 20;
         newPosition = 20 - overshoot;
      }
      
      const updatedTeam = await prisma.team.update({
        where: { id: Number(teamId) },
        data: { currentPosition: newPosition, score: isWinner ? place : 0 }
      });
      
      io.to(`match_${matchId}`).emit('move_backward', { teamId, spaces: penaltySpaces, newPosition, isWinner, place, isGameOver });
    } else {
      const updatedTeam = await prisma.team.update({
        where: { id: Number(teamId) },
        data: { currentPosition: newPosition }
      });
      io.to(`match_${matchId}`).emit('team_updated', updatedTeam);
    }
  });
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// I should actually use replace_file_content or sed to properly insert the delete route for games.
