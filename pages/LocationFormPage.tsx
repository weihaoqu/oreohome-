
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Save, MapPin, Heart, Camera, X, RotateCcw } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { t } from '../translations';

const LocationFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, lang, addLocation, updateLocation } = useInventory();

  const isEdit = !!id;
  const [formData, setFormData] = useState<{name: string, description: string, photoUrl?: string}>({
    name: '',
    description: '',
    photoUrl: ''
  });

  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isEdit) {
      const location = state.locations.find(l => l.id === id);
      if (location) {
        setFormData({
          name: location.name,
          description: location.description || '',
          photoUrl: location.photoUrl
        });
      }
    }
  }, [id, isEdit, state.locations]);

  const handleStartCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera access denied", err);
      setShowCamera(false);
    }
  };

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setFormData(prev => ({ ...prev, photoUrl: dataUrl }));
      
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setShowCamera(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (isEdit) {
      updateLocation(id!, formData);
      navigate(`/location/${id}`);
    } else {
      addLocation(formData);
      navigate('/');
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white text-pink-400 hover:bg-pink-50 rounded-full flex items-center justify-center shadow-sm border border-pink-100 transition-all">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-2xl font-black text-pink-600">
          {isEdit ? t('editLocation', lang) : t('addLocation', lang)}
        </h1>
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
             <button onClick={handleCapture} className="w-20 h-20 bg-pink-500 text-white rounded-full flex items-center justify-center border-4 border-white shadow-xl scale-110">
                <Camera size={40} />
             </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] border-2 border-pink-100 shadow-xl shadow-pink-100/50 space-y-6">
        {/* Photo Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-full h-48 bg-pink-50 rounded-3xl overflow-hidden border-2 border-dashed border-pink-200 flex items-center justify-center group">
            {formData.photoUrl ? (
              <>
                <img src={formData.photoUrl} alt="Location" className="w-full h-full object-cover" />
                <button 
                  type="button" 
                  onClick={handleStartCamera}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2 font-black"
                >
                  <RotateCcw size={32} />
                  {t('changePhoto', lang)}
                </button>
              </>
            ) : (
              <button 
                type="button" 
                onClick={handleStartCamera}
                className="flex flex-col items-center gap-2 text-pink-300 hover:text-pink-500 transition-colors"
              >
                <Camera size={48} />
                <span className="font-black">{t('takePhoto', lang)}</span>
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-black text-pink-400 uppercase tracking-widest">{t('locationName', lang)}</label>
          <input 
            type="text" 
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="w-full border-2 border-pink-50 px-5 py-4 rounded-2xl focus:ring-4 focus:ring-pink-100 focus:border-pink-300 outline-none transition-all text-lg font-bold"
            placeholder={lang === 'en' ? "e.g. Bedroom Closet" : "例如：卧室衣柜"}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-black text-pink-400 uppercase tracking-widest">{t('description', lang)}</label>
          <textarea 
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="w-full border-2 border-pink-50 px-5 py-4 rounded-2xl focus:ring-4 focus:ring-pink-100 focus:border-pink-300 outline-none transition-all min-h-[120px] resize-none font-bold"
            placeholder={t('descriptionPlaceholder', lang)}
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            type="button" 
            onClick={() => navigate(-1)}
            className="flex-1 px-6 py-4 border-2 border-pink-50 text-pink-300 rounded-2xl font-black hover:bg-pink-50 transition-all"
          >
            {t('cancel', lang)}
          </button>
          <button 
            type="submit"
            className="flex-1 px-6 py-4 hk-button-primary text-white rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-xl shadow-pink-200"
          >
            <Heart size={20} fill="currentColor" />
            {t('save', lang)}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LocationFormPage;
