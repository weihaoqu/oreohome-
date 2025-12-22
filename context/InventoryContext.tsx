
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { InventoryState, Location, Container, InventoryItem, User, Language, AIModel, PromptHistoryEntry, DevPrompt } from '../types';

interface InventoryContextType {
  state: InventoryState;
  lang: Language;
  setLang: (l: Language) => void;
  setSelectedModel: (m: AIModel) => void;
  addLocation: (l: Omit<Location, 'id'>) => void;
  updateLocation: (id: string, l: Partial<Location>) => void;
  addContainer: (c: Omit<Container, 'id'>) => void;
  updateContainer: (id: string, c: Partial<Container>) => void;
  addItem: (i: Omit<InventoryItem, 'id' | 'updatedAt'>) => void;
  updateItem: (id: string, i: Partial<InventoryItem>) => void;
  deleteItem: (id: string) => void;
  adjustQuantity: (id: string, delta: number) => void;
  addPromptHistory: (entry: Omit<PromptHistoryEntry, 'id' | 'timestamp'>) => void;
  clearPromptHistory: () => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

// 详细记录自项目开始以来的所有原始 Prompt
const INITIAL_DEV_PROMPTS: DevPrompt[] = [
  {
    id: 'p1',
    timestamp: 1715000000000,
    version: '1.0',
    content: "You are a senior full-stack engineer and product designer. I want to build a bilingual (Chinese + English) web app for home inventory management. The theme should be 'Hello Kitty' style (pink, cute, high aesthetics). Use Gemini API for AI-powered features like voice/photo recognition."
  },
  {
    id: 'p2',
    timestamp: 1715001000000,
    version: '1.1',
    content: "In the LocationFormPage, add file upload support for location photos in addition to camera capture. Updated UI to allow users to choose between taking a photo or uploading one from their gallery."
  },
  {
    id: 'p3',
    timestamp: 1715002000000,
    version: '1.2',
    content: "In the ItemFormPage, add a clear UI element (e.g., a dropdown or segmented control) that allows users to switch between 'gemini-2.5-flash' and 'gemini-3-flash-preview' AI models. This should be accessible before initiating an AI-powered action like voice or photo recognition."
  },
  {
    id: 'p4',
    timestamp: 1715003000000,
    version: '1.3',
    content: "add a button for prompt history, track all the prompts I asked so far."
  },
  {
    id: 'p5',
    timestamp: 1715004000000,
    version: '1.4',
    content: "the prompt history 是我从头开始构建这个app，问的所有的prompt的历史记录。"
  },
  {
    id: 'p6',
    timestamp: 1715005000000,
    version: '1.5',
    content: "更细节的prompt history，包含了所有我问的prompt"
  }
];

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('homesync_lang');
    return (saved as Language) || 'zh';
  });

  const [state, setState] = useState<InventoryState>(() => {
    const saved = localStorage.getItem('homesync_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.selectedModel) parsed.selectedModel = 'gemini-3-flash-preview';
      if (!parsed.promptHistory) parsed.promptHistory = [];
      // 始终同步最完整的开发历史记录
      parsed.developmentPrompts = INITIAL_DEV_PROMPTS;
      return parsed;
    }
    return {
      locations: [
        { id: '1', name: '玄关柜', description: '入户门旁边的柜子' },
        { id: '2', name: '厨房储藏间', description: '存放干货和调料' }
      ],
      containers: [
        { id: 'c1', name: '抽屉 A', locationId: '1' },
        { id: 'c2', name: '第一层架子', locationId: '2' }
      ],
      items: [
        { id: 'i1', name: '雨伞', quantity: 2, unit: '把', locationId: '1', containerId: 'c1', updatedAt: Date.now(), tags: ['日常'] },
        { id: 'i2', name: '生抽酱油', quantity: 1, unit: '瓶', locationId: '2', containerId: 'c2', updatedAt: Date.now(), tags: ['调料'] }
      ],
      members: [
        { id: 'u1', name: '管理员', avatar: 'https://picsum.photos/seed/admin/100' },
        { id: 'u2', name: '家庭成员', avatar: 'https://picsum.photos/seed/fam/100' }
      ],
      currentUserId: 'u1',
      selectedModel: 'gemini-3-flash-preview',
      promptHistory: [],
      developmentPrompts: INITIAL_DEV_PROMPTS
    };
  });

  useEffect(() => {
    localStorage.setItem('homesync_state', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    localStorage.setItem('homesync_lang', lang);
  }, [lang]);

  const setSelectedModel = (m: AIModel) => {
    setState(prev => ({ ...prev, selectedModel: m }));
  };

  const addLocation = (l: Omit<Location, 'id'>) => {
    setState(prev => ({
      ...prev,
      locations: [...prev.locations, { ...l, id: Math.random().toString(36).substr(2, 9) }]
    }));
  };

  const updateLocation = (id: string, l: Partial<Location>) => {
    setState(prev => ({
      ...prev,
      locations: prev.locations.map(loc => loc.id === id ? { ...loc, ...l } : loc)
    }));
  };

  const addContainer = (c: Omit<Container, 'id'>) => {
    setState(prev => ({
      ...prev,
      containers: [...prev.containers, { ...c, id: Math.random().toString(36).substr(2, 9) }]
    }));
  };

  const updateContainer = (id: string, c: Partial<Container>) => {
    setState(prev => ({
      ...prev,
      containers: prev.containers.map(cont => cont.id === id ? { ...cont, ...c } : cont)
    }));
  };

  const addItem = (i: Omit<InventoryItem, 'id' | 'updatedAt'>) => {
    setState(prev => ({
      ...prev,
      items: [...prev.items, { ...i, id: Math.random().toString(36).substr(2, 9), updatedAt: Date.now() }]
    }));
  };

  const updateItem = (id: string, i: Partial<InventoryItem>) => {
    setState(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, ...i, updatedAt: Date.now() } : item)
    }));
  };

  const deleteItem = (id: string) => {
    setState(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const adjustQuantity = (id: string, delta: number) => {
    setState(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta), updatedAt: Date.now() } : item
      )
    }));
  };

  const addPromptHistory = (entry: Omit<PromptHistoryEntry, 'id' | 'timestamp'>) => {
    setState(prev => ({
      ...prev,
      promptHistory: [
        {
          ...entry,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now()
        },
        ...prev.promptHistory
      ].slice(0, 100)
    }));
  };

  const clearPromptHistory = () => {
    setState(prev => ({ ...prev, promptHistory: [] }));
  };

  return (
    <InventoryContext.Provider value={{ 
      state, lang, setLang, setSelectedModel, addLocation, updateLocation, addContainer, updateContainer, addItem, updateItem, deleteItem, adjustQuantity, addPromptHistory, clearPromptHistory
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) throw new Error('useInventory must be used within InventoryProvider');
  return context;
};
