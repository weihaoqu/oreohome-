
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { InventoryState, Location, Container, InventoryItem, User, Language } from '../types';

interface InventoryContextType {
  state: InventoryState;
  lang: Language;
  setLang: (l: Language) => void;
  addLocation: (l: Omit<Location, 'id'>) => void;
  updateLocation: (id: string, l: Partial<Location>) => void;
  addContainer: (c: Omit<Container, 'id'>) => void;
  updateContainer: (id: string, c: Partial<Container>) => void;
  addItem: (i: Omit<InventoryItem, 'id' | 'updatedAt'>) => void;
  updateItem: (id: string, i: Partial<InventoryItem>) => void;
  deleteItem: (id: string) => void;
  adjustQuantity: (id: string, delta: number) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('homesync_lang');
    return (saved as Language) || 'zh';
  });

  const [state, setState] = useState<InventoryState>(() => {
    const saved = localStorage.getItem('homesync_state');
    if (saved) return JSON.parse(saved);
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
      currentUserId: 'u1'
    };
  });

  useEffect(() => {
    localStorage.setItem('homesync_state', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    localStorage.setItem('homesync_lang', lang);
  }, [lang]);

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

  return (
    <InventoryContext.Provider value={{ 
      state, lang, setLang, addLocation, updateLocation, addContainer, updateContainer, addItem, updateItem, deleteItem, adjustQuantity 
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
