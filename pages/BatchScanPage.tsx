
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Camera, X, Sparkles, Plus, Minus, Trash2, Heart, LayoutGrid, ListPlus, CheckCircle2, Info, Upload, Image as ImageIcon, Settings2 } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { t } from '../translations';
import { GoogleGenAI, Type } from "@google/genai";

interface DetectedItem {
  tempId: string;
  name: string;
  quantity: number;
  unit: string;
  containerId?: string;
}

const BatchScanPage: React.FC = () => {
  const { locationId } = useParams<{ locationId: string }>();
  const navigate = useNavigate();
  const { state, lang, addItem, setSelectedModel } = useInventory();

  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<DetectedItem[]>([]);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [globalContainerId, setGlobalContainerId] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (currentStreamRef.current) {
        currentStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      currentStreamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error(err);
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (currentStreamRef.current) {
      currentStreamRef.current.getTracks().forEach(t => t.stop());
      currentStreamRef.current = null;
    }
    setShowCamera(false);
  };

  const handleCapture = async () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(dataUrl);
      
      stopCamera();
      processImage(dataUrl);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setCapturedImage(dataUrl);
        processImage(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (dataUrl: string) => {
    setLoading(true);
    const base64Image = dataUrl.split(',')[1];

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const currentModel = state.selectedModel;
      
      const prompt = `你是一个极度细致的家庭仓储管理员。请识别图片中所有的物品。
      要求：
      1. 识别出具体的【品牌】和【完整产品名】（例如：不要只说"面霜"，要说"雅诗兰黛小棕瓶面霜"；不要只说"精华"，要说"倩碧美白精华"；不要只说"面膜"，要说"资生堂悦薇面膜"）。
      2. 准确识别每种物品的【数量】。
      3. 为每种物品选择合适的【单位】（如：瓶、盒、支、袋、个）。
      4. 即使图片中有几十种不同的物品，也要逐一列出，不要合并。
      5. 如果看到包装上的详细规格（如 50ml, 100g），请一并写在产品名中。
      
      请以 JSON 数组格式返回。每个对象包含：
      "item" (string: 品牌+产品全名+规格), 
      "quantity" (number: 数量), 
      "unit" (string: 单位)。`;

      const response = await ai.models.generateContent({
        model: currentModel,
        contents: [
          { text: prompt },
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                item: { type: Type.STRING },
                quantity: { type: Type.NUMBER },
                unit: { type: Type.STRING }
              },
              required: ["item", "quantity", "unit"]
            }
          }
        }
      });

      const detected = JSON.parse(response.text);
      setItems(detected.map((d: any) => ({
        tempId: Math.random().toString(36).substr(2, 9),
        name: d.item,
        quantity: d.quantity,
        unit: d.unit || (lang === 'en' ? 'pcs' : '个'),
        containerId: globalContainerId
      })));
    } catch (err) {
      console.error("AI识别错误:", err);
      setItems([{ tempId: 'error-fallback', name: '识别失败，请点击右侧按钮手动添加', quantity: 1, unit: lang === 'en' ? 'pcs' : '个' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = (tempId: string, updates: Partial<DetectedItem>) => {
    setItems(prev => prev.map(item => item.tempId === tempId ? { ...item, ...updates } : item));
  };

  const handleAddNewItem = () => {
    setItems(prev => [...prev, {
      tempId: Math.random().toString(36).substr(2, 9),
      name: '',
      quantity: 1,
      unit: lang === 'en' ? 'pcs' : '个',
      containerId: globalContainerId
    }]);
  };

  const handleRemoveItem = (tempId: string) => {
    setItems(prev => prev.filter(item => item.tempId !== tempId));
  };

  const handleApplyGlobalContainer = (cid: string) => {
    setGlobalContainerId(cid);
    setItems(prev => prev.map(item => ({ ...item, containerId: cid })));
  };

  const handleSaveAll = () => {
    const validItems = items.filter(i => i.name.trim().length > 0);
    validItems.forEach(item => {
      addItem({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        locationId: locationId!,
        containerId: item.containerId,
        tags: []
      });
    });
    navigate(`/location/${locationId}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-40">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white text-pink-400 hover:bg-pink-50 rounded-full flex items-center justify-center shadow-sm border border-pink-100 transition-all">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-black text-pink-600">{t('batchScan', lang)}</h1>
        </div>
        {!loading && items.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-1.5 bg-pink-100 text-pink-600 rounded-full font-black text-xs uppercase tracking-widest border border-pink-200">
             <Sparkles size={14} />
             {items.length} {lang === 'zh' ? '个物品已精准识别' : 'items identified'}
          </div>
        )}
      </header>

      {/* Model Engine Switcher for Batch Scan */}
      {!loading && items.length === 0 && !capturedImage && (
        <div className="flex items-center justify-center gap-4 bg-white p-4 rounded-3xl border-2 border-pink-50 shadow-sm">
            <span className="text-xs font-black text-pink-400 uppercase tracking-widest flex items-center gap-2">
                <Settings2 size={16} />
                {t('aiEngine', lang)}:
            </span>
            <div className="flex bg-pink-50 p-1 rounded-2xl border border-pink-100">
                <button 
                onClick={() => setSelectedModel('gemini-2.5-flash')}
                className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${state.selectedModel === 'gemini-2.5-flash' ? 'bg-pink-500 text-white shadow-md' : 'text-pink-300'}`}
                >
                2.5 Flash
                </button>
                <button 
                onClick={() => setSelectedModel('gemini-3-flash-preview')}
                className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${state.selectedModel === 'gemini-3-flash-preview' ? 'bg-pink-500 text-white shadow-md' : 'text-pink-300'}`}
                >
                3.0 Flash
                </button>
            </div>
        </div>
      )}

      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6">
          <div className="relative w-full max-w-md aspect-square bg-slate-900 rounded-[3rem] overflow-hidden border-4 border-pink-300 shadow-2xl">
             <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
             <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="w-64 h-64 border-2 border-dashed border-white/50 rounded-3xl"></div>
                <p className="mt-4 text-white/70 text-sm font-bold bg-black/40 px-4 py-1 rounded-full backdrop-blur-md">请确保物品标签清晰可见</p>
             </div>
          </div>
          <div className="mt-8 flex gap-6">
             <button onClick={stopCamera} className="w-16 h-16 bg-white/10 text-white rounded-full flex items-center justify-center backdrop-blur-md border border-white/20">
                <X size={32} />
             </button>
             <button onClick={handleCapture} className="w-20 h-20 bg-pink-500 text-white rounded-full flex items-center justify-center border-4 border-white shadow-2xl scale-110 active:scale-90 transition-all">
                <Camera size={40} />
             </button>
          </div>
        </div>
      )}

      {!capturedImage && !loading && (
        <div className="bg-white p-12 rounded-[3.5rem] border-2 border-pink-100 shadow-xl flex flex-col items-center text-center space-y-8 animate-[fadeIn_0.5s_ease-out]">
           <div className="relative w-32 h-32 bg-pink-50 text-pink-300 rounded-full flex items-center justify-center">
             <Sparkles size={64} />
             <div className="absolute -top-2 -right-2 text-4xl animate-bounce">🎀</div>
           </div>
           <div className="space-y-3 px-4">
             <h2 className="text-2xl font-black text-pink-600 uppercase tracking-widest">{t('batchScan', lang)}</h2>
             <p className="text-pink-300 font-medium max-w-sm mx-auto leading-relaxed">
               {lang === 'zh' ? '上传或拍一张含有多件物品的照片（如：雅诗兰黛面霜、倩碧精华等），AI 会自动提取详细品牌与数量。' : 'Upload or take a photo of multiple items (e.g. serums, creams). AI will identify specific brands and quantities.'}
             </p>
           </div>
           
           <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
             <button 
              onClick={startCamera}
              className="flex-1 hk-button-primary px-8 py-5 rounded-full font-black flex items-center justify-center gap-3 text-lg shadow-xl shadow-pink-200 transition-all hover:scale-105 active:scale-95"
             >
               <Camera size={24} />
               {t('takePhoto', lang)}
             </button>
             
             <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 bg-white border-2 border-pink-200 text-pink-500 px-8 py-5 rounded-full font-black flex items-center justify-center gap-3 text-lg shadow-lg hover:bg-pink-50 transition-all hover:scale-105 active:scale-95"
             >
               <Upload size={24} />
               {lang === 'zh' ? '上传图片' : 'Upload Image'}
             </button>
             <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileUpload}
             />
           </div>
        </div>
      )}

      {loading && (
        <div className="bg-white p-10 rounded-[3rem] border-2 border-pink-100 shadow-xl flex flex-col items-center justify-center space-y-8 min-h-[500px]">
           <div className="relative w-40 h-40">
              <div className="absolute inset-0 border-8 border-pink-50 rounded-full"></div>
              <div className="absolute inset-0 border-8 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-8 bg-pink-50 rounded-full flex items-center justify-center text-pink-400">
                 <Sparkles size={56} className="animate-pulse" />
              </div>
              <div className="absolute top-0 left-1/2 -ml-[2px] w-1 h-1/2 bg-gradient-to-t from-pink-500 to-transparent origin-bottom animate-[spin_3s_linear_infinite]"></div>
           </div>
           <div className="text-center space-y-2">
             <p className="text-2xl font-black text-pink-500">{t('scanningShelf', lang)}</p>
             <p className="text-pink-300 font-bold italic animate-pulse">正在深度分析每一个物品的品牌与规格...</p>
             <p className="text-xs text-pink-200 font-black uppercase tracking-tighter mt-2">Using {state.selectedModel}</p>
           </div>
        </div>
      )}

      {items.length > 0 && !loading && (
        <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
          {/* 顶部预览图与批量操作 */}
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-1/3 aspect-video lg:aspect-square bg-white p-2 rounded-[2.5rem] border-2 border-pink-100 shadow-inner overflow-hidden">
               <img src={capturedImage!} className="w-full h-full object-cover rounded-[2rem]" alt="Preview" />
            </div>

            <div className="flex-1 bg-gradient-to-r from-pink-50 to-white p-6 rounded-[2.5rem] border-2 border-pink-100 flex flex-col justify-center gap-6 shadow-sm">
               <div className="flex items-center gap-4">
                 <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-pink-500 shadow-md">
                   <LayoutGrid size={28} />
                 </div>
                 <div>
                   <h3 className="font-black text-pink-600 text-sm uppercase tracking-widest">批量存放位置 / Batch Target</h3>
                   <p className="text-xs text-pink-300 font-bold mt-0.5">为以下所有识别出的物品指定共同隔层</p>
                 </div>
               </div>
               
               <div className="flex gap-2">
                 <select 
                  value={globalContainerId}
                  onChange={e => handleApplyGlobalContainer(e.target.value)}
                  className="flex-1 border-2 border-white bg-white px-5 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-pink-100 font-bold text-slate-600 shadow-sm"
                 >
                   <option value="">{lang === 'zh' ? '选择统一存放的隔层...' : 'Batch to shelf...'}</option>
                   {state.containers.filter(c => c.locationId === locationId).map(c => (
                     <option key={c.id} value={c.id}>🎀 {c.name}</option>
                   ))}
                 </select>
                 <button 
                  onClick={handleAddNewItem}
                  className="bg-white p-4 rounded-2xl text-pink-500 hover:bg-pink-100 transition-all border-2 border-white shadow-md flex items-center gap-2 font-black text-sm"
                 >
                   <ListPlus size={24} />
                 </button>
               </div>
            </div>
          </div>

          {/* 物品清单列表 */}
          <div className="grid grid-cols-1 gap-4">
            {items.map((item, index) => (
              <div key={item.tempId} className="hk-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-pink-400 hover:shadow-xl transition-all relative">
                <div className="flex-1 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-pink-50 text-pink-400 flex items-center justify-center text-sm font-black border border-pink-100 flex-shrink-0 mt-1">
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-1">
                       <label className="text-[10px] font-black text-pink-300 uppercase tracking-widest ml-1">识别出的精准信息</label>
                       <input 
                        type="text" 
                        value={item.name}
                        onChange={e => handleUpdateItem(item.tempId, { name: e.target.value })}
                        className="w-full text-lg font-black text-slate-700 bg-slate-50 border-2 border-transparent focus:border-pink-300 focus:bg-white px-5 py-3 rounded-2xl outline-none transition-all"
                        placeholder={lang === 'en' ? "Brand + Product Name..." : "品牌 + 产品全名..."}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 pl-14">
                    <div className="flex items-center gap-2 px-3 py-1 bg-pink-50/50 rounded-full border border-pink-50">
                       <LayoutGrid size={12} className="text-pink-300" />
                       <select 
                        value={item.containerId || ''}
                        onChange={e => handleUpdateItem(item.tempId, { containerId: e.target.value })}
                        className="text-[10px] font-black uppercase tracking-widest text-pink-400 bg-transparent outline-none cursor-pointer"
                      >
                        <option value="">{lang === 'zh' ? '暂无隔层' : 'No Shelf'}</option>
                        {state.containers.filter(c => c.locationId === locationId).map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-5 pl-14 md:pl-0">
                  <div className="flex items-center bg-white rounded-3xl p-1.5 border-2 border-pink-50 shadow-inner">
                    <button onClick={() => handleUpdateItem(item.tempId, { quantity: Math.max(0, item.quantity - 1) })} className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-pink-50 text-pink-300 transition-all">
                      <Minus size={18} />
                    </button>
                    <div className="flex flex-col items-center min-w-[80px]">
                       <span className="font-black text-slate-800 text-xl leading-none">{item.quantity}</span>
                       <input 
                        type="text" 
                        value={item.unit}
                        onChange={e => handleUpdateItem(item.tempId, { unit: e.target.value })}
                        className="text-[10px] font-black uppercase text-pink-300 bg-transparent text-center w-full outline-none mt-1.5 focus:text-pink-500"
                        placeholder="单位"
                       />
                    </div>
                    <button onClick={() => handleUpdateItem(item.tempId, { quantity: item.quantity + 1 })} className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-pink-50 text-pink-300 transition-all">
                      <Plus size={18} />
                    </button>
                  </div>
                  <button 
                    onClick={() => handleRemoveItem(item.tempId)} 
                    className="p-3 text-pink-100 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all md:opacity-0 md:group-hover:opacity-100"
                  >
                    <Trash2 size={22} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 底部悬浮操作栏 */}
          <div className="fixed bottom-0 left-0 right-0 p-6 md:p-10 bg-gradient-to-t from-pink-50/95 via-pink-50/80 to-transparent backdrop-blur-sm pointer-events-none z-40">
            <div className="max-w-4xl mx-auto flex gap-4 pointer-events-auto">
              <button 
                onClick={() => {
                  setCapturedImage(null);
                  setItems([]);
                }}
                className="flex-1 px-8 py-5 bg-white border-4 border-pink-100 text-pink-400 rounded-[2.5rem] font-black hover:bg-pink-50 transition-all shadow-xl"
              >
                {lang === 'zh' ? '重新上传' : 'Retake'}
              </button>
              <button 
                onClick={handleSaveAll}
                className="flex-[2.5] px-8 py-5 hk-button-primary text-white rounded-[2.5rem] font-black flex items-center justify-center gap-3 shadow-2xl shadow-pink-200 group relative overflow-hidden transition-all hover:scale-[1.02] active:scale-98"
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                <CheckCircle2 size={30} />
                <span className="text-xl">{t('confirmAndAdd', lang)}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 底部信息提示 */}
      {items.length > 0 && !loading && (
        <div className="flex items-center gap-2 justify-center text-pink-300 text-xs font-bold py-8">
           <Info size={14} />
           <span>提示：你可以核对识别出的品牌名、规格及数量，确认无误后点击“确认并添加全部”</span>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default BatchScanPage;
