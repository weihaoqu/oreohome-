
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trash2, Zap, Sparkles, Camera, Mic, Clock, Cpu, MessageSquare, Terminal } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { t } from '../translations';

type Tab = 'app' | 'dev';

const PromptHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, lang, clearPromptHistory } = useInventory();
  const [activeTab, setActiveTab] = useState<Tab>('app');

  const getIcon = (type: string) => {
    switch (type) {
      case 'voice': return <Mic size={18} className="text-blue-500" />;
      case 'photo': return <Camera size={18} className="text-pink-500" />;
      case 'batch_scan': return <Zap size={18} className="text-amber-500" />;
      default: return <Cpu size={18} className="text-slate-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 px-4">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white text-pink-400 hover:bg-pink-50 rounded-full flex items-center justify-center shadow-sm border border-pink-100 transition-all">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-black text-pink-600 bow-decoration">{t('promptHistory', lang)}</h1>
        </div>

        {activeTab === 'app' && state.promptHistory.length > 0 && (
          <button 
            onClick={() => { if(confirm('Clear runtime logs?')) clearPromptHistory() }}
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-500 rounded-full font-black text-xs uppercase tracking-widest border border-rose-100 hover:bg-rose-100 transition-all"
          >
            <Trash2 size={14} />
            {t('clearHistory', lang)}
          </button>
        )}
      </header>

      {/* Tab Switcher */}
      <div className="flex bg-white p-1.5 rounded-[2rem] border-2 border-pink-50 shadow-sm w-full max-w-md mx-auto">
        <button 
          onClick={() => setActiveTab('app')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'app' ? 'bg-pink-500 text-white shadow-lg' : 'text-pink-300 hover:text-pink-400'}`}
        >
          <Sparkles size={16} />
          {t('appLogs', lang)}
        </button>
        <button 
          onClick={() => setActiveTab('dev')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'dev' ? 'bg-pink-500 text-white shadow-lg' : 'text-pink-300 hover:text-pink-400'}`}
        >
          <Terminal size={16} />
          {t('devHistory', lang)}
        </button>
      </div>

      <div className="space-y-4">
        {activeTab === 'app' ? (
          state.promptHistory.length > 0 ? (
            state.promptHistory.map(entry => (
              <div key={entry.id} className="bg-white p-6 rounded-[2rem] border-2 border-pink-50 shadow-sm hover:border-pink-200 transition-all animate-[fadeIn_0.3s_ease-out]">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      {getIcon(entry.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(entry.timestamp).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US')}
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${entry.model.includes('3') ? 'bg-pink-500 text-white' : 'bg-pink-100 text-pink-600'}`}>
                          {entry.model}
                        </span>
                      </div>
                      <div className="font-black text-slate-700 mt-0.5 capitalize">{entry.type.replace('_', ' ')} AI Call</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-[10px] font-black text-pink-300 uppercase tracking-widest mb-1.5 ml-1">Prompt / 系统提示词</div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm font-medium text-slate-600 italic">
                      {entry.prompt}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-black text-pink-300 uppercase tracking-widest mb-1.5 ml-1 flex items-center gap-1">
                      <Sparkles size={10} />
                      Response / 识别结果
                    </div>
                    <div className="bg-pink-50/30 p-4 rounded-2xl border border-pink-50 text-sm font-black text-pink-600">
                      {entry.responseSummary}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center text-pink-200 bg-white rounded-[3rem] border-2 border-dashed border-pink-100">
               <Clock size={64} className="mx-auto mb-4 opacity-30" />
               <p className="text-xl font-black">{t('noHistory', lang)}</p>
            </div>
          )
        ) : (
          /* Development History View */
          <div className="space-y-6">
            {state.developmentPrompts.map((prompt, index) => (
              <div key={prompt.id} className="relative pl-8 animate-[fadeIn_0.3s_ease-out]" style={{ animationDelay: `${index * 0.1}s` }}>
                {/* Timeline Line */}
                {index < state.developmentPrompts.length - 1 && (
                  <div className="absolute left-3.5 top-8 bottom-0 w-0.5 bg-pink-100"></div>
                )}
                
                {/* Timeline Dot */}
                <div className="absolute left-0 top-1.5 w-7 h-7 bg-white border-4 border-pink-500 rounded-full z-10"></div>
                
                <div className="bg-white p-6 rounded-[2.5rem] border-2 border-pink-100 shadow-sm hover:shadow-pink-100/50 transition-all group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black text-white bg-pink-500 px-3 py-1 rounded-full uppercase tracking-widest">
                         {t('devStep', lang)} {index + 1}
                       </span>
                       <span className="text-[10px] font-bold text-pink-300">v{prompt.version}</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-300 uppercase">
                      {new Date(prompt.timestamp).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US')}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-slate-600 font-medium leading-relaxed group-hover:bg-white transition-colors">
                     {prompt.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default PromptHistoryPage;
