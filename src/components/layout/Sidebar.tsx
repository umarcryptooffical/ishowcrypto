
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  ChevronRight, 
  LayoutDashboard, 
  Rocket, 
  FlaskConical, 
  Wrench, 
  Video
} from "lucide-react";
import { cn } from "@/lib/utils";

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

const Sidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

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
                {!collapsed && <span className="ml-3">{item.name}</span>}
              </Link>
            ))}
          </nav>
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
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
