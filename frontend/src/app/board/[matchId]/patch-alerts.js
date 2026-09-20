const fs = require('fs');
let code = fs.readFileSync('/Users/pongsaklaocharoensuk/Monopoly/frontend/src/app/board/[matchId]/page.tsx', 'utf8');

if (!code.includes("import Swal from 'sweetalert2'")) {
  code = code.replace("import confetti from 'canvas-confetti';", "import confetti from 'canvas-confetti';\nimport Swal from 'sweetalert2';");
}

code = code.replace(/alert\('ไม่พบข้อมูลทีม กรุณาเข้าร่วมใหม่'\);/, "Swal.fire('ข้อผิดพลาด', 'ไม่พบข้อมูลทีม กรุณาเข้าร่วมใหม่', 'error');");

code = code.replace(/alert\(`🎉 ทีม \$\{teamName\} เข้าเส้นชัย! ได้อันดับที่ \$\{place\} 🎉`\);/, "Swal.fire({ title: 'เข้าเส้นชัย!', text: `🎉 ทีม ${teamName} ได้อันดับที่ ${place} 🎉`, icon: 'success' });");

code = code.replace(/alert\(`🎉 ยินดีด้วย! เข้าเส้นชัยด้วยการ์ดดวงดี! ได้อันดับที่ \$\{place\} 🎉`\);/, "Swal.fire({ title: 'เข้าเส้นชัย!', text: `🎉 ยินดีด้วย! เข้าเส้นชัยด้วยการ์ดดวงดี! ได้อันดับที่ ${place} 🎉`, icon: 'success' });");

code = code.replace(/alert\('รีเซ็ตเกมแล้ว! ทุกทีมจะกลับไปจุดเริ่มต้น'\);/, "Swal.fire('รีเซ็ตเกม!', 'ทุกทีมจะกลับไปจุดเริ่มต้น', 'info');");

code = code.replace(/alert\('แอดมินได้ทำการปิดห้องการแข่งขันนี้แล้ว!'\);/, "Swal.fire('ห้องถูกปิด', 'แอดมินได้ทำการปิดห้องการแข่งขันนี้แล้ว!', 'warning');");

code = code.replace(/alert\(`เหตุการณ์พิเศษ: \$\{q\.questionText\}`\);\s*socketRef\.current\?\.emit\('answer_question', \{ matchId, teamId: teamIdRef\.current, isCorrect: false, penaltySpaces: -q\.penaltySpaces \}\);\s*return;/s, `Swal.fire({
        title: 'เหตุการณ์พิเศษ! 🌟',
        text: q.questionText,
        icon: 'info',
        confirmButtonText: 'รับทราบ',
        confirmButtonColor: '#6366f1'
      }).then(() => {
        socketRef.current?.emit('answer_question', { matchId, teamId: teamIdRef.current, isCorrect: false, penaltySpaces: -q.penaltySpaces });
      });
      return;`);

code = code.replace(/const handleAnswerSubmit = \(selectedOption: string\) => \{([^]*?)setActiveQuestion\(null\);\n  \};/s, `const handleAnswerSubmit = (selectedOption: string) => {
    if (!activeQuestion) return;

    const isCorrect = selectedOption === activeQuestion.correctAnswer;
    
    if (isCorrect) {
      Swal.fire({
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
        title: '❌ ตอบผิด!',
        text: \`โดนลงโทษถอยหลัง \${Math.abs(activeQuestion.penaltySpaces)} ช่อง\`,
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
  };`);

code = code.replace(/const handleAnswerTimeOut = \(\) => \{[^]*?setActiveQuestion\(null\);\n  \};/s, `const handleAnswerTimeOut = () => {
    Swal.fire({
      title: '⏳ หมดเวลา!',
      text: \`โดนลงโทษถอยหลัง \${Math.abs(activeQuestion.penaltySpaces)} ช่อง\`,
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
  };`);

fs.writeFileSync('/Users/pongsaklaocharoensuk/Monopoly/frontend/src/app/board/[matchId]/page.tsx', code);
