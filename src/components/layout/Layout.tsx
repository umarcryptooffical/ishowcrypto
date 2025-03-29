
import { Outlet } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/contexts/AuthContext";

const Layout = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        {isAuthenticated && (
          <Sidebar />
        )}
        <main className={`flex-1 p-4 md:p-6 ${isAuthenticated ? 'ml-0 md:ml-64' : ''}`}>
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
