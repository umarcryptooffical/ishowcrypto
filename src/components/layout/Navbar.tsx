
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Menu } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

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
          <Link to="/airdrops-ranking" className="text-foreground/70 hover:text-foreground transition-colors">
            Rankings
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-foreground/70 hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <Link to="/airdrops" className="text-foreground/70 hover:text-foreground transition-colors">
                Airdrops
              </Link>
              <Link to="/testnets" className="text-foreground/70 hover:text-foreground transition-colors">
                Testnets
              </Link>
              <Link to="/tools" className="text-foreground/70 hover:text-foreground transition-colors">
                Tools
              </Link>
              <Button onClick={logout} variant="ghost" size="sm">
                Logout
              </Button>
              <div className="w-8 h-8 rounded-full bg-crypto-green/20 flex items-center justify-center text-xs font-medium">
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
        
        <div className="md:hidden flex items-center">
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-crypto-darker border-b border-border/40 py-2">
          <div className="container space-y-2">
            <Link to="/" className="block py-2 text-foreground/70 hover:text-foreground">
              Home
            </Link>
            <Link to="/videos" className="block py-2 text-foreground/70 hover:text-foreground">
              Videos
            </Link>
            <Link to="/airdrops-ranking" className="block py-2 text-foreground/70 hover:text-foreground">
              Rankings
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="block py-2 text-foreground/70 hover:text-foreground">
                  Dashboard
                </Link>
                <Link to="/airdrops" className="block py-2 text-foreground/70 hover:text-foreground">
                  Airdrops
                </Link>
                <Link to="/testnets" className="block py-2 text-foreground/70 hover:text-foreground">
                  Testnets
                </Link>
                <Link to="/tools" className="block py-2 text-foreground/70 hover:text-foreground">
                  Tools
                </Link>
                <Button onClick={logout} variant="ghost" className="w-full justify-start" size="sm">
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link to="/login">
                  <Button variant="ghost" className="w-full justify-start" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="default" className="w-full justify-start" size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
