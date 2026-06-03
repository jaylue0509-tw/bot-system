import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight, BarChart3, Scissors, ShoppingBag, PenTool, MessageSquare, Bot, Star, Cat, PawPrint } from 'lucide-react';
import { GlassCard } from '@/src/lib/utils';
import { motion } from 'motion/react';
import { supabase } from '../supabase';

// Map icon strings from DB to Lucide component
const iconsMap: Record<string, any> = {
  BarChart3, Scissors, ShoppingBag, PenTool, MessageSquare, Bot
};

function getIconComponent(iconName: string) {
  return iconsMap[iconName] || Bot;
}

export default function Home() {
  const [bots, setBots] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [botsRes, catRes] = await Promise.all([
          supabase.from('ai_bots').select(`*, categories(name)`).order('click_count', { ascending: false }),
          supabase.from('categories').select('*').order('sort_order', { ascending: true })
        ]);
        
        if (botsRes.data) {
          // Map to attach category_name for UI compatibility
          const mappedBots = botsRes.data.map(bot => ({
            ...bot,
            category_name: bot.categories?.name
          }));
          setBots(mappedBots);
        }
        if (catRes.data) {
          setCategories(catRes.data);
        }
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleBotClick = async (botId: string, targetUrl: string, currentClicks: number) => {
    try {
      // Record click
      await supabase.from('ai_bots').update({ click_count: currentClicks + 1 }).eq('id', botId);
      await supabase.from('click_logs').insert([{ bot_id: botId }]);
    } catch (err) {
      console.error('Click logging failed', err);
    }
    // Redirect regardless of log success
    window.open(targetUrl, '_blank');
  };

  const filteredBots = useMemo(() => {
    let filtered = bots.filter(bot => {
      const matchesSearch = searchTerm === '' 
        || bot.name.toLowerCase().includes(searchTerm.toLowerCase())
        || bot.summary?.toLowerCase().includes(searchTerm.toLowerCase())
        || bot.creator?.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesCategory = activeCategory === 'top5' ? true : activeCategory ? bot.category_id === activeCategory : true;
      return matchesSearch && matchesCategory;
    });

    if (activeCategory === 'top5') {
      filtered = [...filtered].sort((a, b) => (b.click_count || 0) - (a.click_count || 0)).slice(0, 5);
    }
    return filtered;
  }, [bots, searchTerm, activeCategory]);

  const featuredBots = useMemo(() => bots.filter(b => b.is_featured), [bots]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-12 flex flex-col gap-10">
      
      {/* Header & Hero */}
      <header className="flex flex-col items-center justify-center text-center mt-8 mb-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          
          <div className="relative inline-block mt-4 mb-8 group">
            {/* Dark background resembling the cat hat silhouette */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[140%] bg-slate-800 rounded-[3rem] -z-10 group-hover:scale-105 transition-transform duration-300">
               {/* Cat ears on the background box */}
               <div className="absolute -top-6 left-10 w-16 h-16 bg-slate-800 rotate-45 rounded-xl"></div>
               <div className="absolute -top-6 right-10 w-16 h-16 bg-slate-800 rotate-45 rounded-xl"></div>
            </div>
            
            {/* Title Text */}
            <h1 
              className="text-5xl md:text-7xl tracking-widest relative z-30 font-black drop-shadow-[4px_4px_0px_#f59e0b] text-white"
              style={{
                fontFamily: "'ZCOOL KuaiLe', 'Comic Sans MS', cursive",
              }}
            >
              門市AI機器人入口
            </h1>
          </div>

          <p className="text-lg font-bold text-slate-800 max-w-2xl bg-white/90 px-6 py-2 rounded-full border-4 border-slate-800 shadow-[4px_4px_0px_#1e293b] mx-auto mt-6">
            提供各式 AI 小助手，涵蓋營運管理、美容服務等工作場景🐾
          </p>
        </motion.div>

        {/* Search */}
        <motion.div 
          className="w-full max-w-2xl mt-8 relative"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-slate-800 stroke-[3px]" />
          </div>
          <input
            type="text"
            className="w-full pl-14 pr-4 py-4 rounded-full bg-white border-4 border-slate-800 shadow-[6px_6px_0px_#1e293b] focus:outline-none focus:translate-y-1 focus:shadow-[2px_2px_0px_#1e293b] transition-all text-slate-800 placeholder-slate-400 font-bold text-lg"
            placeholder="搜尋 AI 機器人、用途、創作者..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </motion.div>
      </header>

      {/* Categories */}
      <section>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-6 py-3 rounded-full text-sm font-black tracking-widest transition-all border-4 border-slate-800 ${activeCategory === null ? 'bg-amber-400 text-slate-900 shadow-[4px_4px_0px_#1e293b] translate-y-0' : 'bg-white text-slate-600 hover:bg-slate-100 shadow-[4px_4px_0px_#1e293b] hover:-translate-y-0.5'}`}
          >
            全部機器喵
          </button>
          <button
            onClick={() => setActiveCategory('top5')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-black tracking-widest transition-all border-4 border-slate-800 ${activeCategory === 'top5' ? 'bg-amber-400 text-slate-900 shadow-[4px_4px_0px_#1e293b] translate-y-0' : 'bg-white text-slate-600 hover:bg-slate-100 shadow-[4px_4px_0px_#1e293b] hover:-translate-y-0.5'}`}
          >
            <Star className="w-5 h-5 fill-current" />
            Top 5 最受歡迎
          </button>
          {categories.map((cat) => {
            const Icon = getIconComponent(cat.icon);
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-black tracking-widest transition-all border-4 border-slate-800 ${isActive ? 'bg-amber-400 text-slate-900 shadow-[4px_4px_0px_#1e293b] translate-y-0' : 'bg-white text-slate-600 hover:bg-slate-100 shadow-[4px_4px_0px_#1e293b] hover:-translate-y-0.5'}`}
              >
                <Icon className="w-5 h-5 stroke-[3px]" />
                {cat.name}
              </button>
            )
          })}
        </div>
      </section>

      {/* Featured Bots */}
      {!searchTerm && !activeCategory && featuredBots.length > 0 && (
        <section className="mt-4">
          <div className="flex items-center gap-2 mb-6 px-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h2 className="text-xl font-bold text-slate-800">熱門推薦</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredBots.slice(0, 3).map((bot, index) => (
              <BotCard key={bot.id} bot={bot} onClick={() => handleBotClick(bot.id, bot.target_url, bot.click_count || 0)} delay={index * 0.1} />
            ))}
          </div>
        </section>
      )}

      {/* Main Bot Grid */}
      <section className="mb-20">
        <div className="flex items-center justify-between mb-8 px-2 bg-white border-4 border-slate-800 rounded-2xl py-3 px-6 shadow-[4px_4px_0px_#1e293b] max-w-max">
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <PawPrint className="w-6 h-6 text-amber-500" />
            {activeCategory === 'top5' ? 'Top 5 最受歡迎機器喵' : '所有機器喵'}
          </h2>
          <span className="text-sm font-bold text-white bg-slate-800 px-3 py-1 rounded-full ml-4">共 {filteredBots.length} 喵</span>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white border-4 border-slate-800 rounded-3xl p-6 shadow-[6px_6px_0px_#1e293b] animate-pulse h-64 flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 bg-slate-200 rounded-2xl mb-6 border-2 border-slate-300"></div>
                  <div className="h-6 bg-slate-200 rounded-md w-3/4 mb-3"></div>
                  <div className="h-4 bg-slate-200 rounded-md w-full mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded-md w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredBots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBots.map((bot, index) => (
              <BotCard key={bot.id} bot={bot} onClick={() => handleBotClick(bot.id, bot.target_url, bot.click_count || 0)} delay={index * 0.05} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border-4 border-slate-800 shadow-[8px_8px_0px_#1e293b]">
            <Cat className="w-16 h-16 text-slate-400 mx-auto mb-4 stroke-[3px]" />
            <p className="text-xl font-black text-slate-600">找不到符合條件的機器喵</p>
          </div>
        )}
      </section>

      <footer className="text-center pb-8 pt-12 flex justify-center text-sm font-bold text-slate-800">
        <div className="flex justify-center items-center gap-4 bg-white border-4 border-slate-800 rounded-full px-8 py-3 shadow-[4px_4px_0px_#1e293b]">
           <span>門市 AI 機器人導覽平台</span>
           <span className="text-slate-300">|</span>
           <Link to="/admin/login" className="text-indigo-600 hover:text-amber-500 transition-colors">管理員登入</Link>
        </div>
      </footer>
    </div>
  );
}

const BotCard: React.FC<{ bot: any, onClick: () => void | Promise<void>, delay?: number }> = ({ bot, onClick, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="h-full"
    >
      <div className="bg-white h-full flex flex-col justify-between cursor-pointer relative overflow-hidden group p-6 rounded-[2rem] border-4 border-slate-800 shadow-[6px_6px_0px_#1e293b] hover:-translate-y-2 hover:shadow-[12px_12px_0px_#1e293b] transition-all" onClick={onClick}>
        {/* 背景裝飾貓掌印 */}
        <PawPrint className="absolute -bottom-4 -right-4 w-32 h-32 text-slate-100 -rotate-12 transition-transform group-hover:scale-110 group-hover:rotate-0 group-hover:text-amber-100" />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="w-16 h-16 bg-slate-800 rounded-[1.25rem] flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:rotate-6 transition-transform shrink-0 relative border-4 border-slate-800">
               <Cat className="w-10 h-10 stroke-[2.5px]" />
               {/* 貓耳朵裝飾 (純CSS) */}
               <div className="absolute -top-2 left-2 w-4 h-4 bg-slate-800 rotate-45 rounded-sm -z-10"></div>
               <div className="absolute -top-2 right-2 w-4 h-4 bg-slate-800 rotate-45 rounded-sm -z-10"></div>
            </div>
            <div className="flex flex-wrap gap-2 text-right">
               <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-black uppercase tracking-widest border-2 border-slate-200 group-hover:border-amber-300 group-hover:bg-amber-100 group-hover:text-amber-700 transition-colors">{bot.category_name || '未分類'}</span>
            </div>
          </div>
          
          <h3 className="text-2xl font-black text-slate-800 mb-3 group-hover:text-amber-600 transition-colors tracking-wide">
            {bot.name}
          </h3>
          
          <p className="text-slate-600 font-bold leading-relaxed text-sm">
            {bot.summary}
          </p>
          
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="px-3 py-1.5 bg-sky-100 text-sky-700 rounded-full text-[10px] font-black uppercase tracking-widest border-2 border-sky-200">平台: {bot.ai_platform}</span>
            <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border-2 border-emerald-200">創作者: {bot.creator}</span>
          </div>
          {bot.target_url && (
            <div className="mt-5 break-all">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">使用網址</span>
              <a 
                href={bot.target_url} 
                target="_blank" 
                rel="noreferrer" 
                className="text-xs font-bold text-blue-500 hover:text-amber-500 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {bot.target_url}
              </a>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-8 relative z-10 pt-4 border-t-4 border-dashed border-slate-200">
          <div className="flex flex-col">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">總搭乘次數</span>
             <span className="text-3xl font-black text-slate-800">{bot.click_count || 0}</span>
          </div>
          <button className="w-14 h-14 bg-amber-400 rounded-full flex items-center justify-center text-slate-900 border-4 border-slate-800 shadow-[2px_2px_0px_#1e293b] group-hover:bg-amber-300 group-hover:scale-110 transition-transform">
            <ChevronRight className="w-8 h-8 stroke-[3px]" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
