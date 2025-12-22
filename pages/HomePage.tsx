
import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Package, MapPin, ChevronRight, Activity, Heart } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { t } from '../translations';

const HomePage: React.FC = () => {
  const { state, lang } = useInventory();

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-pink-600 bow-decoration">{t('home', lang)}</h1>
          <p className="text-pink-400 font-medium mt-1">{t('totalItems', lang)}: {state.items.length}</p>
        </div>
        <Link 
          to="/location/new" 
          className="hk-button-primary px-6 py-3 rounded-full flex items-center gap-2 font-bold transition-all"
        >
          <Plus size={22} />
          <span className="hidden sm:inline">{t('addLocation', lang)}</span>
        </Link>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="hk-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-pink-100 text-pink-500 rounded-2xl flex items-center justify-center">
            <MapPin size={24} />
          </div>
          <div>
            <div className="text-sm text-pink-400 font-bold">{t('allLocations', lang)}</div>
            <div className="text-2xl font-black text-slate-800">{state.locations.length}</div>
          </div>
        </div>
        <div className="hk-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-100 text-rose-500 rounded-2xl flex items-center justify-center">
            <Heart size={24} />
          </div>
          <div>
            <div className="text-sm text-rose-400 font-bold">{t('totalItems', lang)}</div>
            <div className="text-2xl font-black text-slate-800">{state.items.reduce((acc, curr) => acc + curr.quantity, 0)}</div>
          </div>
        </div>
        <div className="hk-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 text-purple-500 rounded-2xl flex items-center justify-center">
            <Activity size={24} />
          </div>
          <div>
            <div className="text-sm text-purple-400 font-bold">{t('recentActivity', lang)}</div>
            <div className="text-2xl font-black text-slate-800">12</div>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-pink-500 flex items-center gap-2">
           <span>🏠</span>
           {t('allLocations', lang)}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.locations.map(location => {
            const locationItemsCount = state.items.filter(i => i.locationId === location.id).length;
            const containersCount = state.containers.filter(c => c.locationId === location.id).length;
            
            return (
              <Link 
                key={location.id} 
                to={`/location/${location.id}`}
                className="group hk-card p-5 flex items-center justify-between"
              >
                <div className="space-y-1">
                  <h3 className="font-black text-xl text-slate-700 group-hover:text-pink-500 transition-colors">
                    {location.name}
                  </h3>
                  <div className="flex gap-4 text-sm font-medium text-slate-400">
                    <span className="flex items-center gap-1">
                      <Package size={14} className="text-pink-300" />
                      {locationItemsCount} {t('totalItems', lang)}
                    </span>
                    {containersCount > 0 && (
                      <span className="flex items-center gap-1">
                        <ChevronRight size={14} className="text-pink-300" />
                        {containersCount} {t('containersCount', lang)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center group-hover:bg-pink-100 transition-colors">
                  <ChevronRight size={20} className="text-pink-300 group-hover:text-pink-500" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
