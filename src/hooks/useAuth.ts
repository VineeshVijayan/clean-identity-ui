import { useState, useEffect, useCallback } from "react";
import {
  getUserRoles,
  initializeAuthSession,
  isUserLoggedIn,
  logout as logoutService,
} from "@/services/jwt-service";
import { getAuthErrorMessage, login as authLogin } from "@/services/auth-service";

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

  const checkAuth = useCallback(async () => {
    const storedUser = localStorage.getItem("user");
    const storedRoles = getUserRoles();

    if (!isUserLoggedIn()) {
      setIsLoggedIn(false);
      setUser(null);
      setRoles([]);
      setIsLoading(false);
      return;
    }

    const valid = await initializeAuthSession();
    if (!valid || !storedUser) {
      setIsLoggedIn(false);
      setUser(null);
      setRoles([]);
      setIsLoading(false);
      return;
    }

    setIsLoggedIn(true);
    setUser(JSON.parse(storedUser));
    setRoles(storedRoles);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
    window.addEventListener("auth-change", checkAuth);
    return () => window.removeEventListener("auth-change", checkAuth);
  }, [checkAuth]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await authLogin({ email, password });
      window.dispatchEvent(new Event("auth-change"));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: getAuthErrorMessage(error, "Invalid credentials"),
      };
    }
  };

  const logout = useCallback(() => {
    void logoutService();
    setIsLoggedIn(false);
    setUser(null);
    setRoles([]);
  }, []);

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
