
import { User, Session } from "@supabase/supabase-js";

export interface ProfileUser {
  id: string;
  username: string;
  email: string;
  isAdmin?: boolean;
  canUploadVideos?: boolean;
  level?: number;
  achievements?: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  dateEarned: number;
}

export interface AuthContextType {
  user: ProfileUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (username: string, email: string, password: string, inviteCode?: string) => Promise<boolean>;
  addCategory: (type: "airdrop" | "testnet" | "tool" | "video", category: string) => boolean;
  getCategories: (type: "airdrop" | "testnet" | "tool" | "video") => string[];
  awardAchievement: (achievement: Omit<Achievement, "id" | "dateEarned">) => void;
}
