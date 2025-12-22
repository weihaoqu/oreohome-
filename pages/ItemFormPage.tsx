
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { ChevronLeft, Save, Sparkles, MapPin, Plus, Heart, Mic, Camera, X, Upload } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { t } from '../translations';
import { GoogleGenAI, Type } from "@google/genai";

const ItemFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { state, lang, addItem, updateItem } = useInventory();

  const isEdit = !!id;
  const initialLocation = searchParams.get('locationId') || (state.locations[0]?.id || '');

  const [formData, setFormData] = useState({
    name: '',
    quantity: 1,
    unit: lang === 'en' ? 'pcs' : '个',
    locationId: initialLocation,
    containerId: '',
    tags: [] as string[]
  });

  const [aiLoading, setAiLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (isEdit) {
      const item = state.items.find(i => i.id === id);
      if (item) {
        setFormData({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          locationId: item.locationId,
          containerId: item.containerId || '',
          tags: item.tags
        });
      }
    }
  }, [id, isEdit, state.items]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.locationId) return;
    
    if (isEdit) {
      updateItem(id!, formData);
    } else {
      addItem(formData);
    }
    navigate(`/location/${formData.locationId}`);
  };

  const processAiResult = (jsonStr: string) => {
    try {
      const data = JSON.parse(jsonStr);
      const matchedLoc = state.locations.find(l => 
        l.name.toLowerCase().includes(data.location?.toLowerCase() || '')
      );
      
      setFormData(prev => ({
        ...prev,
        name: data.item || prev.name,
        quantity: data.quantity || prev.quantity,
        unit: data.unit || prev.unit,
        locationId: matchedLoc?.id || prev.locationId,
        tags: data.tags || prev.tags
      }));
    } catch (e) {
      console.error("AI Parse Error", e);
    }
  };

  const handleVoiceAdd = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          setAiLoading(true);
          try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `This is a voice command for adding an item to home inventory. Existing locations are: ${state.locations.map(l => l.name).join(', ')}. Extract item name, quantity, unit, and location. Response in JSON.`;
            const response = await ai.models.generateContent({
              model: 'gemini-3-pro-preview',
              contents: [
                { text: prompt },
                { inlineData: { mimeType: 'audio/webm', data: base64Audio } }
              ],
              config: {
                responseMimeType: "application/json",
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    item: { type: Type.STRING },
                    quantity: { type: Type.NUMBER },
                    unit: { type: Type.STRING },
                    location: { type: Type.STRING },
                    tags: { type: Type.ARRAY, items: { type: Type.STRING } }
                  }
                }
              }
            });
            processAiResult(response.text);
          } finally {
            setAiLoading(false);
          }
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic error", err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        identifyFromBase64(dataUrl.split(',')[1]);
      };
      reader.readAsDataURL(file);
    }
  };

  const identifyFromBase64 = async (base64Image: string) => {
    setAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `你是一个极度细致的家庭仓储管理员。请识别图片中的物品。
      要求识别出具体的【品牌】和【完整产品名】（如：雅诗兰黛面霜、倩碧精华）。
      提取品牌、规格、预估数量、单位，并从现有位置中建议一个：${state.locations.map(l => l.name).join(', ')}。
      请以 JSON 格式返回。`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          { text: prompt },
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              item: { type: Type.STRING },
              quantity: { type: Type.NUMBER },
              unit: { type: Type.STRING },
              location: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      });
      processAiResult(response.text);
    } finally {
      setAiLoading(false);
    }
  };

  const handlePhotoAdd = async () => {
    if (!showCamera) {
      setShowCamera(true);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Camera error", err);
        setShowCamera(false);
      }
      return;
    }

    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      const base64Image = dataUrl.split(',')[1];

      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setShowCamera(false);

      identifyFromBase64(base64Image);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white text-pink-400 hover:bg-pink-50 rounded-full flex items-center justify-center shadow-sm transition-all border border-pink-50">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-2xl font-black text-pink-600">{isEdit ? t('editItem', lang) : t('addItem', lang)}</h1>
      </header>

      {!isEdit && (
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button 
            type="button"
            onClick={handleVoiceAdd}
            className={`flex items-center justify-center gap-2 p-4 rounded-3xl border-2 transition-all font-black uppercase tracking-widest ${
              isRecording ? 'bg-rose-500 border-rose-600 text-white animate-pulse' : 'bg-white border-pink-100 text-pink-500 hover:bg-pink-50'
            }`}
          >
            <Mic size={20} />
            {isRecording ? t('listening', lang) : t('voiceAdd', lang)}
          </button>
          
          <button 
            type="button"
            onClick={handlePhotoAdd}
            className="flex items-center justify-center gap-2 p-4 rounded-3xl bg-white border-2 border-pink-100 text-pink-500 hover:bg-pink-50 transition-all font-black uppercase tracking-widest"
          >
            <Camera size={20} />
            {t('photoAdd', lang)}
          </button>

          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 p-4 rounded-3xl bg-white border-2 border-pink-100 text-pink-500 hover:bg-pink-50 transition-all font-black uppercase tracking-widest"
          >
            <Upload size={20} />
            {lang === 'zh' ? '上传识别' : 'Upload AI'}
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
        </div>
      )}

      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6">
          <div className="relative w-full max-w-md aspect-square bg-slate-900 rounded-[3rem] overflow-hidden border-4 border-pink-300 shadow-2xl">
             <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
             <div className="absolute inset-0 border-2 border-dashed border-white/30 m-12 rounded-2xl pointer-events-none"></div>
          </div>
          <div className="mt-8 flex gap-6">
             <button onClick={() => {
                const stream = videoRef.current?.srcObject as MediaStream;
                stream?.getTracks().forEach(t => t.stop());
                setShowCamera(false);
             }} className="w-16 h-16 bg-white/20 text-white rounded-full flex items-center justify-center">
                <X size={32} />
             </button>
             <button onClick={handlePhotoAdd} className="w-20 h-20 bg-pink-500 text-white rounded-full flex items-center justify-center border-4 border-white shadow-xl scale-110">
                <Camera size={40} />
             </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] border-2 border-pink-100 shadow-xl shadow-pink-100/50 space-y-6 relative overflow-hidden">
        {aiLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin"></div>
            <p className="font-black text-pink-500 animate-bounce">正在智能识别品牌与规格...</p>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-black text-pink-400 uppercase tracking-widest">{t('itemName', lang)}</label>
          <input 
            type="text" 
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="w-full border-2 border-pink-50 px-5 py-4 rounded-2xl focus:ring-4 focus:ring-pink-100 focus:border-pink-300 outline-none transition-all text-lg font-bold"
            placeholder={lang === 'zh' ? '输入品牌或产品名称' : 'e.g. Estee Lauder Serum'}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-black text-pink-400 uppercase tracking-widest">{t('quantity', lang)}</label>
            <input 
              type="number" 
              value={formData.quantity}
              onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
              className="w-full border-2 border-pink-50 px-5 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all font-bold text-center text-xl"
              min="0"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-black text-pink-400 uppercase tracking-widest">{t('unit', lang)}</label>
            <input 
              type="text" 
              value={formData.unit}
              onChange={e => setFormData({ ...formData, unit: e.target.value })}
              className="w-full border-2 border-pink-50 px-5 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all font-bold text-center"
              placeholder="pcs"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-black text-pink-400 uppercase tracking-widest">{t('locationName', lang)}</label>
          <select 
            value={formData.locationId}
            onChange={e => setFormData({ ...formData, locationId: e.target.value, containerId: '' })}
            className="w-full border-2 border-pink-50 px-5 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all appearance-none bg-no-repeat bg-[right_1.5rem_center] font-bold"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23ffb6c1\' stroke-width=\'3\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E")' }}
            required
          >
            {state.locations.map(loc => (
              <option key={loc.id} value={loc.id}>🏠 {loc.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-black text-pink-400 uppercase tracking-widest">{t('containerName', lang)} (Optional)</label>
          <select 
            value={formData.containerId}
            onChange={e => setFormData({ ...formData, containerId: e.target.value })}
            className="w-full border-2 border-pink-50 px-5 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all appearance-none bg-no-repeat bg-[right_1.5rem_center] font-bold"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23ffb6c1\' stroke-width=\'3\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E")' }}
          >
            <option value="">None / 直接放入位置</option>
            {state.containers.filter(c => c.locationId === formData.locationId).map(c => (
              <option key={c.id} value={c.id}>🎀 {c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-4 pt-6">
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

export default ItemFormPage;
