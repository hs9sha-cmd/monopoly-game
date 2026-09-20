'use client';
import { useState, useEffect } from 'react';
import { Upload, Play, Settings, Users, BookOpen } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AdminDashboard() {
  const [games, setGames] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [gameName, setGameName] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchGames();
    fetchMatches();
  }, []);

  const fetchGames = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/games`);
      const data = await res.json();
      setGames(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMatches = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/matches`);
      const data = await res.json();
      setMatches(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !gameName) return alert('กรุณากรอกชื่อเกมและเลือกไฟล์ Excel');

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('gameName', gameName);

    try {
      const res = await fetch(`${API_URL}/api/admin/upload-game`, {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();
      if (result.success) {
        alert('อัปโหลดสำเร็จ! นำเข้า ' + result.questionsCount + ' ข้อ');
        setGameName('');
        setFile(null);
        fetchGames();
      } else {
        alert('Error: ' + result.error);
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const createMatch = async (gameId: number) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/matches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId })
      });
      const data = await res.json();
      alert('สร้างห้องสำเร็จ! PIN: ' + data.pinCode);
      fetchMatches();
    } catch (e) {
      alert('Create match failed');
    }
  };

  const deleteMatch = async (matchId: number) => {
    if (!confirm('ยืนยันที่จะลบห้องการแข่งขันนี้ถาวรหรือไม่?')) return;
    try {
      await fetch(`${API_URL}/api/admin/matches/${matchId}`, {
        method: `DELETE'
      });
      alert('ลบห้องการแข่งขันเรียบร้อย');
      fetchMatches();
    } catch (e) {
      alert('ลบห้องไม่สำเร็จ');
    }
  };

  const resetMatch = async (matchId: number) => {
    if (!confirm('ยืนยันที่จะรีเซ็ตเกมนี้ (เริ่มใหม่ทั้งหมด) หรือไม่?')) return;
    try {
      await fetch(`${API_URL}/api/admin/matches/${matchId}/reset`, {
        method: `POST'
      });
      alert('รีเซ็ตห้องแข่งขันเรียบร้อยแล้ว ทุกทีมกลับไปที่จุดเริ่มต้น!');
      fetchMatches();
    } catch (e) {
      alert('รีเซ็ตไม่สำเร็จ');
    }
  };

  const deleteGame = async (gameId: number) => {
    if (!confirm('ยืนยันที่จะลบชุดเกมนี้ถาวรหรือไม่?')) return;
    try {
      await fetch(`${API_URL}/api/admin/games/${gameId}`, {
        method: `DELETE'
      });
      alert('ลบชุดเกมเรียบร้อย');
      fetchGames();
    } catch (e) {
      alert('ลบชุดเกมไม่สำเร็จ');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard - PhysicsGame With Kru-Ya</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-600">
              <Upload size={24} /> นำเข้าข้อมูลเกม (Excel)
            </h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อเกม (เช่น เกมเศรษฐี-ของไหล)</label>
                <input 
                  type="text" 
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" 
                  placeholder="พิมพ์ชื่อเกม..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ไฟล์โจทย์ (Excel .xlsx)</label>
                <input 
                  type="file" 
                  accept=".xlsx"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-gray-900 bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" 
                />
              </div>
              <button 
                type="submit" 
                disabled={uploading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition disabled:bg-gray-400"
              >
                {uploading ? 'กำลังนำเข้า...' : 'อัปโหลดสร้างเกม'}
              </button>
            </form>
          </section>

          {/* Games List */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-600">
              <BookOpen size={24} /> รายการชุดเกมที่มี
            </h2>
            {games.length === 0 ? (
              <p className="text-gray-500 text-center py-8">ยังไม่มีข้อมูลเกม กรุณาอัปโหลด Excel</p>
            ) : (
              <ul className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {games.map(game => (
                  <li key={game.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <h3 className="font-bold text-gray-800">{game.name}</h3>
                      <p className="text-sm text-gray-500">จำนวน {game._count?.questions || 0} ข้อ</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button 
                        onClick={() => createMatch(game.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition"
                      >
                        <Play size={16} /> สร้างห้องเล่น
                      </button>
                      <button 
                        onClick={() => deleteGame(game.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm transition font-medium"
                      >
                        ลบ
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Active Matches */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-orange-600">
            <Users size={24} /> ห้องที่กำลังเปิดให้เล่น
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="p-3 rounded-tl-lg font-semibold">PIN</th>
                  <th className="p-3 font-semibold">ชื่อเกม</th>
                  <th className="p-3 font-semibold">สถานะ</th>
                  <th className="p-3 font-semibold">จำนวนทีม</th>
                  <th className="p-3 rounded-tr-lg font-semibold">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {matches.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      ยังไม่มีห้องแข่งขันที่เปิดอยู่
                    </td>
                  </tr>
                ) : (
                  matches.map(match => (
                    <tr key={match.id} className="hover:bg-gray-50 transition">
                      <td className="p-3 font-mono font-bold text-lg text-indigo-600">{match.pinCode}</td>
                      <td className="p-3 text-gray-900">{match.game?.name || 'Unknown Game'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${match.status === 'playing' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {match.status === 'playing' ? 'กำลังเล่น' : 'จบเกมแล้ว'}
                        </span>
                      </td>
                      <td className="p-3 text-gray-900">{match.teams?.length || 0}/4 ทีม</td>
                      <td className="p-3 flex gap-2">
                        <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium bg-indigo-50 px-3 py-1 rounded-md">
                          ดูกระดาน
                        </button>
                        <button 
                          onClick={() => resetMatch(match.id)}
                          className="text-orange-600 hover:text-orange-800 text-sm font-medium bg-orange-50 px-3 py-1 rounded-md"
                        >
                          🔄 รีเกม
                        </button>
                        <button 
                          onClick={() => deleteMatch(match.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium bg-red-50 px-3 py-1 rounded-md"
                        >
                          🗑️ ลบห้อง
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
