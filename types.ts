
export type Language = 'en' | 'zh';

export interface User {
  id: string;
  name: string;
  avatar?: string;
}

export interface Container {
  id: string;
  name: string;
  locationId: string;
  photoUrl?: string; // Photo of the specific shelf/drawer
}

export interface Location {
  id: string;
  name: string;
  description?: string;
  photoUrl?: string; // Main photo of the room/cabinet
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
}

export interface InventoryState {
  locations: Location[];
  containers: Container[];
  items: InventoryItem[];
  members: User[];
  currentUserId: string;
}
