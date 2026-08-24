import {
  getUserRoles,
  initializeAuthSession,
  logout,
} from "@/services/jwt-service";
import { clearSessionAndRedirect } from "@/services/auth-service";
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { DashboardNavbar } from "./DashboardNavbar";
import { DashboardSidebar } from "./DashboardSidebar";

export const DashboardLayout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      const valid = await initializeAuthSession();

      if (cancelled) return;

      if (!valid) {
        clearSessionAndRedirect();
        return;
      }

      try {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
          const parsed = JSON.parse(storedUser);

          setUser({
            name: parsed.name,
            email: parsed.email,
          });
        }
      } catch {
        setUser({
          name: "User",
          email: "user@example.com",
        });
      }

      setRoles(getUserRoles());
      setAuthReady(true);
    };

    checkAuth();
    window.addEventListener("auth-change", checkAuth);

    return () => {
      cancelled = true;
      window.removeEventListener("auth-change", checkAuth);
    };
  }, [navigate]);

  const handleLogout = () => {
    void logout();
  };

  if (!authReady) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        roles={roles}
        onLogout={handleLogout}
      />

      <div className="flex min-h-screen flex-1 flex-col lg:ml-72">
        <DashboardNavbar
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
