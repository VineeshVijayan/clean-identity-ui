import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  userName?: string;
  name?: string;
  role?: string;
  roles?: string | string[];
  userId?: string;
  sub?: string;
  employeeId?: string;
  connectorUserId?: string;
  designation?: string;
  exp: number;
}

interface UserDetails {
  userName: string;
  roles: string |string[];
  userId: string;
  employeeId: string;
}

/**
 * Checks if a user is logged in and the JWT token is valid (not expired)
 */
export const isUserLoggedIn = (): boolean => {
  const token = localStorage.getItem("auth-token");
  if (!token) return false;

  try {
    const decodedToken = jwtDecode<DecodedToken>(token);
    const currentDate = new Date();

    // JWT exp is in seconds
    if (decodedToken.exp * 1000 < currentDate.getTime()) {
      console.warn("Token expired");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Invalid Token:", error);
    return false;
  }
};

/**
 * Returns user details if the token is valid, otherwise null
 */
export const getUserDetails = (): UserDetails | null => {
  const token = localStorage.getItem("auth-token");
  if (!token) return null;

  try {
    const decodedToken = jwtDecode<DecodedToken>(token);

    if (Date.now() >= decodedToken.exp * 1000) {
      console.warn("Token expired");
      return null;
    }

    return {
      userName: decodedToken.userName || decodedToken.name || "",
      roles: decodedToken.roles || "",
      userId: decodedToken.userId || decodedToken.sub || "",
      employeeId: decodedToken.employeeId || "",
    };
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};

/**
 * Checks if the logged-in user has a manager-level role
 */
export const isManager = (): boolean => {
  const token = localStorage.getItem("auth-token");
  if (!token) return false;

  const userRoles = ["AM", "M", "PO"];
  const managerRoles = ["SM", "AVP", "VP", "GM"];

  try {
    const decodedToken = jwtDecode<DecodedToken>(token);
    const designation = decodedToken.designation;

    if (!designation) return false;

    if (userRoles.includes(designation)) {
      return false;
    } else if (managerRoles.includes(designation)) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Invalid token:", error);
    return false;
  }
};

/**
 * Get the logged-in user's ID
 */
export const getLoggedInUserId = (): string | null => {
  const token = localStorage.getItem("auth-token");
  if (!token) return null;

  try {
    const decodedToken = jwtDecode<DecodedToken>(token);
    return decodedToken.userId || decodedToken.sub || null;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};

/**
 * Get user roles from localStorage
 */
export const getUserRoles = (): string[] => {
  try {
    
    const parsed = getUserDetails()?.roles;
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
};

/**
 * Check if user has a specific role
 */
export const hasRole = (role: string): boolean => {
  const roles = getUserRoles();
  return roles.includes(role);
};

/**
 * Check if user has all specified roles
 */
export const hasAllRoles = (requiredRoles: string[]): boolean => {
  const roles = getUserRoles();
  return requiredRoles.every((r) => roles.includes(r));
};

/**
 * Logout user - clears all client-side cached data (localStorage,
 * sessionStorage, and Cache Storage) so the next user starts fresh.
 */
export const logout = (): void => {
  try {
    localStorage.clear();
  } catch (e) {
    console.warn("Failed clearing localStorage", e);
  }

  try {
    sessionStorage.clear();
  } catch (e) {
    console.warn("Failed clearing sessionStorage", e);
  }

  // Clear Cache Storage (service worker / fetch caches) if available
  try {
    if (typeof caches !== "undefined" && caches?.keys) {
      caches.keys().then((keys) => {
        keys.forEach((key) => caches.delete(key));
      }).catch(() => { /* noop */ });
    }
  } catch (e) {
    console.warn("Failed clearing caches", e);
  }

  // Best-effort cookie clear for non-HttpOnly cookies on current path
  try {
    document.cookie.split(";").forEach((c) => {
      const name = c.split("=")[0].trim();
      if (!name) return;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });
  } catch (e) {
    /* noop */
  }

  window.dispatchEvent(new Event("auth-change"));
};
