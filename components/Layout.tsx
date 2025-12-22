
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Users, Globe, Heart, Sparkles, Image as ImageIcon } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { t } from '../translations';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { lang, setLang } = useInventory();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: t('home', lang) },
    { path: '/visuals', icon: Sparkles, label: t('visuals', lang) },
    { path: '/search', icon: Search, label: t('search', lang) },
    { path: '/share', icon: Users, label: t('share', lang) },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-pink-100 p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white text-xl">
            🎀
          </div>
          <span className="text-2xl font-bold tracking-tight text-pink-600 font-serif">{t('appName', lang)}</span>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                location.pathname === item.path 
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
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-pink-100 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎀</span>
          <span className="text-xl font-bold text-pink-600">{t('appName', lang)}</span>
        </div>
        <button onClick={() => setLang(lang === 'en' ? 'zh' : 'en')} className="p-2 text-pink-400">
          <Globe size={22} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 pb-24 md:pb-6 overflow-x-hidden">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-pink-100 flex justify-around py-3 z-50 rounded-t-3xl shadow-lg">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 transition-colors ${
              location.pathname === item.path ? 'text-pink-600 scale-110' : 'text-pink-200'
            }`}
          >
            <item.icon size={24} />
            <span className="text-[10px] uppercase font-black tracking-wider">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
