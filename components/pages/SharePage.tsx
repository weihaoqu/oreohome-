'use client';

import React from 'react';
import { UserPlus, Shield, User, LogOut } from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import { t } from '@/translations';

const SharePage: React.FC = () => {
  const { state, lang } = useInventory();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('share', lang)}</h1>
          <p className="text-slate-500 mt-1">Manage family access and synchronization</p>
        </div>
        <button className="bg-slate-900 text-white px-5 py-2.5 rounded-full flex items-center gap-2 font-bold hover:bg-slate-800 transition-all">
          <UserPlus size={18} />
          {t('inviteMember', lang)}
        </button>
      </header>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <Shield size={20} className="text-blue-500" />
          <h2 className="font-bold text-slate-800">{t('members', lang)} ({state.members.length})</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {state.members.map(member => (
            <div key={member.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full border-2 border-slate-100" />
                <div>
                  <div className="font-bold text-slate-800 flex items-center gap-2">
                    {member.name}
                    {member.id === state.currentUserId && (
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase">You</span>
                    )}
                  </div>
                  <div className="text-sm text-slate-500">{member.id === 'u1' ? 'Owner' : 'Member'}</div>
                </div>
              </div>
              {member.id !== state.currentUserId && (
                <button className="p-2 text-slate-400 hover:text-red-500 transition-all">
                  <LogOut size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-600 p-8 rounded-3xl text-white space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <User size={24} />
          Family Sync Pro
        </h3>
        <p className="opacity-90">Inventory updates are automatically synchronized across all member devices in real-time.</p>
        <div className="flex gap-2">
           <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
           <span className="text-xs font-bold uppercase tracking-widest opacity-80">Real-time Connected</span>
        </div>
      </div>
    </div>
  );
};

export default SharePage;
