
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";

// Define the User type
interface ProfileUser {
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

interface AuthContextType {
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
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
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

  // Initialize authentication state
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        
        if (currentSession?.user) {
          setIsAuthenticated(true);
          
          // Fetch user profile
          setTimeout(async () => {
            try {
              const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', currentSession.user.id)
                .single();
                
              if (error) throw error;
              
              if (data) {
                // Special handling for the admin user
                const isSpecialUser = data.email === "malickirfan00@gmail.com" && 
                                     data.username === "UmarCryptospace";

                // If it's our special user, make sure they have admin privileges
                if (isSpecialUser && (!data.is_admin || !data.is_video_creator)) {
                  // Update their privileges in the database
                  const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ 
                      is_admin: true, 
                      is_video_creator: true,
                      level: Math.max(data.level || 1, 10) // Give them a high level
                    })
                    .eq('id', currentSession.user.id);
                  
                  if (updateError) {
                    console.error("Error updating admin privileges:", updateError);
                  } else {
                    data.is_admin = true;
                    data.is_video_creator = true;
                    data.level = Math.max(data.level || 1, 10);
                  }
                }
                
                const profileUser: ProfileUser = {
                  id: data.id,
                  username: data.username,
                  email: data.email,
                  isAdmin: data.is_admin,
                  canUploadVideos: data.is_video_creator,
                  level: data.level || 1,
                  achievements: [],
                };
                setUser(profileUser);
              }
              setIsLoading(false);
            } catch (error) {
              console.error('Error fetching user profile:', error);
              setIsLoading(false);
            }
          }, 0);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      
      if (currentSession?.user) {
        setIsAuthenticated(true);
        // Fetch user profile
        supabase
          .from('profiles')
          .select('*')
          .eq('id', currentSession.user.id)
          .single()
          .then(({ data, error }) => {
            if (error) {
              console.error('Error fetching user profile:', error);
              setIsLoading(false);
              return;
            }
            
            if (data) {
              // Special handling for the admin user
              const isSpecialUser = data.email === "malickirfan00@gmail.com" && 
                                   data.username === "UmarCryptospace";

              // If it's our special user, make sure they have admin privileges
              if (isSpecialUser && (!data.is_admin || !data.is_video_creator)) {
                // Update their privileges in the database
                supabase
                  .from('profiles')
                  .update({ 
                    is_admin: true, 
                    is_video_creator: true,
                    level: Math.max(data.level || 1, 10) // Give them a high level
                  })
                  .eq('id', currentSession.user.id)
                  .then(({ error: updateError }) => {
                    if (updateError) {
                      console.error("Error updating admin privileges:", updateError);
                    } else {
                      data.is_admin = true;
                      data.is_video_creator = true;
                      data.level = Math.max(data.level || 1, 10);
                    }
                  });
              }
              
              const profileUser: ProfileUser = {
                id: data.id,
                username: data.username,
                email: data.email,
                isAdmin: data.is_admin,
                canUploadVideos: data.is_video_creator,
                level: data.level || 1,
                achievements: [],
              };
              setUser(profileUser);
            }
            setIsLoading(false);
          })
          .catch(err => {
            console.error('Error in profile fetch promise:', err);
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    }).catch(err => {
      console.error('Error getting session:', err);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const register = async (username: string, email: string, password: string, inviteCode?: string) => {
    try {
      // Special handling for the admin user
      const isSpecialUser = email === "malickirfan00@gmail.com" && 
                            username === "UmarCryptospace" && 
                            inviteCode === "Irfan@123#13";
                            
      // For this implementation, we'll use the inviteCode check just for the special user
      if (email === "malickirfan00@gmail.com" && !isSpecialUser) {
        toast({
          title: "Registration failed",
          description: "Invalid invite code for this account.",
          variant: "destructive",
        });
        return false;
      }
      
      // Regular registration logic
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            // Set admin flag for the special user
            is_admin: isSpecialUser,
            is_video_creator: isSpecialUser,
          },
        },
      });
      
      if (error) {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      
      // If it's the special user, update the profile directly
      if (isSpecialUser) {
        toast({
          title: "Admin Registration successful",
          description: "Welcome, Admin! You have full access to the platform.",
        });
      } else {
        toast({
          title: "Registration successful",
          description: "Please check your email to verify your account.",
        });
      }
      
      return true;
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
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
