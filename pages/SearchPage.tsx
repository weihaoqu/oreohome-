
import React, { useState, useMemo } from 'react';
import { Search, MapPin, Package, ChevronRight, Camera, Target, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';
import { t } from '../translations';

const SearchPage: React.FC = () => {
  const { state, lang } = useInventory();
  const [query, setQuery] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return [];
    return state.items.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
  }, [query, state.items]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-pink-300" size={28} />
        <input 
          type="text" 
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full pl-16 pr-8 py-5 bg-white border-4 border-pink-50 rounded-[2.5rem] shadow-xl shadow-pink-100/30 focus:ring-8 focus:ring-pink-100 focus:border-pink-200 outline-none transition-all text-xl font-bold placeholder:text-pink-100"
          placeholder={t('searchPlaceholder', lang)}
          autoFocus
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredItems.map(item => {
          const location = state.locations.find(l => l.id === item.locationId);
          const container = state.containers.find(c => c.id === item.containerId);
          const visualSource = container?.photoUrl || location?.photoUrl;

          return (
            <div 
              key={item.id}
              className="bg-white p-6 rounded-[2.5rem] border-2 border-pink-50 hover:border-pink-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group shadow-sm"
            >
              <div className="flex gap-5">
                <div className="relative w-24 h-24 rounded-3xl overflow-hidden bg-pink-50 flex-shrink-0 border-2 border-white shadow-inner">
                  {visualSource ? (
                    <img src={visualSource} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-pink-200">
                      <Package size={40} />
                    </div>
                  )}
                  {visualSource && (
                    <button 
                      onClick={() => setSelectedPhoto(visualSource)}
                      className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                    >
                      <Target size={24} />
                    </button>
                  )}
                </div>
                
                <div className="flex flex-col justify-center">
                  <h3 className="text-xl font-black text-slate-800">{item.name}</h3>
                  <div className="flex items-center gap-2 text-pink-400 font-bold mt-1 bg-pink-50 px-3 py-1 rounded-full w-fit text-sm">
                    <MapPin size={16} />
                    <span>{location?.name}</span>
                    {container && <span className="text-pink-200"> › {container.name}</span>}
                  </div>
                  <div className="mt-2 text-slate-400 font-black text-xs uppercase tracking-tighter">
                     {item.quantity} {item.unit} In Stock
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Link 
                  to={`/location/${item.locationId}`}
                  className="px-6 py-3 bg-pink-50 text-pink-500 rounded-2xl font-black flex items-center gap-2 hover:bg-pink-100 transition-all group-hover:translate-x-1"
                >
                  {t('preciseLocation', lang)}
                  <ChevronRight size={18} />
                </Link>
              </div>
            </div>
          );
        })}

        {query && filteredItems.length === 0 && (
          <div className="py-20 text-center text-pink-200 bg-white rounded-[3rem] border-2 border-dashed border-pink-100">
             <Search size={64} className="mx-auto mb-4 opacity-30" />
             <p className="text-xl font-black">{t('noItems', lang)}</p>
          </div>
        )}
      </div>

      {/* Photo Preview Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-6" onClick={() => setSelectedPhoto(null)}>
          <div className="relative max-w-4xl w-full aspect-square md:aspect-video rounded-[3rem] overflow-hidden border-4 border-pink-500 bg-black">
            <img src={selectedPhoto} className="w-full h-full object-contain" />
            <button className="absolute top-6 right-6 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
              <X size={24} className="text-pink-500" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
