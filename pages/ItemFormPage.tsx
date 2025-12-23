'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Save, Sparkles, MapPin, Plus, Heart, Mic, Camera, X, Upload, AlertCircle, Loader2, ListChecks, CheckCircle2, Trash2, Zap, Settings2, Info } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { t } from '../translations';
import { recognizeAudio, recognizeImage } from '@/lib/api';
import { AIModel } from '../types';

interface AIDraft {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  tags: string[];
}

interface ItemFormPageProps {
  editId?: string;
}

const ItemFormPage: React.FC<ItemFormPageProps> = ({ editId }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { state, lang, addItem, updateItem, setSelectedModel, addPromptHistory } = useInventory();

  const isEdit = !!editId;
  const initialLocation = searchParams.get('locationId') || (state.locations[0]?.id || '');

  const [formData, setFormData] = useState({
    name: '',
    quantity: 1,
    unit: lang === 'en' ? 'pcs' : '个',
    locationId: initialLocation,
    containerId: '',
    tags: [] as string[],
    photoUrl: ''
  });

  const [maxItems, setMaxItems] = useState(5);
  const [drafts, setDrafts] = useState<AIDraft[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraMode, setCameraMode] = useState<'item-photo' | 'ai-recognize'>('ai-recognize'); // 相机模式
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      stopCurrentStream();
    };
  }, []);

  useEffect(() => {
    if (isEdit) {
      const item = state.items.find(i => i.id === editId);
      if (item) {
        setFormData({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          locationId: item.locationId,
          containerId: item.containerId || '',
          tags: item.tags,
          photoUrl: item.photoUrl || ''
        });
      }
    }
  }, [editId, isEdit, state.items]);

  const stopCurrentStream = () => {
    if (currentStreamRef.current) {
      currentStreamRef.current.getTracks().forEach(track => track.stop());
      currentStreamRef.current = null;
    }
  };

  const handleApplyDraft = (draft: AIDraft) => {
    setFormData(prev => ({
      ...prev,
      name: draft.name,
      quantity: draft.quantity,
      unit: draft.unit,
      tags: draft.tags
    }));
  };

  const handleQuickAdd = (draft: AIDraft) => {
    addItem({
      name: draft.name,
      quantity: draft.quantity,
      unit: draft.unit,
      locationId: formData.locationId,
      containerId: formData.containerId,
      tags: draft.tags
    });
    setDrafts(prev => prev.filter(d => d.id !== draft.id));
  };

  const handleBulkAdd = () => {
    drafts.forEach(draft => {
      addItem({
        name: draft.name,
        quantity: draft.quantity,
        unit: draft.unit,
        locationId: formData.locationId,
        containerId: formData.containerId,
        tags: draft.tags
      });
    });
    const currentLocId = formData.locationId;
    setDrafts([]);
    router.push(`/location/${currentLocId}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.locationId) return;
    
    if (isEdit) {
      updateItem(editId!, formData);
      router.push(`/location/${formData.locationId}`);
    } else {
      addItem(formData);
      if (drafts.length > 0) {
        setFormData(prev => ({ ...prev, name: '' }));
      } else {
        router.push(`/location/${formData.locationId}`);
      }
    }
  };

  const handleStartRecording = async (e: React.MouseEvent | React.TouchEvent) => {
    setErrorMsg(null);
    setIsRecording(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      currentStreamRef.current = stream;
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      mediaRecorder.onstop = async () => {
        stopCurrentStream();
        if (audioChunksRef.current.length === 0) return;
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (audioBlob.size < 500) {
            setErrorMsg(lang === 'zh' ? "录音时间太短" : "Recording too short");
            return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          await processMultipleAI(base64Audio, mimeType, 'audio');
        };
      };
      mediaRecorder.start();
    } catch (err) {
      setIsRecording(false);
      setErrorMsg(lang === 'zh' ? "无法开启麦克风" : "Cannot access microphone");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const processMultipleAI = async (base64: string, mimeType: string, type: 'audio' | 'image') => {
    setAiLoading(true);
    setErrorMsg(null);
    const promptText = `You are a home inventory assistant. Identify up to ${maxItems} items from this ${type}. Return JSON array with: "item" (name), "quantity" (number), "unit" (string), "tags" (array of strings, optional).`;
    
    try {
      const currentModel = state.selectedModel;
      
      let result;
      if (type === 'audio') {
        const audioData = `data:${mimeType};base64,${base64}`;
        result = await recognizeAudio(audioData, mimeType, currentModel, maxItems, promptText);
      } else {
        const imageData = `data:${mimeType};base64,${base64}`;
        result = await recognizeImage(imageData, currentModel, maxItems, promptText);
      }

      const newDrafts: AIDraft[] = result.items.map((r: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: r.item,
        quantity: r.quantity,
        unit: r.unit,
        tags: r.tags || []
      }));

      // Log to history
      addPromptHistory({
        prompt: promptText,
        model: currentModel,
        type: type === 'audio' ? 'voice' : 'photo',
        responseSummary: `Identified ${newDrafts.length} items: ${newDrafts.map(d => d.name).join(', ')}`
      });

      if (newDrafts.length > 0) {
        setDrafts(newDrafts);
        handleApplyDraft(newDrafts[0]);
      } else {
        setErrorMsg(lang === 'zh' ? "未识别到物品" : "No items identified");
      }
    } catch (err) {
      setErrorMsg(lang === 'zh' ? "AI 识别失败" : "AI recognition failed");
    } finally {
      setAiLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        processMultipleAI(dataUrl.split(',')[1], 'image/jpeg', 'image');
      };
      reader.readAsDataURL(file);
    }
  };

  const closeCamera = () => {
    stopCurrentStream();
    setShowCamera(false);
  };

  const handlePhotoAdd = async () => {
    if (!showCamera) {
      setCameraMode('ai-recognize');
      setShowCamera(true);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        currentStreamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
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
      stopCurrentStream();
      setShowCamera(false);
      
      if (cameraMode === 'item-photo') {
        // 直接保存为物品图片
        setFormData(prev => ({ ...prev, photoUrl: dataUrl }));
      } else {
        // AI 识别模式
        processMultipleAI(dataUrl.split(',')[1], 'image/jpeg', 'image');
      }
    }
  };

  const handleTakeItemPhoto = async () => {
    setCameraMode('item-photo');
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      currentStreamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      setShowCamera(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-12 px-4 space-y-8">
      <header className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white text-pink-400 hover:bg-pink-50 rounded-full flex items-center justify-center shadow-sm border border-pink-50">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-2xl font-black text-pink-600">{isEdit ? t('editItem', lang) : t('addItem', lang)}</h1>
      </header>

      {!isEdit && (
        <div className="space-y-6">
          {/* Enhanced AI Settings Section */}
          <div className="bg-white p-6 rounded-[2.5rem] border-2 border-pink-50 shadow-sm space-y-6">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-pink-400 font-bold text-sm uppercase tracking-widest">
                      <Settings2 size={18} />
                      {t('switchModel', lang)}
                    </div>
                    <div 
                      role="radiogroup" 
                      aria-label={t('aiEngine', lang)}
                      className="flex bg-pink-50 p-1.5 rounded-2xl border-2 border-pink-100 shadow-inner"
                    >
                      <button 
                        role="radio"
                        aria-checked={state.selectedModel === 'gemini-2.5-flash'}
                        onClick={() => setSelectedModel('gemini-2.5-flash')}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-2 ${state.selectedModel === 'gemini-2.5-flash' ? 'bg-pink-500 text-white shadow-md' : 'text-pink-300 hover:text-pink-400'}`}
                      >
                        <Zap size={14} className={state.selectedModel === 'gemini-2.5-flash' ? 'animate-pulse' : ''} />
                        2.5 Flash
                      </button>
                      <button 
                        role="radio"
                        aria-checked={state.selectedModel === 'gemini-3-flash-preview'}
                        onClick={() => setSelectedModel('gemini-3-flash-preview')}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-2 ${state.selectedModel === 'gemini-3-flash-preview' ? 'bg-pink-500 text-white shadow-md' : 'text-pink-300 hover:text-pink-400'}`}
                      >
                        <Sparkles size={14} className={state.selectedModel === 'gemini-3-flash-preview' ? 'animate-spin-slow' : ''} />
                        3.0 Flash
                      </button>
                    </div>
                </div>

                <div className="flex items-start gap-2 bg-pink-50/50 p-4 rounded-2xl border border-pink-50 transition-all">
                  <Info size={16} className="text-pink-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs font-bold text-pink-300 leading-relaxed">
                    {state.selectedModel === 'gemini-2.5-flash' ? t('modelFlashDesc', lang) : t('modelFlash3Desc', lang)}
                  </p>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-pink-50">
              <div className="flex items-center gap-2 text-pink-400 font-bold text-sm uppercase tracking-widest">
                <Sparkles size={18} />
                {t('maxItemsLimit', lang)}
              </div>
              <div className="flex items-center gap-4">
                <input 
                  type="range" min="1" max="20" 
                  value={maxItems} 
                  onChange={e => setMaxItems(Number(e.target.value))}
                  className="accent-pink-500 w-32 cursor-pointer"
                  aria-label={t('maxItemsLimit', lang)}
                />
                <span className="w-8 h-8 bg-pink-500 text-white rounded-lg flex items-center justify-center font-black text-xs shadow-md">{maxItems}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button 
              onMouseDown={handleStartRecording} onMouseUp={handleStopRecording} onMouseLeave={handleStopRecording}
              onTouchStart={handleStartRecording} onTouchEnd={handleStopRecording}
              className={`flex flex-col items-center justify-center gap-2 p-6 rounded-[2.5rem] border-4 transition-all font-black uppercase tracking-widest select-none ${isRecording ? 'bg-rose-500 border-rose-200 text-white scale-105 shadow-xl' : 'bg-white border-pink-100 text-pink-500 hover:bg-pink-50 shadow-md'}`}
            >
              <Mic size={32} className={isRecording ? 'animate-pulse' : ''} />
              <span className="text-sm">{isRecording ? t('listening', lang) : t('voiceAdd', lang)}</span>
            </button>
            <button onClick={handlePhotoAdd} className="flex flex-col items-center justify-center gap-2 p-6 rounded-[2.5rem] bg-white border-4 border-pink-100 text-pink-500 hover:bg-pink-50 transition-all font-black uppercase tracking-widest shadow-md">
              <Camera size={32} />
              <span className="text-sm">{t('photoAdd', lang)}</span>
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center gap-2 p-6 rounded-[2.5rem] bg-white border-4 border-pink-100 text-pink-500 hover:bg-pink-50 transition-all font-black uppercase tracking-widest shadow-md">
              <Upload size={32} />
              <span className="text-sm">{lang === 'zh' ? '上传图片' : 'Upload Image'}</span>
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
          </div>
        </div>
      )}

      {/* AI Drafts Queue */}
      {drafts.length > 0 && (
        <div className="space-y-4 animate-[fadeIn_0.5s_ease-out]">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-black text-pink-600 flex items-center gap-2">
               <ListChecks size={20} />
               {t('aiDrafts', lang)} ({drafts.length})
            </h2>
            <div className="flex items-center gap-4">
              <button 
                onClick={handleBulkAdd}
                className="px-4 py-2 bg-pink-500 text-white rounded-full font-black text-xs uppercase flex items-center gap-2 shadow-lg shadow-pink-200 hover:bg-pink-600 transition-all"
              >
                <Zap size={14} />
                {t('addAllIdentified', lang)}
              </button>
              <button onClick={() => setDrafts([])} className="text-xs font-bold text-slate-400 hover:text-rose-500 flex items-center gap-1">
                <Trash2 size={14} /> {t('clearQueue', lang)}
              </button>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {drafts.map((draft) => (
              <div 
                key={draft.id}
                className={`flex-shrink-0 w-64 bg-white p-4 rounded-3xl border-2 transition-all cursor-pointer relative group ${formData.name === draft.name ? 'border-pink-500 shadow-lg' : 'border-pink-50 hover:border-pink-200'}`}
                onClick={() => handleApplyDraft(draft)}
              >
                <div className="font-black text-slate-700 truncate mb-1">{draft.name}</div>
                <div className="text-xs text-pink-400 font-bold uppercase tracking-widest mb-3">
                   {draft.quantity} {draft.unit}
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleQuickAdd(draft); }}
                  className="w-full py-2 bg-pink-100 text-pink-600 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 hover:bg-pink-500 hover:text-white transition-colors"
                >
                  <CheckCircle2 size={14} />
                  {t('quickAdd', lang)}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border-2 border-rose-100 rounded-3xl flex items-center gap-3 text-rose-500 font-bold">
          <AlertCircle size={20} />
          <span className="flex-1">{errorMsg}</span>
        </div>
      )}

      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6">
          <div className="relative w-full max-w-md aspect-square bg-slate-900 rounded-[3rem] overflow-hidden border-4 border-pink-300">
             <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          </div>
          <div className="mt-8 flex gap-6">
             <button onClick={closeCamera} className="w-16 h-16 bg-white/20 text-white rounded-full flex items-center justify-center"><X size={32} /></button>
             <button onClick={handlePhotoAdd} className="w-20 h-20 bg-pink-500 text-white rounded-full flex items-center justify-center border-4 border-white shadow-xl scale-110"><Camera size={40} /></button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] border-2 border-pink-100 shadow-xl relative overflow-hidden space-y-6">
        {aiLoading && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center space-y-4 px-10 text-center">
            <Loader2 size={48} className="text-pink-500 animate-spin" />
            <div className="space-y-1">
              <p className="font-black text-pink-500 text-lg">{t('processing', lang)}</p>
              <p className="text-[10px] text-pink-300 font-black uppercase tracking-[0.2em]">Using {state.selectedModel}</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-black text-pink-400 uppercase tracking-widest">{t('itemName', lang)}</label>
          <input 
            type="text" value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="w-full border-2 border-pink-50 px-5 py-4 rounded-2xl focus:ring-4 focus:ring-pink-100 outline-none font-bold text-lg transition-all"
            placeholder={lang === 'zh' ? '输入产品名称' : 'e.g. Shampoo'}
            required
          />
        </div>

        {/* 物品图片区域 */}
        <div className="space-y-2">
          <label className="text-sm font-black text-pink-400 uppercase tracking-widest">{lang === 'zh' ? '物品图片' : 'Item Photo'}</label>
          <div className="flex items-center gap-4">
            {formData.photoUrl && (
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-pink-100 flex-shrink-0">
                <img 
                  src={formData.photoUrl} 
                  alt={formData.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <button
              type="button"
              onClick={handleTakeItemPhoto}
              className="flex items-center gap-2 px-6 py-3 bg-pink-50 text-pink-500 rounded-2xl font-bold hover:bg-pink-100 transition-all border-2 border-pink-100"
            >
              <Camera size={20} />
              {formData.photoUrl ? (lang === 'zh' ? '重新拍照' : 'Retake Photo') : (lang === 'zh' ? '拍照' : 'Take Photo')}
            </button>
            {formData.photoUrl && (
              <button
                type="button"
                onClick={() => setFormData({ ...formData, photoUrl: '' })}
                className="p-3 text-pink-300 hover:text-rose-500 transition-all"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-black text-pink-400 uppercase tracking-widest">{t('quantity', lang)}</label>
            <input 
              type="number" value={formData.quantity}
              onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
              className="w-full border-2 border-pink-50 px-5 py-4 rounded-2xl outline-none font-bold text-center text-xl"
              min="0" required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-black text-pink-400 uppercase tracking-widest">{t('unit', lang)}</label>
            <input 
              type="text" value={formData.unit}
              onChange={e => setFormData({ ...formData, unit: e.target.value })}
              className="w-full border-2 border-pink-50 px-5 py-4 rounded-2xl outline-none font-bold text-center"
              placeholder="pcs" required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-black text-pink-400 uppercase tracking-widest">{t('locationName', lang)}</label>
          <select 
            value={formData.locationId}
            onChange={e => setFormData({ ...formData, locationId: e.target.value, containerId: '' })}
            className="w-full border-2 border-pink-50 px-5 py-4 rounded-2xl outline-none appearance-none bg-no-repeat bg-[right_1.5rem_center] font-bold"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23ffb6c1\' stroke-width=\'3\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E")' }}
            required
          >
            {state.locations.map(loc => (
              <option key={loc.id} value={loc.id}>🏠 {loc.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-black text-pink-400 uppercase tracking-widest">{t('containerName', lang)}</label>
          <select 
            value={formData.containerId}
            onChange={e => setFormData({ ...formData, containerId: e.target.value })}
            className="w-full border-2 border-pink-50 px-5 py-4 rounded-2xl outline-none appearance-none bg-no-repeat bg-[right_1.5rem_center] font-bold"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23ffb6c1\' stroke-width=\'3\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E")' }}
          >
            <option value="">None / Directly in Location</option>
            {state.containers.filter(c => c.locationId === formData.locationId).map(c => (
              <option key={c.id} value={c.id}>🎀 {c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-4 pt-6">
          <button type="button" onClick={() => navigate(-1)} className="flex-1 px-6 py-4 border-2 border-pink-50 text-pink-300 rounded-2xl font-black">{t('cancel', lang)}</button>
          <button type="submit" className="flex-1 px-6 py-4 hk-button-primary text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl shadow-pink-200">
            <Heart size={20} fill="currentColor" />
            {drafts.length > 0 ? (lang === 'zh' ? '添加并继续' : 'Add & Next') : t('save', lang)}
          </button>
        </div>
      </form>
      
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-spin-slow { animation: spin 3s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default ItemFormPage;
