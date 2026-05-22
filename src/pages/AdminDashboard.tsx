import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GlassCard } from '@/src/lib/utils';
import { Download, Users, MousePointerClick, TrendingUp, ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check auth
    if (!localStorage.getItem('adminToken')) {
      navigate('/admin/login');
      return;
    }

    async function fetchDashboard() {
      try {
        const res = await fetch('/api/admin/dashboard');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to parse dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const handleDownload = () => {
    window.open('/api/admin/reports/clicks.xlsx', '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-white/50 rounded-full transition-colors text-slate-500">
             <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold text-slate-800">管理儀表板</h1>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 bg-white/60 hover:bg-white/80 px-5 py-3 rounded-2xl border border-white/60 backdrop-blur-xl transition-all shadow-sm"
        >
          <span className="text-sm font-bold text-slate-700">下載使用報告 (.xlsx)</span>
          <Download className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                <MousePointerClick className="w-8 h-8" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">總點擊數</span>
                <span className="text-2xl font-mono font-bold text-slate-700">{data?.kpi?.totalClicks || 0}</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">今日點擊數</span>
                <span className="text-2xl font-mono font-bold text-slate-700">{data?.kpi?.todayClicks || 0}</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <GlassCard className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-100">
                <Users className="w-8 h-8" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">活躍創作者數</span>
                <span className="text-2xl font-mono font-bold text-slate-700">{data?.creatorRank?.length || 0}</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
          <GlassCard>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">最熱門 AI 機器人 (Top 5)</h2>
            <div className="space-y-4">
              {data?.botsRank?.map((bot: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-white/30 rounded-2xl border border-white/50 hover:bg-white/60 transition-all shadow-sm">
                  <div className="flex items-center gap-4">
                    <span className={`flex items-center justify-center w-10 h-10 rounded-xl font-bold text-sm shadow-md ${idx === 0 ? 'bg-indigo-500 text-white shadow-indigo-200' : idx === 1 ? 'bg-emerald-500 text-white shadow-emerald-200' : idx === 2 ? 'bg-amber-500 text-white shadow-amber-200' : 'bg-slate-200 text-slate-600'}`}>
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-700 text-lg">{bot.name}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">總點擊數</span>
                    <span className="text-lg font-mono font-bold text-indigo-600">{bot.click_count}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
          <GlassCard>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">人氣創作者 (Top 5)</h2>
            <div className="space-y-4">
              {data?.creatorRank?.map((creator: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-white/30 rounded-2xl border border-white/50 hover:bg-white/60 transition-all shadow-sm">
                  <div className="flex items-center gap-4">
                    <span className={`flex items-center justify-center w-10 h-10 rounded-xl font-bold text-sm shadow-md ${idx === 0 ? 'bg-indigo-500 text-white shadow-indigo-200' : idx === 1 ? 'bg-emerald-500 text-white shadow-emerald-200' : idx === 2 ? 'bg-amber-500 text-white shadow-amber-200' : 'bg-slate-200 text-slate-600'}`}>
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-700 text-lg">{creator.creator}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">累積次數</span>
                    <span className="text-lg font-mono font-bold text-indigo-600">{creator.total_clicks}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
