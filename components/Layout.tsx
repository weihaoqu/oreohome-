'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Users, Globe, Heart, Sparkles, Image as ImageIcon, ClipboardList } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { t } from '../translations';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { lang, setLang } = useInventory();
  const pathname = usePathname();

  const navItems = [
    { path: '/', icon: Home, label: t('home', lang) },
    { path: '/visuals', icon: Sparkles, label: t('visuals', lang) },
    { path: '/search', icon: Search, label: t('search', lang) },
    { path: '/history', icon: ClipboardList, label: t('promptHistory', lang) },
    { path: '/share', icon: Users, label: t('share', lang) },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white/70 backdrop-blur-sm border-r border-pink-100 p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-pink-200 shadow-md">
            <img src="/oreohome.png" alt="OreO" className="w-full h-full object-cover" />
          </div>
          <span className="text-2xl font-black tracking-wide text-pink-600" style={{ fontFamily: '"Comic Sans MS", "Marker Felt", cursive' }}>OreO 啥都有</span>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                pathname === item.path 
                  ? 'bg-pink-100 text-pink-600 font-bold' 
                  : 'text-slate-600 hover:bg-pink-50 hover:text-pink-500'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="pt-6 border-t border-pink-50">
           <button 
            onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
            className="flex items-center gap-3 px-4 py-3 w-full text-slate-500 hover:bg-pink-50 rounded-2xl transition-all"
          >
            <Globe size={20} />
            {lang === 'en' ? '中文' : 'English'}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-white/70 backdrop-blur-sm border-b border-pink-100 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-pink-200">
            <img src="/oreohome.png" alt="OreO" className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-black text-pink-600" style={{ fontFamily: '"Comic Sans MS", "Marker Felt", cursive' }}>OreO 啥都有</span>
        </div>
        <button onClick={() => setLang(lang === 'en' ? 'zh' : 'en')} className="p-2 text-pink-400">
          <Globe size={22} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 pb-24 md:pb-6 overflow-x-hidden bg-white/60 backdrop-blur-sm">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/70 backdrop-blur-sm border-t border-pink-100 flex justify-around py-3 z-50 rounded-t-3xl shadow-lg px-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center gap-1 transition-colors ${
              pathname === item.path ? 'text-pink-600 scale-110' : 'text-pink-200'
            }`}
          >
            <item.icon size={22} />
            <span className="text-[8px] uppercase font-black tracking-wider text-center">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
