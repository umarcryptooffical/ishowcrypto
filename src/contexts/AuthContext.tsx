
import { createContext, useContext, useState, useEffect } from "react";

// Define the User type with the password field
interface User {
  id: string;
  username: string;
  email: string;
  password?: string; // Make password optional so it can be removed after login
  isAdmin?: boolean;
  canUploadVideos?: boolean; // Add this property for video upload permissions
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, inviteCode: string) => boolean;
  logout: () => void;
  register: (username: string, email: string, password: string, inviteCode: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Valid invite code for authentication
const VALID_INVITE_CODE = "ishowcryptoairdrops";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
    },
    {
      id: "2",
      username: "Admin User",
      email: "admin@example.com",
      password: "adminpassword",
      isAdmin: true,
      canUploadVideos: true,
    },
    {
      id: "3",
      username: "UmarCryptospace",
      email: "malickirfan00@gmail.com",
      password: "Irfan@123#13",
      isAdmin: true,
      canUploadVideos: true,
    }
  ];

  const login = (email: string, password: string, inviteCode: string) => {
    // Validate invite code
    if (inviteCode !== VALID_INVITE_CODE) {
      return false;
    }

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

  const register = (username: string, email: string, password: string, inviteCode: string) => {
    // Validate invite code
    if (inviteCode !== VALID_INVITE_CODE) {
      return false;
    }

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

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        register,
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
