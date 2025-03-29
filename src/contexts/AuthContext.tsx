
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

type User = {
  id: string;
  email: string;
  username: string;
  canUploadVideos: boolean;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, inviteCode: string) => Promise<boolean>;
  register: (email: string, username: string, password: string, inviteCode: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock database for demonstration
const USERS_STORAGE_KEY = 'crypto_tracker_users';
const CURRENT_USER_KEY = 'crypto_tracker_current_user';
const INVITE_CODE = 'ishowcryptoairdrops';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user on initial mount
  useEffect(() => {
    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (e) {
        console.error('Failed to parse stored user:', e);
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    }
  }, []);

  const getUsers = (): User[] => {
    const users = localStorage.getItem(USERS_STORAGE_KEY);
    return users ? JSON.parse(users) : [];
  };

  const saveUsers = (users: User[]) => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  };

  const login = async (email: string, password: string, inviteCode: string): Promise<boolean> => {
    // Validate invite code
    if (inviteCode !== INVITE_CODE) {
      toast({
        title: "Invalid invite code",
        description: "Please enter the correct invite code to access the platform.",
        variant: "destructive",
      });
      return false;
    }

    const users = getUsers();
    const foundUser = users.find(u => u.email === email);

    if (!foundUser) {
      toast({
        title: "User not found",
        description: "No account found with this email. Please register first.",
        variant: "destructive",
      });
      return false;
    }

    // In a real app, we would hash the password and compare hashes
    if (password !== foundUser.password) {
      toast({
        title: "Invalid credentials",
        description: "The password you entered is incorrect.",
        variant: "destructive",
      });
      return false;
    }

    // Remove password from user object before storing in state
    const { password: _, ...userWithoutPassword } = foundUser;
    
    setUser(userWithoutPassword);
    setIsAuthenticated(true);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
    
    toast({
      title: "Welcome back!",
      description: `You're now logged in as ${foundUser.username}`,
    });
    
    return true;
  };

  const register = async (
    email: string, 
    username: string, 
    password: string, 
    inviteCode: string
  ): Promise<boolean> => {
    // Validate invite code
    if (inviteCode !== INVITE_CODE) {
      toast({
        title: "Invalid invite code",
        description: "Please enter the correct invite code to register.",
        variant: "destructive",
      });
      return false;
    }

    const users = getUsers();
    
    // Check if email is already registered
    if (users.some(u => u.email === email)) {
      toast({
        title: "Email already registered",
        description: "This email is already associated with an account.",
        variant: "destructive",
      });
      return false;
    }

    // Check if username is already taken
    if (users.some(u => u.username === username)) {
      toast({
        title: "Username already taken",
        description: "Please choose a different username.",
        variant: "destructive",
      });
      return false;
    }

    // Check for special user
    const isSpecialUser = (
      email === "malickirfan00@gmail.com" && 
      password === "Irfan@123#13" && 
      username === "UmarCryptospace"
    );

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email,
      username,
      password, // In a real app, we would hash this
      canUploadVideos: isSpecialUser,
    };

    // Save to "database"
    users.push(newUser);
    saveUsers(users);

    // Log the user in
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    setIsAuthenticated(true);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));

    toast({
      title: "Registration successful!",
      description: `Welcome to the platform, ${username}!`,
    });

    return true;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(CURRENT_USER_KEY);
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
