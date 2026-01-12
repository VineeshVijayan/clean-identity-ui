import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { getUserRoles, logout as logoutService } from "@/services/jwt-service";
import { SESSION_BASE_URL } from "@/services/api-config";

interface DecodedToken {
  userName?: string;
  name?: string;
  roles?: string | string[];
  userId?: string;
  sub?: string;
  employeeId?: string;
  connectorUserId?: string;
  exp: number;
}

interface User {
  name: string;
  email: string;
  userId: string;
  employeeId: string;
  connectorUserId: string;
}

interface UseAuthReturn {
  isLoggedIn: boolean;
  user: User | null;
  roles: string[];
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasRole: (role: string) => boolean;
  hasAllRoles: (roles: string[]) => boolean;
}

export const useAuth = (): UseAuthReturn => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const checkAuth = useCallback(() => {
    const authToken = localStorage.getItem("auth-token");
    const storedUser = localStorage.getItem("user");
    const storedRoles = getUserRoles();

    if (authToken && storedUser) {
      try {
        const decoded = jwtDecode<DecodedToken>(authToken);
        if (decoded.exp * 1000 > Date.now()) {
          setIsLoggedIn(true);
          setUser(JSON.parse(storedUser));
          setRoles(storedRoles);
        } else {
          // Token expired
          logoutService();
          setIsLoggedIn(false);
          setUser(null);
          setRoles([]);
        }
      } catch {
        setIsLoggedIn(false);
        setUser(null);
        setRoles([]);
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
      setRoles([]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
    window.addEventListener("auth-change", checkAuth);
    return () => window.removeEventListener("auth-change", checkAuth);
  }, [checkAuth]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // For demo purposes, simulate successful login
      // In production, this would call the actual API:
      // const response = await fetch(`${SESSION_BASE_URL}/authenticate`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email, password }),
      // });

      // Simulate API response for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a mock token for demo (in production, this comes from API)
      const mockUser = {
        name: email.split("@")[0],
        email,
        userId: "user-" + Date.now(),
        employeeId: "EMP-001",
        connectorUserId: "connector-001",
      };

      // Store mock data
      localStorage.setItem("auth-token", "demo-token-" + Date.now());
      localStorage.setItem("user", JSON.stringify(mockUser));
      localStorage.setItem("roles", JSON.stringify(["super_admin", "user"]));

      window.dispatchEvent(new Event("auth-change"));
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Invalid credentials" };
    }
  };

  const logout = useCallback(() => {
    logoutService();
    setIsLoggedIn(false);
    setUser(null);
    setRoles([]);
    navigate("/");
  }, [navigate]);

  const hasRole = useCallback((role: string) => roles.includes(role), [roles]);
  
  const hasAllRoles = useCallback(
    (requiredRoles: string[]) => requiredRoles.every((r) => roles.includes(r)),
    [roles]
  );

  return {
    isLoggedIn,
    user,
    roles,
    isLoading,
    login,
    logout,
    hasRole,
    hasAllRoles,
  };
};
