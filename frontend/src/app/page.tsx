'use client';
import { useState } from 'react';
import { Play, Users, Hash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function Home() {
  const [pinCode, setPinCode] = useState('');
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinCode || !teamName) {
      return Swal.fire({
        background: '#0f172a',
        color: '#e2e8f0',
        title: 'ข้อมูลไม่ครบถ้วน',
        text: 'กรุณากรอกรหัส PIN และชื่อทีมให้ครบถ้วน',
        icon: 'warning',
        confirmButtonColor: '#6366f1'
      });
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/player/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinCode, teamName })
      });
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem('teamId', data.teamId);
        localStorage.setItem('matchId', data.matchId);
        router.push(`/board/${data.matchId}`);
      } else {
        Swal.fire({title: 'เข้าห้องไม่ได้', text: data.error || 'กรุณาตรวจสอบ PIN', icon: 'error', background: '#0f172a', color: '#e2e8f0'});
      }
    } catch (e) {
      Swal.fire({title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', icon: 'error', background: '#0f172a', color: '#e2e8f0'});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-200 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-cyan-900 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-pulse"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-blue-900 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-pulse animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-purple-900 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-pulse animation-delay-4000"></div>

      <div className="bg-slate-900/80 backdrop-blur-xl p-8 md:p-10 rounded-[3rem] shadow-[0_0_40px_rgba(8,145,178,0.2)] w-full max-w-md text-center border-2 border-cyan-900/50 relative z-10">
        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl transform rotate-12 hover:rotate-0 transition-transform duration-300">
          <Play size={48} className="text-white ml-2 drop-shadow-md" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] tracking-tight">Physics Monopoly</h1>
        <p className="text-cyan-600/80 font-bold mb-8">ตะลุยกระดานฟิสิกส์สุดมันส์!</p>
        
        <form onSubmit={handleJoin} className="space-y-6 text-left">
          <div>
            <label className="block text-sm font-black text-cyan-400 mb-2 flex items-center gap-2 drop-shadow-sm">
              <Hash size={18} className="text-cyan-400"/> รหัสเข้าห้อง (PIN)
            </label>
            <input 
              type="text" 
              maxLength={6}
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              className="w-full bg-slate-950/80 border-2 border-slate-700 rounded-2xl p-4 text-center text-3xl tracking-[0.3em] font-mono font-black text-cyan-400 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.3)] shadow-inner outline-none transition uppercase placeholder-slate-700" 
              placeholder="000000"
            />
          </div>
          <div>
            <label className="block text-sm font-black text-cyan-400 mb-2 flex items-center gap-2 drop-shadow-sm">
              <Users size={18} className="text-blue-400"/> ชื่อทีมของคุณ
            </label>
            <input 
              type="text" 
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full bg-slate-950/80 border-2 border-slate-700 rounded-2xl p-4 text-lg font-bold text-slate-200 focus:border-blue-400 focus:shadow-[0_0_15px_rgba(96,165,250,0.3)] shadow-inner outline-none transition placeholder-slate-600" 
              placeholder="เช่น กลุ่ม 1 ไอน์สไตน์"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-slate-950 font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.4)] transform hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] transition-all active:scale-95 text-xl mt-6 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-cyan-400"
          >
            {loading ? 'กำลังโหลด...' : '🚀 เข้าสู่เกม!'}
          </button>
        </form>
      </div>
    </div>
  );
}
