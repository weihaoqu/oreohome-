
import React, { useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Plus, Package, Minus, Trash2, Edit, ChevronLeft, LayoutGrid, Camera, X, ScanSearch } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { t } from '../translations';

const LocationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state, lang, adjustQuantity, deleteItem, addContainer, updateContainer } = useInventory();
  const navigate = useNavigate();
  const [showAddContainer, setShowAddContainer] = useState(false);
  const [newContainerName, setNewContainerName] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [activeContainerId, setActiveContainerId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const location = state.locations.find(l => l.id === id);
  const items = state.items.filter(i => i.locationId === id);
  const containers = state.containers.filter(c => c.locationId === id);

  if (!location) return <div>Location not found</div>;

  const handleAddContainer = (e: React.FormEvent) => {
    e.preventDefault();
    if (newContainerName.trim()) {
      addContainer({ name: newContainerName.trim(), locationId: id! });
      setNewContainerName('');
      setShowAddContainer(false);
    }
  };

  const startCamera = async (containerId: string | null = null) => {
    setActiveContainerId(containerId);
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error(err);
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && activeContainerId) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      
      updateContainer(activeContainerId, { photoUrl: dataUrl });
      
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(t => t.stop());
      setShowCamera(false);
      setActiveContainerId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="w-10 h-10 bg-white text-pink-400 hover:bg-pink-50 rounded-full flex items-center justify-center shadow-sm border border-pink-100 transition-all">
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
             {location.photoUrl && <img src={location.photoUrl} className="w-12 h-12 rounded-xl object-cover border-2 border-pink-200" />}
             <div>
               <h1 className="text-2xl font-black text-pink-600 flex items-center gap-2">
                 <span>🏠</span> {location.name}
               </h1>
               <p className="text-sm text-pink-300 font-medium">{location.description}</p>
             </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link 
            to={`/batch-scan/${id}`}
            className="p-3 bg-pink-100 text-pink-500 hover:bg-pink-200 rounded-full shadow-sm transition-all"
            title={t('batchScan', lang)}
          >
            <ScanSearch size={22} />
          </Link>
          <Link 
            to={`/item/new?locationId=${id}`}
            className="flex-1 sm:flex-none hk-button-primary px-6 py-2.5 rounded-full flex items-center justify-center gap-2 font-bold shadow-sm"
          >
            <Plus size={20} />
            {t('addItem', lang)}
          </Link>
          <Link 
            to={`/location/edit/${id}`}
            className="p-3 bg-white border border-pink-100 hover:bg-pink-50 rounded-full text-pink-400 shadow-sm transition-all"
          >
            <Edit size={20} />
          </Link>
        </div>
      </header>

      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6">
          <div className="relative w-full max-w-md aspect-square bg-slate-900 rounded-[3rem] overflow-hidden border-4 border-pink-300">
             <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          </div>
          <div className="mt-8 flex gap-6">
             <button onClick={() => setShowCamera(false)} className="w-16 h-16 bg-white/20 text-white rounded-full flex items-center justify-center">
                <X size={32} />
             </button>
             <button onClick={capturePhoto} className="w-20 h-20 bg-pink-500 text-white rounded-full flex items-center justify-center border-4 border-white shadow-xl scale-110">
                <Camera size={40} />
             </button>
          </div>
        </div>
      )}

      {/* Containers Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-pink-500 flex items-center gap-2">
            <LayoutGrid size={18} />
            {t('subContainers', lang)}
          </h2>
          {!showAddContainer && (
            <button 
              onClick={() => setShowAddContainer(true)}
              className="text-sm font-bold text-pink-400 hover:text-pink-600 transition-colors flex items-center gap-1"
            >
              <Plus size={16} /> {lang === 'zh' ? '添加隔层' : 'Add Shelf'}
            </button>
          )}
        </div>

        {showAddContainer && (
          <form onSubmit={handleAddContainer} className="bg-white p-4 rounded-3xl border-2 border-dashed border-pink-200 flex gap-2">
            <input 
              type="text"
              value={newContainerName}
              onChange={e => setNewContainerName(e.target.value)}
              placeholder={t('containerName', lang)}
              className="flex-1 px-4 py-2 rounded-xl border border-pink-100 outline-none focus:ring-2 focus:ring-pink-300"
              autoFocus
            />
            <button type="submit" className="hk-button-primary px-4 py-2 rounded-xl font-bold">{t('save', lang)}</button>
            <button type="button" onClick={() => setShowAddContainer(false)} className="px-4 py-2 text-slate-400 font-bold">{t('cancel', lang)}</button>
          </form>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
           {containers.map(c => (
             <div key={c.id} className="bg-white border-2 border-pink-100 rounded-3xl overflow-hidden shadow-sm flex flex-col group">
                <div className="relative aspect-video bg-pink-50 flex items-center justify-center overflow-hidden">
                   {c.photoUrl ? (
                     <img src={c.photoUrl} className="w-full h-full object-cover" />
                   ) : (
                     <LayoutGrid size={32} className="text-pink-200" />
                   )}
                   <button 
                    onClick={() => startCamera(c.id)}
                    className="absolute inset-0 bg-pink-500/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white"
                   >
                     <Camera size={24} />
                     <span className="text-[10px] font-black uppercase tracking-widest mt-1">{t('takePhoto', lang)}</span>
                   </button>
                </div>
                <div className="p-3 text-center font-black text-pink-500 text-sm">
                   🎀 {c.name}
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* Items List */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-pink-500 flex items-center gap-2">
          <Package size={18} />
          {t('totalItems', lang)} ({items.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(item => (
            <div key={item.id} className="hk-card p-4 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-slate-700 text-lg">{item.name}</span>
                  {item.containerId && (
                    <span className="text-[10px] bg-pink-50 text-pink-500 px-2 py-1 rounded-full font-black uppercase border border-pink-100">
                      {state.containers.find(c => c.id === item.containerId)?.name}
                    </span>
                  )}
                </div>
                <div className="text-pink-300 text-xs font-bold mt-1 uppercase tracking-wider">
                   {item.quantity} {item.unit}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center bg-pink-50 rounded-full border border-pink-100 p-1">
                  <button onClick={() => adjustQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-full text-pink-400 transition-all shadow-sm">
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-black text-pink-600">{item.quantity}</span>
                  <button onClick={() => adjustQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-full text-pink-400 transition-all shadow-sm">
                    <Plus size={16} />
                  </button>
                </div>
                
                <div className="flex gap-1">
                  <Link to={`/item/edit/${item.id}`} className="p-2 text-pink-200 hover:text-pink-500 transition-all">
                    <Edit size={18} />
                  </Link>
                  <button onClick={() => { if(confirm('Delete item?')) deleteItem(item.id) }} className="p-2 text-pink-200 hover:text-rose-500 transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LocationDetailPage;
