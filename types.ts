
export type Language = 'en' | 'zh';
export type AIModel = 'gemini-2.5-flash' | 'gemini-3-flash-preview';

export interface User {
  id: string;
  name: string;
  avatar?: string;
}

export interface Container {
  id: string;
  name: string;
  locationId: string;
  photoUrl?: string;
}

export interface Location {
  id: string;
  name: string;
  description?: string;
  photoUrl?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  locationId: string;
  containerId?: string;
  updatedAt: number;
  tags: string[];
  photoUrl?: string;  // 物品图片
}

export interface PromptHistoryEntry {
  id: string;
  timestamp: number;
  prompt: string;
  model: AIModel;
  type: 'voice' | 'photo' | 'batch_scan';
  responseSummary: string;
}

export interface DevPrompt {
  id: string;
  timestamp: number;
  content: string;
  version: string;
}

export interface InventoryState {
  locations: Location[];
  containers: Container[];
  items: InventoryItem[];
  members: User[];
  currentUserId: string;
  selectedModel: AIModel;
  promptHistory: PromptHistoryEntry[];
  developmentPrompts: DevPrompt[];
}
