
import React, { useState } from 'react';
import { Sparkles, MapPin, Package, ChevronRight, LayoutGrid, Heart } from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import { t } from '@/translations';

const VisualSummaryPage: React.FC = () => {
  const { state, lang } = useInventory();
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(state.locations[0]?.id || null);

  const selectedLocation = state.locations.find(l => l.id === selectedLocationId);
  const itemsInLocation = state.items.filter(i => i.locationId === selectedLocationId);
  const containersInLocation = state.containers.filter(c => c.locationId === selectedLocationId);

  // Group items by container or "General"
  const groupedItems = containersInLocation.map(c => ({
    container: c,
    items: itemsInLocation.filter(i => i.containerId === c.id)
  }));

  const generalItems = itemsInLocation.filter(i => !i.containerId);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-black text-pink-600 bow-decoration">{t('visuals', lang)}</h1>
        <p className="text-pink-400 font-medium mt-1">{t('visualDesc', lang)}</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Location Selector (Sidebar within page) */}
        <div className="w-full lg:w-72 space-y-3">
          <h2 className="text-sm font-black text-pink-300 uppercase tracking-widest px-2 mb-4">{t('allLocations', lang)}</h2>
          {state.locations.map(loc => (
            <button
              key={loc.id}
              onClick={() => setSelectedLocationId(loc.id)}
              className={`w-full text-left px-5 py-4 rounded-3xl transition-all flex items-center justify-between border-2 ${
                selectedLocationId === loc.id 
                  ? 'bg-pink-500 border-pink-500 text-white shadow-lg shadow-pink-200 scale-[1.02]' 
                  : 'bg-white border-pink-100 text-slate-600 hover:border-pink-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🏠</span>
                <span className="font-bold truncate">{loc.name}</span>
              </div>
              <ChevronRight size={16} className={selectedLocationId === loc.id ? 'text-pink-200' : 'text-pink-100'} />
            </button>
          ))}
        </div>

        {/* Visual Map Area */}
        <div className="flex-1 bg-white border-2 border-pink-100 rounded-[3rem] p-8 min-h-[600px] relative overflow-hidden shadow-xl shadow-pink-100/50">
          {/* Decorative background patterns */}
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
             <Heart size={200} fill="#ff69b4" />
          </div>
          <div className="absolute bottom-0 left-0 p-10 opacity-5 rotate-12 pointer-events-none">
             <Heart size={150} fill="#ff69b4" />
          </div>

          {selectedLocation ? (
            <div className="relative z-10 h-full flex flex-col items-center">
              {/* Central Node */}
              <div className="mb-16 animate-[bounce_3s_ease-in-out_infinite]">
                <div className="relative bg-pink-500 text-white px-10 py-6 rounded-[2.5rem] shadow-2xl shadow-pink-200 flex flex-col items-center border-4 border-white">
                  <div className="absolute -top-6 -right-6 text-5xl">🎀</div>
                  <MapPin size={32} className="mb-2" />
                  <h3 className="text-2xl font-black">{selectedLocation.name}</h3>
                  <p className="text-xs text-pink-100 uppercase font-bold tracking-widest mt-1">
                    {itemsInLocation.length} Items Total
                  </p>
                </div>
              </div>

              {/* Branches Grid */}
              <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* General items node */}
                {generalItems.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2 px-4">
                      <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center">
                        <Package size={16} />
                      </div>
                      <h4 className="font-black text-pink-400 uppercase text-xs tracking-wider">Uncategorized</h4>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {generalItems.map(item => (
                        <div key={item.id} className="bg-pink-50 border-2 border-white px-5 py-3 rounded-2xl flex items-center justify-between group hover:bg-white hover:border-pink-200 transition-all shadow-sm animate-[fadeIn_0.5s_ease-out]">
                          <span className="font-bold text-slate-700">{item.name}</span>
                          <span className="bg-white px-3 py-1 rounded-full text-xs font-black text-pink-500 shadow-inner">
                            {item.quantity} {item.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Container-based nodes */}
                {groupedItems.map(group => (
                  <div key={group.container.id} className="space-y-4">
                    <div className="flex items-center gap-2 mb-2 px-4">
                      <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center">
                        <LayoutGrid size={16} />
                      </div>
                      <h4 className="font-black text-rose-400 uppercase text-xs tracking-wider">🎀 {group.container.name}</h4>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {group.items.length > 0 ? group.items.map(item => (
                        <div key={item.id} className="bg-white border-2 border-rose-50 px-5 py-3 rounded-2xl flex items-center justify-between hover:border-rose-300 transition-all shadow-sm animate-[fadeIn_0.5s_ease-out]">
                          <span className="font-bold text-slate-700">{item.name}</span>
                          <span className="bg-rose-50 px-3 py-1 rounded-full text-xs font-black text-rose-500">
                            {item.quantity} {item.unit}
                          </span>
                        </div>
                      )) : (
                        <div className="text-xs text-slate-300 italic px-4">Empty shelf</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* No items case */}
              {itemsInLocation.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center opacity-40">
                  <div className="text-8xl mb-4">😿</div>
                  <p className="text-xl font-black text-pink-300">{t('noItemsToVisualize', lang)}</p>
                </div>
              )}
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-pink-200">
               <Sparkles size={64} className="mb-4 animate-pulse" />
               <p className="text-lg font-bold">Select a location to explore its map</p>
             </div>
          )}
        </div>
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

export default VisualSummaryPage;
