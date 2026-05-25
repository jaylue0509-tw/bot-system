import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight, BarChart3, Scissors, ShoppingBag, PenTool, MessageSquare, Bot, Star } from 'lucide-react';
import { GlassCard } from '@/src/lib/utils';
import { motion } from 'motion/react';

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
          fetch('/api/bots'),
          fetch('/api/categories')
        ]);
        const botsData = await botsRes.json();
        const catData = await catRes.json();
        setBots(botsData);
        setCategories(catData);
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleBotClick = async (botId: string, targetUrl: string) => {
    try {
      // Record click
      await fetch(`/api/bots/${botId}/click`, { method: 'POST' });
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
      <header className="flex flex-col items-center justify-center text-center mt-8 mb-6 relative">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="relative inline-block mb-4 mt-4 px-12 py-8 bg-slate-900 rounded-3xl overflow-hidden border-2 border-[#14b8a6] shadow-[0_0_20px_rgba(20,184,166,0.3)] skew-x-[-2deg]">
            {/* 背景幾何裝飾 */}
            <div className="absolute top-0 left-0 w-16 h-4 bg-[#14b8a6]"></div>
            <div className="absolute bottom-0 right-0 w-24 h-2 bg-[#14b8a6]"></div>
            <div className="absolute top-4 right-4 w-4 h-4 rounded-full border-2 border-[#14b8a6]"></div>
            
            <h1 
              className="text-5xl md:text-7xl font-black tracking-widest relative z-10 uppercase"
              style={{
                fontFamily: "'Black Han Sans', sans-serif",
                color: "#ffffff",
                letterSpacing: "0.1em",
                textShadow: `
                  1px 1px 0 #14b8a6,
                  2px 2px 0 #14b8a6,
                  3px 3px 0 #14b8a6,
                  4px 4px 0 #14b8a6,
                  5px 5px 0 #14b8a6,
                  6px 6px 0 #14b8a6,
                  7px 7px 0 #14b8a6,
                  8px 8px 0 #14b8a6,
                  9px 9px 0 #14b8a6,
                  10px 10px 0 #14b8a6
                `
              }}
            >
              門市AI機器人入口
            </h1>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mt-4 font-bold">
            提供各式 AI 小助手，涵蓋營運管理、美容服務、銷售技巧等工作場景。
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
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="w-full pl-12 pr-4 py-4 rounded-full bg-white/40 backdrop-blur-xl border border-white/60 shadow-xl shadow-blue-900/5 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white/80 transition-all text-slate-700 placeholder-slate-400 tracking-wide"
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
            className={`px-5 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all ${activeCategory === null ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200' : 'bg-white/50 hover:bg-white/80 text-slate-600 border border-white/60 backdrop-blur-md'}`}
          >
            全部機器人
          </button>
          <button
            onClick={() => setActiveCategory('top5')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all ${activeCategory === 'top5' ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200' : 'bg-white/50 hover:bg-white/80 text-slate-600 border border-white/60 backdrop-blur-md'}`}
          >
            <Star className="w-4 h-4" />
            Top 5 最受歡迎
          </button>
          {categories.map((cat) => {
            const Icon = getIconComponent(cat.icon);
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all ${isActive ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200' : 'bg-white/50 hover:bg-white/80 text-slate-600 border border-white/60 backdrop-blur-md'}`}
              >
                <Icon className="w-4 h-4" />
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
              <BotCard key={bot.id} bot={bot} onClick={() => handleBotClick(bot.id, bot.target_url)} delay={index * 0.1} />
            ))}
          </div>
        </section>
      )}

      {/* Main Bot Grid */}
      <section className="mb-20">
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-xl font-bold text-slate-800">
            {activeCategory === 'top5' ? 'Top 5 最受歡迎機器人' : '所有機器人'}
          </h2>
          <span className="text-sm text-slate-500">共 {filteredBots.length} 個</span>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <GlassCard key={i} className="animate-pulse h-64 flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 bg-slate-200/50 rounded-2xl mb-6"></div>
                  <div className="h-6 bg-slate-200/50 rounded-md w-3/4 mb-3"></div>
                  <div className="h-4 bg-slate-200/50 rounded-md w-full mb-2"></div>
                  <div className="h-4 bg-slate-200/50 rounded-md w-5/6"></div>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : filteredBots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBots.map((bot, index) => (
              <BotCard key={bot.id} bot={bot} onClick={() => handleBotClick(bot.id, bot.target_url)} delay={index * 0.05} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white/40 rounded-3xl border border-white/50">
            <Bot className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">找不到符合條件的機器人</p>
          </div>
        )}
      </section>

      {/* Footer / Admin Link */}
      <footer className="text-center pb-8 border-t border-slate-200/50 pt-8 flexjustify-center text-sm text-slate-500">
        <div className="flex justify-center gap-4">
           <span>門市 AI 機器人導覽平台</span>
           <Link to="/admin/login" className="text-blue-500 hover:underline">管理員登入</Link>
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
      <GlassCard className="h-full flex flex-col justify-between cursor-pointer" onClick={onClick}>
        <div>
          <div className="flex items-start justify-between mb-6">
            <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 group-hover:scale-105 transition-transform shrink-0">
               <Bot className="w-8 h-8" />
            </div>
            <div className="flex flex-wrap gap-2 text-right">
               <span className="px-3 py-1 bg-slate-100/50 text-slate-500 rounded-full text-[10px] font-bold uppercase tracking-wider">{bot.category_name || '未分類'}</span>
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
            {bot.name}
          </h3>
          
          <p className="text-slate-500 leading-relaxed text-sm">
            {bot.summary}
          </p>
          
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-indigo-100/50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-wider">平台: {bot.ai_platform}</span>
            <span className="px-3 py-1 bg-emerald-100/50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider">創作者: {bot.creator}</span>
          </div>
          {bot.target_url && (
            <div className="mt-4 break-all">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">使用網址</span>
              <a 
                href={bot.target_url} 
                target="_blank" 
                rel="noreferrer" 
                className="text-xs text-blue-500 hover:text-blue-700 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {bot.target_url}
              </a>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-8">
          <div className="flex flex-col">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">總點擊數</span>
             <span className="text-2xl font-mono font-bold text-slate-700">{bot.click_count || 0}</span>
          </div>
          <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-indigo-500 shadow-md border border-indigo-50 group-hover:scale-105 transition-transform">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </GlassCard>
    </motion.div>
  );
}
