import { getUserRoles, isUserLoggedIn, logout } from "@/services/jwt-service";
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { DashboardNavbar } from "./DashboardNavbar";
import { DashboardSidebar } from "./DashboardSidebar";

export const DashboardLayout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = isUserLoggedIn();
      const token = localStorage.getItem("auth-token");

      if (!loggedIn && !token) {
        navigate("/login", { replace: true });
        return;
      }

      setIsLoggedIn(true);

      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUser({ name: parsed.name, email: parsed.email });
        }
      } catch {
        setUser({ name: "User", email: "user@example.com" });
      }
      console.log(getUserRoles());
      setRoles(getUserRoles());
    };

    checkAuth();
    window.addEventListener("auth-change", checkAuth);

    // Prevent back-navigation to protected pages after logout/session-end
    // Push a history entry so that pressing back takes user out of the app
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      const token = localStorage.getItem("auth-token");
      if (!token) {
        window.history.pushState(null, "", "/login");
        navigate("/login", { replace: true });
      } else {
        window.history.pushState(null, "", window.location.href);
      }
    };
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("auth-change", checkAuth);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    logout();
    window.dispatchEvent(new Event("auth-change"));
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        roles={roles}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-h-screen">
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
