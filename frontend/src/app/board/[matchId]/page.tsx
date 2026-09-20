'use client';
import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useParams, useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import Swal from 'sweetalert2';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function BoardPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.matchId as string;
  const [socket, setSocket] = useState<Socket | null>(null);
  
  const [teamId, setTeamId] = useState<number | null>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [matchData, setMatchData] = useState<any>(null);

  const [rolling, setRolling] = useState(false);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [rollingTeamId, setRollingTeamId] = useState<number | null>(null);

  const [activeQuestion, setActiveQuestion] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameOverStats, setGameOverStats] = useState<{place: number, teamName: string} | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);

  const socketRef = useRef<any>(null);

  const questionsRef = useRef(questions);
  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  const teamIdRef = useRef(teamId);
  useEffect(() => {
    teamIdRef.current = teamId;
  }, [teamId]);

  const teamsRef = useRef(teams);
  useEffect(() => {
    teamsRef.current = teams;
  }, [teams]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isAdmin = urlParams.get('admin') === 'true';

    if (!isAdmin) {
      const storedTeam = localStorage.getItem('teamId');
      if (!storedTeam) {
        Swal.fire({title: 'ข้อผิดพลาด', text: 'ไม่พบข้อมูลทีม กรุณาเข้าร่วมใหม่', icon: 'error', background: '#0f172a', color: '#e2e8f0'});
        router.push('/');
        return;
      }
      setTeamId(Number(storedTeam));
    }

    fetchMatchData();

    const newSocket = io(API_URL);
    setSocket(newSocket);
    socketRef.current = newSocket;

    newSocket.emit('join_match', matchId);

    newSocket.on('team_joined', (newTeam) => {
      setTeams(prev => {
        if (prev.find(t => t.id === newTeam.id)) return prev;
        return [...prev, newTeam];
      });
    });

    newSocket.on('dice_rolled', ({ teamId: rolledTeamId, dice, actualDice, newPosition, teamName, isWinner, place, isGameOver: serverIsGameOver }) => {
      if (rolledTeamId === teamIdRef.current) {
        setRolling(true);
        setDiceResult(actualDice || dice); 
      }
      
      setTimeout(() => {
        let stepsTaken = 0;
        
        let path: number[] = [];
        let curr = teamsRef.current.find((t: any) => t.id === rolledTeamId)?.currentPosition || 0;
        let isBouncing = false;
        
        for (let i = 0; i < dice; i++) {
            if (!isBouncing) {
                curr++;
                if (curr === 20) {
                    path.push(0);
                    isBouncing = true;
                } else {
                    path.push(curr);
                }
            } else {
                curr--;
                path.push(curr);
            }
        }

        const moveInterval = setInterval(() => {
          setTeams(prev => prev.map(t => {
            if (t.id === rolledTeamId) {
              return { ...t, currentPosition: path[stepsTaken] !== undefined ? path[stepsTaken] : t.currentPosition };
            }
            return t;
          }));
          
          stepsTaken++;

          if (stepsTaken >= dice) {
            clearInterval(moveInterval);
            
            if (rolledTeamId === teamIdRef.current) {
              setRolling(false);
              setDiceResult(null);
            }

            if (isWinner) {
              setTeams(prev => prev.map(t => t.id === rolledTeamId ? { ...t, score: place } : t));
              setTimeout(() => {
                confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
                Swal.fire({
        background: '#0f172a',
        color: '#e2e8f0', title: 'เข้าเส้นชัย!', text: `🎉 ทีม ${teamName} ได้อันดับที่ ${place} 🎉`, icon: 'success' });
                if (serverIsGameOver) {
                  setIsGameOver(true);
                }
              }, 400);
            } else if (rolledTeamId === teamIdRef.current) {
              setTimeout(() => triggerQuestion(newPosition), 400);
            }
          }
        }, 500); 
      }, 1500); 
    });

    newSocket.on('move_backward', async ({ teamId: backwardTeamId, spaces, newPosition, isWinner, place, isGameOver: serverIsGameOver }) => {
      const isForward = spaces < 0;
      const absoluteSpaces = Math.abs(spaces);
      
      let curr = teamsRef.current.find(t => t.id === backwardTeamId)?.currentPosition || 0;
      let path: number[] = [];
      let isBouncing = false;
      
      for (let i = 0; i < absoluteSpaces; i++) {
        if (isForward) {
           if (!isBouncing) {
               curr++;
               if (curr === 20) {
                   path.push(0);
                   isBouncing = true;
               } else {
                   path.push(curr);
               }
           } else {
               curr--;
               path.push(curr);
           }
        } else {
           curr--;
           if (curr < 0) curr = 19;
           path.push(curr);
        }
      }

      const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

      for (let i = 0; i < path.length; i++) {
        setTeams(prev => prev.map(t => {
          if (t.id === backwardTeamId) {
            return { ...t, currentPosition: path[i] };
          }
          return t;
        }));
        await delay(500);
      }

      if (isWinner && isForward) {
         setTeams(prev => prev.map(t => t.id === backwardTeamId ? { ...t, score: place } : t));
         setTimeout(() => {
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            Swal.fire({
        background: '#0f172a',
        color: '#e2e8f0', title: 'เข้าเส้นชัย!', text: `🎉 ยินดีด้วย! เข้าเส้นชัยด้วยการ์ดดวงดี! ได้อันดับที่ ${place} 🎉`, icon: 'success' });
            if (serverIsGameOver) setIsGameOver(true);
         }, 400);
      }
    });

    newSocket.on('team_updated', (updatedTeam) => {
      setTeams(prev => prev.map(t => t.id === updatedTeam.id ? updatedTeam : t));
    });

    newSocket.on('match_reset', () => {
      Swal.fire({title: 'รีเซ็ตเกม!', text: 'ทุกทีมจะกลับไปจุดเริ่มต้น', icon: 'info', background: '#0f172a', color: '#e2e8f0'});
      setIsGameOver(false);
      setTeams(prev => prev.map(t => ({ ...t, currentPosition: 0, score: 0 })));
    });

    newSocket.on('match_closed', () => {
      Swal.fire({title: 'ห้องถูกปิด', text: 'แอดมินได้ทำการปิดห้องการแข่งขันนี้แล้ว!', icon: 'warning', background: '#0f172a', color: '#e2e8f0'});
      localStorage.removeItem('teamId');
      localStorage.removeItem('matchId');
      router.push('/');
    });

    return () => {
      newSocket.disconnect();
    };
  }, [matchId, router]);

  useEffect(() => {
    let timer: any;
    if (activeQuestion && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (activeQuestion && timeLeft === 0) {
      handleAnswerTimeOut();
    }
    return () => clearInterval(timer);
  }, [activeQuestion, timeLeft]);

  const fetchMatchData = async () => {
    const res = await fetch(`${API_URL}/api/player/match/${matchId}`);
    const data = await res.json();
    setMatchData(data);
    setTeams(data.teams || []);
    setQuestions(data.game?.questions || []);
  };

  const handleRollDice = () => {
    if (rolling) return;
    socket?.emit(`roll_dice`, { matchId, teamId });
  };

  const triggerQuestion = (position: number) => {
    const currentQuestions = questionsRef.current;
    if (position === 0 || currentQuestions.length === 0) return; // Start space
    
    // สุ่มคำถามจากชุดคำถามทั้งหมด
    const qIndex = Math.floor(Math.random() * currentQuestions.length);
    const q = currentQuestions[qIndex];
    
    if (q.category?.trim() === 'ดวง' || q.category?.includes('ดวง')) {
      Swal.fire({
        background: '#0f172a',
        color: '#e2e8f0',
        title: 'เหตุการณ์พิเศษ! 🌟',
        text: q.questionText,
        icon: 'info',
        confirmButtonText: 'รับทราบ',
        confirmButtonColor: '#6366f1'
      }).then(() => {
        socketRef.current?.emit('answer_question', { matchId, teamId: teamIdRef.current, isCorrect: false, penaltySpaces: -q.penaltySpaces });
      });
      return;
    }

    setActiveQuestion(q);
    setTimeLeft(q.timeLimit || 60);
  };

  const handleAnswerSubmit = (selectedOption: string) => {
    if (!activeQuestion) return;

    const isCorrect = selectedOption === activeQuestion.correctAnswer;
    
    if (isCorrect) {
      Swal.fire({
        background: '#0f172a',
        color: '#e2e8f0',
        title: '✅ ตอบถูก!',
        text: 'เก่งมาก ๆ รับโชคไปเลย!',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        socket?.emit('answer_question', { 
          matchId, 
          teamId: teamIdRef.current, 
          isCorrect, 
          penaltySpaces: Math.abs(activeQuestion.penaltySpaces) 
        });
        setActiveQuestion(null);
      });
    } else {
      Swal.fire({
        background: '#0f172a',
        color: '#e2e8f0',
        title: '❌ ตอบผิด!',
        text: `โดนลงโทษถอยหลัง ${Math.abs(activeQuestion.penaltySpaces)} ช่อง`,
        icon: 'error',
        confirmButtonText: 'ยอมรับชะตากรรม',
        confirmButtonColor: '#ef4444'
      }).then(() => {
        socket?.emit('answer_question', { 
          matchId, 
          teamId: teamIdRef.current, 
          isCorrect, 
          penaltySpaces: Math.abs(activeQuestion.penaltySpaces) 
        });
        setActiveQuestion(null);
      });
    }
  };

  const handleAnswerTimeOut = () => {
    Swal.fire({
        background: '#0f172a',
        color: '#e2e8f0',
      title: '⏳ หมดเวลา!',
      text: `โดนลงโทษถอยหลัง ${Math.abs(activeQuestion.penaltySpaces)} ช่อง`,
      icon: 'warning',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#f59e0b'
    }).then(() => {
      socket?.emit('answer_question', { 
        matchId, 
        teamId: teamIdRef.current, 
        isCorrect: false, 
        penaltySpaces: Math.abs(activeQuestion.penaltySpaces) 
      });
      setActiveQuestion(null);
    });
  };

  const tokenColors = [
    'bg-cyan-400 text-slate-900', 'bg-pink-500 text-white', 
    'bg-yellow-400 text-slate-900', 'bg-emerald-400 text-slate-900', 
    'bg-purple-500 text-white', 'bg-orange-500 text-white', 
    'bg-rose-400 text-slate-900', 'bg-lime-400 text-slate-900',
    'bg-blue-500 text-white', 'bg-red-500 text-white', 
    'bg-fuchsia-400 text-slate-900', 'bg-amber-400 text-slate-900'
  ];

  const renderSpace = (index: number) => {
    const teamsHere = teams.filter(t => t.currentPosition === index);
    
    // กำหนดสีพื้นหลังช่องพิเศษ
    let bgClass = "bg-white/20";
    let textClass = "text-cyan-100 font-bold drop-shadow-md";
    let borderClass = "border-[3px] border-cyan-500/70 shadow-[0_0_10px_rgba(34,211,238,0.3)] hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.5)]";
    
    if (index === 0) {
      bgClass = "bg-yellow-500/30";
      textClass = "text-yellow-300 font-black drop-shadow-md";
      borderClass = "border-[3px] border-yellow-500/80 shadow-[0_0_15px_rgba(250,204,21,0.4)] z-10";
    }

    return (
      <div key={index} className={`${bgClass} ${borderClass} p-1 relative flex flex-col items-center justify-between shadow-md hover:shadow-lg transition-all duration-300 h-full w-full rounded-2xl overflow-y-auto scrollbar-hide`}>
        <span className={`text-[12px] md:text-sm absolute top-1 left-2 ${textClass}`}>{index === 0 ? 'START' : index}</span>
        
        <div className="flex flex-wrap gap-2 items-center justify-center h-full pt-6 pb-2 w-full">
          {teamsHere.map((t, i) => {
            const safeColor = tokenColors[t.id % tokenColors.length];
            return (
              <div 
                key={t.id} 
                className={`w-7 h-7 md:w-8 md:h-8 rounded-full ${safeColor} flex items-center justify-center text-[10px] md:text-xs font-black shadow-[0_0_10px_currentColor] border-2 border-slate-900 transform transition-transform hover:scale-125 cursor-default relative z-10`} 
                title={t.name}
              >
                {t.name.substring(0,2)}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const myTeam = teams.find(t => t.id === teamId);

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-200 flex flex-col items-center p-4 md:p-8 font-sans relative overflow-hidden">
      <div className="w-full max-w-4xl flex justify-between items-center mb-6 bg-slate-900/80 backdrop-blur-md px-6 py-4 rounded-3xl shadow-[0_0_20px_rgba(8,145,178,0.2)] border border-cyan-800/50 z-10">
        <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
          ห้อง: {matchData?.pinCode}
        </h1>
        <div className="flex gap-4 items-center">
           {myTeam && (
             <div className="text-lg font-bold text-slate-300 bg-slate-800/80 px-4 py-2 rounded-xl shadow-inner border border-cyan-900/50">
               ทีม: <span className="text-cyan-400 font-black">{myTeam.name}</span>
               {myTeam?.score > 0 && <span className="ml-2 text-green-600 font-bold text-sm">อันดับที่ {myTeam.score} 🏆</span>}
             </div>
           )}
          <button 
            onClick={handleRollDice}
            disabled={rolling || !!activeQuestion || (myTeam?.score > 0) || isGameOver}
            className="px-6 py-4 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-xl hover:shadow-lg font-bold text-xl transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {rolling ? `🎲 ทอยได้ ${diceResult || '...'}` : (myTeam?.score > 0 ? 'เข้าเส้นชัยแล้ว' : '🎲 ทอยลูกเต๋า')}
          </button>
        </div>
      </div>
      
      {/* 6x6 Board Layout */}
      <div className="flex-1 flex items-center justify-center relative w-full mt-4">
        <div className="w-full max-w-4xl aspect-square grid grid-cols-6 grid-rows-6 gap-2 md:gap-3 bg-slate-900/40 backdrop-blur-xl p-3 md:p-4 rounded-[2rem] shadow-[0_0_30px_rgba(8,145,178,0.15)] border-4 border-cyan-900/30 z-10">
          {renderSpace(10)}
          {renderSpace(11)}
          {renderSpace(12)}
          {renderSpace(13)}
          {renderSpace(14)}
          {renderSpace(15)}

          {renderSpace(9)}
          <div className="col-span-4 row-span-4 bg-slate-950/70 backdrop-blur-md rounded-2xl flex items-center justify-center flex-col shadow-inner relative overflow-hidden border-2 border-cyan-900/50">
             {diceResult !== null ? (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 rounded-2xl z-20 backdrop-blur-md transition-all">
                 <div className="text-[8rem] md:text-[12rem] text-gray-900 leading-none mb-4 animate-bounce drop-shadow-2xl">
                   {['🎲', '⚀','⚁','⚂','⚃','⚄','⚅'][diceResult] || '🎲'}
                 </div>
                 <div className="text-3xl md:text-5xl font-black text-indigo-700 animate-pulse bg-gradient-to-r from-indigo-100 to-purple-100 px-10 py-4 rounded-full border-4 border-indigo-300 shadow-xl">
                   ได้ {diceResult} แต้ม!
                 </div>
               </div>
             ) : (
               <>
                 <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-blue-600 opacity-30 transform -rotate-12 tracking-widest drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">SPACE MISSION</h2>
                 <div className="mt-8 text-center z-10 bg-slate-900/80 p-6 rounded-2xl border border-cyan-800 shadow-[0_0_15px_rgba(8,145,178,0.2)] max-w-[80%] max-h-[60%] overflow-y-auto scrollbar-hide">
                    <p className="font-bold text-lg text-cyan-400 mb-4 border-b-2 border-cyan-900 pb-2 drop-shadow-sm">ทีมทั้งหมด ({teams.length}/12)</p>
                    <div className="flex flex-wrap gap-3 mt-2 justify-center">
                      {teams.map(t => {
                        const colorGrad = tokenColors[t.id % tokenColors.length];
                        return (
                          <div key={t.id} className="flex flex-col items-center">
                            <div className={`text-xs md:text-sm bg-gradient-to-br \${colorGrad} px-4 py-2 rounded-xl shadow-md border-2 border-white font-bold text-white`}>
                              {t.name}
                            </div>
                            {t.score > 0 && <span className="text-[10px] font-black text-white bg-green-500 px-2 py-0.5 rounded-full shadow-sm mt-1 -translate-y-2">ที่ {t.score} 🏆</span>}
                          </div>
                        )
                      })}
                    </div>
                 </div>
               </>
             )}
          </div>
          {renderSpace(16)}

          {renderSpace(8)}
          {renderSpace(17)}

          {renderSpace(7)}
          {renderSpace(18)}

          {renderSpace(6)}
          {renderSpace(19)}

          {renderSpace(5)}
          {renderSpace(4)}
          {renderSpace(3)}
          {renderSpace(2)}
          {renderSpace(1)}
          {renderSpace(0)}
        </div>

        {isGameOver && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm rounded-xl">
            <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-lg w-full transform animate-in zoom-in">
              <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 mb-6">
                🎉 จบเกม! 🎉
              </h2>
              <div className="space-y-4">
                {teams.filter(t => t.score > 0).sort((a,b) => a.score - b.score).map(t => (
                  <div key={t.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border">
                    <span className="text-xl font-bold text-gray-800">
                      {t.score === 1 ? '🥇 อันดับ 1' : t.score === 2 ? '🥈 อันดับ 2' : '🥉 อันดับ 3'}
                    </span>
                    <span className="text-2xl font-black text-indigo-600">{t.name}</span>
                  </div>
                ))}
              </div>
              <p className="mt-8 text-gray-500">รอแอดมินเริ่มเกมใหม่...</p>
            </div>
          </div>
        )}
      </div>

      {/* Question Modal */}
      {activeQuestion && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-slate-900/95 backdrop-blur-xl rounded-[2rem] p-8 max-w-2xl w-full shadow-[0_0_40px_rgba(8,145,178,0.3)] border-2 border-cyan-800 transform transition-all">
            <div className="flex justify-between items-center mb-6 border-b-2 border-indigo-100 pb-4">
              <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-900 px-5 py-1.5 rounded-full text-sm font-black shadow-[0_0_10px_rgba(34,211,238,0.5)] tracking-wide">
                หมวดหมู่: {activeQuestion.category}
              </span>
              <div className={`font-mono text-3xl font-black bg-slate-800 px-4 py-1 rounded-xl shadow-sm border-2 ${timeLeft <= 10 ? 'text-red-400 border-red-500 animate-pulse drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]' : 'text-cyan-400 border-cyan-700 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]'}`}>
                ⏱ {timeLeft}s
              </div>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-8 leading-relaxed text-center">
              {activeQuestion.questionText}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['A', 'B', 'C', 'D'].map(opt => {
                const text = activeQuestion[`option${opt}`];
                if (!text || text === 'null') return null;
                return (
                  <button 
                    key={opt}
                    onClick={() => handleAnswerSubmit(opt)}
                    className="p-5 border-2 border-slate-700 bg-slate-800 rounded-2xl text-left hover:border-cyan-400 hover:bg-slate-700 hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] font-bold text-slate-300 transition-all duration-200 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-indigo-500/0 group-hover:from-indigo-50/50 group-hover:to-indigo-100/50 transition-all"></div>
                    <span className="relative z-10"><span className="text-2xl font-black text-indigo-400 mr-3 bg-indigo-50 px-3 py-1 rounded-xl group-hover:bg-indigo-500 group-hover:text-white transition-colors">{opt}</span> <span className="text-lg">{text}</span></span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
