
import { createContext, useContext, useState, useEffect } from "react";

// Define the User type with the password field and admin capabilities
interface User {
  id: string;
  username: string;
  email: string;
  password?: string; // Make password optional so it can be removed after login
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

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  register: (username: string, email: string, password: string) => boolean;
  addCategory: (type: "airdrop" | "testnet" | "tool" | "video", category: string) => boolean;
  getCategories: (type: "airdrop" | "testnet" | "tool" | "video") => string[];
  awardAchievement: (achievement: Omit<Achievement, "id" | "dateEarned">) => void;
}

// Store categories in localStorage
const AIRDROP_CATEGORIES_KEY = "crypto_tracker_airdrop_categories";
const TESTNET_CATEGORIES_KEY = "crypto_tracker_testnet_categories";
const TOOL_CATEGORIES_KEY = "crypto_tracker_tool_categories";
const VIDEO_CATEGORIES_KEY = "crypto_tracker_video_categories";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default categories
const defaultAirdropCategories = [
  'Layer 1 & Testnet Mainnet',
  'Telegram Bot Airdrops',
  'Daily Check-in Airdrops',
  'Twitter Airdrops',
  'Social Airdrops',
  'AI Airdrops',
  'Wallet Airdrops',
  'Exchange Airdrops',
];

const defaultTestnetCategories = [
  'Galxe Testnet',
  'Bridge Mining',
  'Mining Sessions',
];

const defaultToolCategories = [
  'Wallet Connect',
  'Airdrop Claim Checker',
  'Gas Fee Calculator',
  'Testnet Token Faucets',
  'Crypto Wallet Extensions',
  'Swaps & Bridges',
];

