const fs = require('fs');
let code = fs.readFileSync('/Users/pongsaklaocharoensuk/Monopoly/frontend/src/app/board/[matchId]/page.tsx', 'utf8');

// Replace Token Colors
code = code.replace(/const tokenColors = \[[^\]]*\];/, `const tokenColors = [
    'bg-cyan-400 text-slate-900', 'bg-pink-500 text-white', 
    'bg-yellow-400 text-slate-900', 'bg-emerald-400 text-slate-900', 
    'bg-purple-500 text-white', 'bg-orange-500 text-white', 
    'bg-rose-400 text-slate-900', 'bg-lime-400 text-slate-900',
    'bg-blue-500 text-white', 'bg-red-500 text-white', 
    'bg-fuchsia-400 text-slate-900', 'bg-amber-400 text-slate-900'
  ];`);

// Replace renderSpace interior
code = code.replace(/let bgClass = "bg-purple-100";[^]*?return \(/, `let bgClass = "bg-slate-900";
    let textClass = "text-slate-500 font-bold";
    let borderClass = "border-2 border-cyan-900 hover:border-cyan-500 shadow-[0_0_10px_rgba(8,145,178,0.1)] hover:shadow-[0_0_15px_rgba(34,211,238,0.4)]";
    
    if (index === 0) {
      bgClass = "bg-slate-900";
      textClass = "text-yellow-400 font-black drop-shadow-md";
      borderClass = "border-2 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6)] z-10";
    } else if (index % 5 === 0) {
      bgClass = "bg-slate-800";
      borderClass = "border-2 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]";
      textClass = "text-purple-400 font-bold";
    }

    return (`);

// Replace tokens rendering
code = code.replace(/className={\`w-7 h-7 md:w-8 md:h-8 rounded-full \\\$\{safeColor\} text-white flex items-center justify-center text-\[10px\] md:text-xs font-black shadow-lg border-2 border-white transform transition-transform hover:scale-125 cursor-default relative z-10\`}/, 
"className={`w-7 h-7 md:w-8 md:h-8 rounded-full ${safeColor} flex items-center justify-center text-[10px] md:text-xs font-black shadow-[0_0_10px_currentColor] border-2 border-slate-900 transform transition-transform hover:scale-125 cursor-default relative z-10`}");


// Main wrapper
code = code.replace(/className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex flex-col items-center p-4 md:p-8 font-sans"/,
'className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-200 flex flex-col items-center p-4 md:p-8 font-sans relative overflow-hidden"');

// Header
code = code.replace(/className="w-full max-w-4xl flex justify-between items-center mb-6 bg-white\/60 backdrop-blur-md px-6 py-4 rounded-3xl shadow-sm border border-white"/,
'className="w-full max-w-4xl flex justify-between items-center mb-6 bg-slate-900/80 backdrop-blur-md px-6 py-4 rounded-3xl shadow-[0_0_20px_rgba(8,145,178,0.2)] border border-cyan-800/50 z-10"');

// Header text
code = code.replace(/className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 drop-shadow-sm"/,
'className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"');

// Header myTeam box
code = code.replace(/className="text-lg font-bold text-gray-700 bg-white\/80 px-4 py-2 rounded-xl shadow-sm border border-indigo-100"/,
'className="text-lg font-bold text-slate-300 bg-slate-800/80 px-4 py-2 rounded-xl shadow-inner border border-cyan-900/50"');

code = code.replace(/<span className="text-indigo-600">\{myTeam\.name\}<\/span>/,
'<span className="text-cyan-400 font-black">{myTeam.name}</span>');

// Board Container
code = code.replace(/className="w-full max-w-4xl aspect-square grid grid-cols-6 grid-rows-6 gap-2 md:gap-3 bg-white\/40 backdrop-blur-xl p-3 md:p-4 rounded-\[2rem\] shadow-2xl border-4 border-white\/60"/,
'className="w-full max-w-4xl aspect-square grid grid-cols-6 grid-rows-6 gap-2 md:gap-3 bg-slate-900/40 backdrop-blur-xl p-3 md:p-4 rounded-[2rem] shadow-[0_0_30px_rgba(8,145,178,0.15)] border-4 border-cyan-900/30 z-10"');

// Center box
code = code.replace(/className="col-span-4 row-span-4 bg-white\/70 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-col shadow-inner relative overflow-hidden border-2 border-white\/50"/,
'className="col-span-4 row-span-4 bg-slate-950/70 backdrop-blur-md rounded-2xl flex items-center justify-center flex-col shadow-inner relative overflow-hidden border-2 border-cyan-900/50"');

// Board Game text
code = code.replace(/className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-300 to-pink-300 opacity-40 transform -rotate-12 tracking-widest drop-shadow-sm">BOARD GAME<\/h2>/,
'className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-blue-600 opacity-30 transform -rotate-12 tracking-widest drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">SPACE MISSION</h2>');

// Teams box
code = code.replace(/className="mt-8 text-center opacity-80 z-10 bg-white\/60 p-6 rounded-2xl border border-white\/50 shadow-sm max-w-\[80%\] max-h-\[60%\] overflow-y-auto scrollbar-hide"/,
'className="mt-8 text-center z-10 bg-slate-900/80 p-6 rounded-2xl border border-cyan-800 shadow-[0_0_15px_rgba(8,145,178,0.2)] max-w-[80%] max-h-[60%] overflow-y-auto scrollbar-hide"');

code = code.replace(/className="font-bold text-lg text-indigo-800 mb-4 border-b-2 border-indigo-100 pb-2"/,
'className="font-bold text-lg text-cyan-400 mb-4 border-b-2 border-cyan-900 pb-2 drop-shadow-sm"');

// Question Modal
code = code.replace(/className="fixed inset-0 bg-indigo-900\/40 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300"/,
'className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300"');

code = code.replace(/className="bg-white\/90 backdrop-blur-xl rounded-\[2rem\] p-8 max-w-2xl w-full shadow-\[0_20px_50px_rgba\(0,0,0,0\.3\)\] border border-white\/50 transform transition-all"/,
'className="bg-slate-900/95 backdrop-blur-xl rounded-[2rem] p-8 max-w-2xl w-full shadow-[0_0_40px_rgba(8,145,178,0.3)] border-2 border-cyan-800 transform transition-all"');

code = code.replace(/className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-5 py-1\.5 rounded-full text-sm font-black shadow-sm tracking-wide"/,
'className="bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-900 px-5 py-1.5 rounded-full text-sm font-black shadow-[0_0_10px_rgba(34,211,238,0.5)] tracking-wide"');

code = code.replace(/className=\{\`font-mono text-3xl font-black bg-white px-4 py-1 rounded-xl shadow-sm border-2 \$\{timeLeft <= 10 \? 'text-red-500 border-red-200 animate-pulse' : 'text-indigo-600 border-indigo-100'\}\`\}/,
'className={`font-mono text-3xl font-black bg-slate-800 px-4 py-1 rounded-xl shadow-sm border-2 ${timeLeft <= 10 ? \'text-red-400 border-red-500 animate-pulse drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]\' : \'text-cyan-400 border-cyan-700 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]\'}`}');

code = code.replace(/className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 leading-relaxed text-center"/,
'className="text-2xl md:text-3xl font-bold text-slate-100 mb-8 leading-relaxed text-center"');

code = code.replace(/className="p-5 border-\[3px\] border-indigo-100 bg-white rounded-2xl text-left hover:border-indigo-400 hover:bg-indigo-50 hover:-translate-y-1 hover:shadow-lg font-bold text-gray-700 transition-all duration-200 group relative overflow-hidden"/g,
'className="p-5 border-2 border-slate-700 bg-slate-800 rounded-2xl text-left hover:border-cyan-400 hover:bg-slate-700 hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] font-bold text-slate-300 transition-all duration-200 group relative overflow-hidden"');

fs.writeFileSync('/Users/pongsaklaocharoensuk/Monopoly/frontend/src/app/board/[matchId]/page.tsx', code);
