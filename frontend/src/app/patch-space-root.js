const fs = require('fs');
let code = fs.readFileSync('/Users/pongsaklaocharoensuk/Monopoly/frontend/src/app/page.tsx', 'utf8');

code = code.replace(/className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center p-4 font-sans relative overflow-hidden"/,
'className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-200 flex items-center justify-center p-4 font-sans relative overflow-hidden"');

code = code.replace(/className="absolute top-\[-10%\] left-\[-10%\] w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"/,
'className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-cyan-900 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-pulse"');

code = code.replace(/className="absolute top-\[20%\] right-\[-10%\] w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"/,
'className="absolute top-[20%] right-[-10%] w-96 h-96 bg-blue-900 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-pulse animation-delay-2000"');

code = code.replace(/className="absolute bottom-\[-20%\] left-\[20%\] w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"/,
'className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-purple-900 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-pulse animation-delay-4000"');

code = code.replace(/className="bg-white\/70 backdrop-blur-xl p-8 md:p-10 rounded-\[3rem\] shadow-\[0_20px_50px_rgba\(0,0,0,0\.1\)\] w-full max-w-md text-center border-4 border-white\/60 relative z-10"/,
'className="bg-slate-900/80 backdrop-blur-xl p-8 md:p-10 rounded-[3rem] shadow-[0_0_40px_rgba(8,145,178,0.2)] w-full max-w-md text-center border-2 border-cyan-900/50 relative z-10"');

code = code.replace(/className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500 mb-2 drop-shadow-sm tracking-tight"/,
'className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] tracking-tight"');

code = code.replace(/className="text-indigo-900\/60 font-bold mb-8"/,
'className="text-cyan-600/80 font-bold mb-8"');

code = code.replace(/className="block text-sm font-black text-indigo-900 mb-2 flex items-center gap-2"/g,
'className="block text-sm font-black text-cyan-400 mb-2 flex items-center gap-2 drop-shadow-sm"');

code = code.replace(/className="text-indigo-500"/, 'className="text-cyan-400"');
code = code.replace(/className="text-pink-500"/, 'className="text-blue-400"');

code = code.replace(/className="w-full bg-white\/80 border-2 border-indigo-100 rounded-2xl p-4 text-center text-3xl tracking-\[0\.3em\] font-mono font-black text-indigo-700 focus:border-indigo-500 focus:bg-white shadow-sm outline-none transition uppercase placeholder-indigo-200"/,
'className="w-full bg-slate-950/80 border-2 border-slate-700 rounded-2xl p-4 text-center text-3xl tracking-[0.3em] font-mono font-black text-cyan-400 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.3)] shadow-inner outline-none transition uppercase placeholder-slate-700"');

code = code.replace(/className="w-full bg-white\/80 border-2 border-indigo-100 rounded-2xl p-4 text-lg font-bold text-gray-800 focus:border-pink-500 focus:bg-white shadow-sm outline-none transition placeholder-gray-400"/,
'className="w-full bg-slate-950/80 border-2 border-slate-700 rounded-2xl p-4 text-lg font-bold text-slate-200 focus:border-blue-400 focus:shadow-[0_0_15px_rgba(96,165,250,0.3)] shadow-inner outline-none transition placeholder-slate-600"');

code = code.replace(/className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-black py-4 rounded-2xl shadow-\[0_10px_20px_rgba\(99,102,241,0\.3\)\] transform hover:-translate-y-1 transition-all active:scale-95 text-xl mt-6 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none border-2 border-white\/20"/,
'className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-slate-950 font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.4)] transform hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] transition-all active:scale-95 text-xl mt-6 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-cyan-400"');

fs.writeFileSync('/Users/pongsaklaocharoensuk/Monopoly/frontend/src/app/page.tsx', code);
