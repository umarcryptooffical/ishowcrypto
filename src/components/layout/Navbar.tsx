
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full bg-crypto-darker border-b border-border/40 shadow-md backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-crypto-green to-crypto-blue bg-clip-text text-transparent">
            ISHOWCRYPTO
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-4">
          <Link to="/" className="text-foreground/70 hover:text-foreground transition-colors">
            Home
          </Link>
          <Link to="/videos" className="text-foreground/70 hover:text-foreground transition-colors">
            Videos
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-foreground/70 hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <Button onClick={logout} variant="ghost" size="sm">
                Logout
              </Button>
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                {user?.username.charAt(0).toUpperCase()}
              </div>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="default" size="sm">
                  Register
                </Button>
              </Link>
            </>
          )}
        </nav>
        
        <div className="md:hidden">
          {isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <Button onClick={logout} variant="ghost" size="sm">
                Logout
              </Button>
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                {user?.username.charAt(0).toUpperCase()}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="default" size="sm">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
