
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";
import { 
  ProfileUser, 
  Achievement, 
  AuthContextType 
} from "@/types/auth";
import {
  AIRDROP_CATEGORIES_KEY,
  TESTNET_CATEGORIES_KEY,
  TOOL_CATEGORIES_KEY,
  VIDEO_CATEGORIES_KEY,
  defaultAirdropCategories,
  defaultTestnetCategories,
  defaultToolCategories,
  defaultVideoCategories,
  loadCategories,
  addCategoryToList
} from "@/utils/categoryUtils";
import {
  fetchUserProfile,
  registerUser
} from "@/utils/authUtils";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
    setAirdropCategories(loadCategories(AIRDROP_CATEGORIES_KEY, defaultAirdropCategories));
    setTestnetCategories(loadCategories(TESTNET_CATEGORIES_KEY, defaultTestnetCategories));
    setToolCategories(loadCategories(TOOL_CATEGORIES_KEY, defaultToolCategories));
    setVideoCategories(loadCategories(VIDEO_CATEGORIES_KEY, defaultVideoCategories));
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
            const profileUser = await fetchUserProfile(currentSession.user.id);
            if (profileUser) {
              setUser(profileUser);
            }
            setIsLoading(false);
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
        fetchUserProfile(currentSession.user.id)
          .then(profileUser => {
            if (profileUser) {
              setUser(profileUser);
            }
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
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
    return registerUser(username, email, password, inviteCode);
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
        setAirdropCategories(prev => addCategoryToList(prev, category, AIRDROP_CATEGORIES_KEY));
        break;
      case "testnet":
        setTestnetCategories(prev => addCategoryToList(prev, category, TESTNET_CATEGORIES_KEY));
        break;
      case "tool":
        setToolCategories(prev => addCategoryToList(prev, category, TOOL_CATEGORIES_KEY));
        break;
      case "video":
        setVideoCategories(prev => addCategoryToList(prev, category, VIDEO_CATEGORIES_KEY));
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
