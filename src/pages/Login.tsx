import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '@/src/lib/utils';
import { Lock, User } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Dummy login
    if (username === 'admin' && password === 'admin') {
      localStorage.setItem('adminToken', 'dummy-token');
      navigate('/admin/dashboard');
    } else {
      alert('帳號或密碼錯誤 (請輸入 admin / admin)');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <GlassCard className="w-[400px] p-8 max-w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-indigo-500 rounded-3xl mx-auto mb-6 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Lock className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">管理員登入</h1>
            <p className="text-sm text-slate-500 mt-2">門市 AI 機器人成效追蹤平台</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">帳號</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/60 bg-white/40 backdrop-blur-md shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white/80 transition-all text-slate-700"
                  placeholder="admin"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">密碼</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/60 bg-white/40 backdrop-blur-md shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white/80 transition-all text-slate-700"
                  placeholder="admin"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] mt-6"
            >
              登入
            </button>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
}
