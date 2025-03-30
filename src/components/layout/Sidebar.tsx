
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  ChevronRight, 
  LayoutDashboard, 
  Rocket, 
  FlaskConical, 
  Wrench, 
  Video,
  Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      icon: LayoutDashboard,
      name: "Dashboard",
      path: "/dashboard"
    },
    {
      icon: Rocket,
      name: "Airdrops",
      path: "/airdrops"
    },
    {
      icon: Trophy,
      name: "Rankings",
      path: "/airdrops-ranking"
    },
    {
      icon: FlaskConical,
      name: "Testnets",
      path: "/testnets"
    },
    {
      icon: Wrench,
      name: "Tools",
      path: "/tools"
    },
    {
      icon: Video,
      name: "Videos",
      path: "/videos"
    }
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div 
        className={cn(
          "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-crypto-darker border-r border-border/40 transition-all duration-300 hidden md:block",
          collapsed ? "w-20" : "w-64"
        )}
      >
        <div className="p-4">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute right-0 top-4 transform translate-x-1/2 bg-primary rounded-full p-1 text-white"
          >
            <ChevronRight className={cn("h-4 w-4 transition-transform", collapsed ? "" : "rotate-180")} />
          </button>
          
          <nav className="mt-8 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center p-3 rounded-lg transition-colors",
                  location.pathname === item.path 
                    ? "bg-primary/10 text-primary" 
                    : "text-foreground hover:bg-accent/50"
                )}
              >
                <item.icon className="h-5 w-5" />
                {!collapsed && (
                  <span className="ml-3 flex items-center">
                    {item.name}
                    {item.name === "Dashboard" && user?.level && (
                      <span className="ml-auto bg-crypto-green text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {user.level}
                      </span>
                    )}
                  </span>
                )}
                {collapsed && user?.level && item.name === "Dashboard" && (
                  <span className="absolute -right-1 -top-1 bg-crypto-green text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {user.level}
                  </span>
                )}
              </Link>
            ))}
          </nav>
          
          {!collapsed && user?.achievements && user.achievements.length > 0 && (
            <div className="mt-8 border-t border-border/40 pt-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Achievements</h3>
              <div className="space-y-2">
                {user.achievements.slice(0, 3).map((achievement) => (
                  <div key={achievement.id} className="flex items-center bg-primary/5 p-2 rounded-md">
                    <div className="h-6 w-6 bg-crypto-green/20 rounded-full flex items-center justify-center mr-2">
                      <Trophy className="h-3 w-3 text-crypto-green" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{achievement.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar (Bottom Navigation) */}
      <div className="fixed bottom-0 left-0 right-0 bg-crypto-darker border-t border-border/40 md:hidden">
        <div className="flex justify-around">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center py-3 px-2",
                location.pathname === item.path 
                  ? "text-primary" 
                  : "text-foreground/70 hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.name}</span>
              {user?.level && item.name === "Dashboard" && (
                <span className="absolute top-2 right-1/2 ml-5 bg-crypto-green text-black text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {user.level}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
