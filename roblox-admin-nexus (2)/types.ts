
export enum UserRole {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE'
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  avatar: string;
  status: 'online' | 'offline' | 'busy';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string; // User ID
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

export type AccountMarketStatus = 'for_sale' | 'sold' | 'checking' | 'banned' | 'reserved';

export interface RobloxAccount {
  id: string;
  username: string;
  password?: string;
  cookie?: string;
  robuxBalance: number;
  premium: boolean;
  status: 'active' | 'banned' | '2fa_locked' | 'cooldown';
  marketStatus: AccountMarketStatus;
  lastChecked: Date;
  price?: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  isSystem?: boolean;
}

export interface AIChatMessage {
  role: 'user' | 'model';
  text: string;
  isLoading?: boolean;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  username: string;
  action: string;
  details: string;
  timestamp: Date;
}