const defaultVideoCategories = [
  'Crypto Series',
  'Top Testnets',
  'Mining Projects',
];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [airdropCategories, setAirdropCategories] = useState<string[]>(defaultAirdropCategories);
  const [testnetCategories, setTestnetCategories] = useState<string[]>(defaultTestnetCategories);
  const [toolCategories, setToolCategories] = useState<string[]>(defaultToolCategories);
  const [videoCategories, setVideoCategories] = useState<string[]>(defaultVideoCategories);

  // Load categories on init
  useEffect(() => {
    const storedAirdropCategories = localStorage.getItem(AIRDROP_CATEGORIES_KEY);
    const storedTestnetCategories = localStorage.getItem(TESTNET_CATEGORIES_KEY);
    const storedToolCategories = localStorage.getItem(TOOL_CATEGORIES_KEY);
    const storedVideoCategories = localStorage.getItem(VIDEO_CATEGORIES_KEY);

    if (storedAirdropCategories) {
      setAirdropCategories(JSON.parse(storedAirdropCategories));
    } else {
      localStorage.setItem(AIRDROP_CATEGORIES_KEY, JSON.stringify(defaultAirdropCategories));
    }

    if (storedTestnetCategories) {
      setTestnetCategories(JSON.parse(storedTestnetCategories));
    } else {
      localStorage.setItem(TESTNET_CATEGORIES_KEY, JSON.stringify(defaultTestnetCategories));
    }

    if (storedToolCategories) {
      setToolCategories(JSON.parse(storedToolCategories));
    } else {
      localStorage.setItem(TOOL_CATEGORIES_KEY, JSON.stringify(defaultToolCategories));
    }

    if (storedVideoCategories) {
      setVideoCategories(JSON.parse(storedVideoCategories));
    } else {
      localStorage.setItem(VIDEO_CATEGORIES_KEY, JSON.stringify(defaultVideoCategories));
    }
  }, []);

  useEffect(() => {
    const storedAuth = localStorage.getItem("auth");
    if (storedAuth) {
      const authData = JSON.parse(storedAuth);
      setUser(authData.user);
      setIsAuthenticated(authData.isAuthenticated);
    }
    setIsLoading(false);
  }, []);

  const users: User[] = [
    {
      id: "1",
      username: "oneuser",
      email: "one@gmail.com",
      password: "Ishow@123",
      isAdmin: false,
      canUploadVideos: false,
      level: 1,
      achievements: [],
    },
    {
      id: "2",
      username: "Admin User",
      email: "admin@example.com",
      password: "adminpassword",
      isAdmin: true,
      canUploadVideos: true,
      level: 5,
      achievements: [],
    },
    {
      id: "3",
      username: "UmarCryptospace",
      email: "malickirfan00@gmail.com",
      password: "Irfan@123#13",
      isAdmin: true,
      canUploadVideos: true,
      level: 10,
      achievements: [
        {
          id: "1",
          name: "Crypto Master",
          description: "Achieved the highest level in the system",
          icon: "award",
          dateEarned: Date.now(),
        }
      ],
    }
  ];

  const login = (email: string, password: string) => {
    const user = users.find(
      (user) => user.email === email && user.password === password
    );
    
    if (user) {
      // After successful login, create a copy without the password
      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password;
      
      setUser(userWithoutPassword);
      setIsAuthenticated(true);

      localStorage.setItem(
        "auth",
        JSON.stringify({
          user: userWithoutPassword,
          isAuthenticated: true,
        })
      );
      return true;
    }
    
    return false;
  };

  const register = (username: string, email: string, password: string) => {
    // Check if this is the special user with full access
    const isSpecialUser = email === "malickirfan00@gmail.com" && 
                          username === "UmarCryptospace" && 
                          password === "Irfan@123#13";
    
    const newUser: User = {
      id: String(Date.now()),
      username,
      email,
      password,
      isAdmin: isSpecialUser,
      canUploadVideos: isSpecialUser,
      level: isSpecialUser ? 10 : 1,
      achievements: isSpecialUser ? [
        {
          id: "1",
          name: "Crypto Master",
          description: "Achieved the highest level in the system",
          icon: "award",
          dateEarned: Date.now(),
        }
      ] : [],
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("auth");
  };

  const addCategory = (type: "airdrop" | "testnet" | "tool" | "video", category: string) => {
    if (!user?.isAdmin) return false;
    
    switch (type) {
      case "airdrop":
        if (!airdropCategories.includes(category)) {
          const newCategories = [...airdropCategories, category];
          setAirdropCategories(newCategories);
          localStorage.setItem(AIRDROP_CATEGORIES_KEY, JSON.stringify(newCategories));
        }
        break;
      case "testnet":
        if (!testnetCategories.includes(category)) {
          const newCategories = [...testnetCategories, category];
          setTestnetCategories(newCategories);
          localStorage.setItem(TESTNET_CATEGORIES_KEY, JSON.stringify(newCategories));
        }
        break;
      case "tool":
        if (!toolCategories.includes(category)) {
          const newCategories = [...toolCategories, category];
          setToolCategories(newCategories);
          localStorage.setItem(TOOL_CATEGORIES_KEY, JSON.stringify(newCategories));
        }
        break;
      case "video":
        if (!videoCategories.includes(category)) {
          const newCategories = [...videoCategories, category];
          setVideoCategories(newCategories);
          localStorage.setItem(VIDEO_CATEGORIES_KEY, JSON.stringify(newCategories));
        }
        break;
    }
    
    return true;
  };

  const getCategories = (type: "airdrop" | "testnet" | "tool" | "video") => {
    switch (type) {
      case "airdrop":
        return airdropCategories;
      case "testnet":
        return testnetCategories;
      case "tool":
        return toolCategories;
      case "video":
        return videoCategories;
      default:
        return [];
    }
  };

  const awardAchievement = (achievement: Omit<Achievement, "id" | "dateEarned">) => {
    if (!user) return;
    
    const newAchievement: Achievement = {
      ...achievement,
      id: Date.now().toString(),
      dateEarned: Date.now(),
    };
    
    const updatedUser = {
      ...user,
      achievements: [...(user.achievements || []), newAchievement],
    };
    
    setUser(updatedUser);
    
    localStorage.setItem(
      "auth",
      JSON.stringify({
        user: updatedUser,
        isAuthenticated: true,
      })
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        register,
        addCategory,
        getCategories,
        awardAchievement,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
