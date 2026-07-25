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
  roles: string | string[];
  userId: string;
  employeeId: string;
}

/**
 * Checks if a user is logged in and the JWT token is valid (not expired)
 */
export const isUserLoggedIn = (): boolean => {
  const token = localStorage.getItem("auth-token");

  if (!token) {
    return false;
  }

  try {
    const decoded = jwtDecode<DecodedToken>(token);

    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

/**
 * Returns user details if the token is valid, otherwise null
 */
export const getUserDetails = (): UserDetails | null => {
  const token = localStorage.getItem("auth-token");

  if (!token) {
    return null;
  }

  try {
    const decoded = jwtDecode<DecodedToken>(token);

    if (decoded.exp * 1000 < Date.now()) {
      return null;
    }

    return {
      userName: decoded.userName || decoded.name || "",
      roles: decoded.roles || "",
      userId: decoded.userId || decoded.sub || "",
      employeeId: decoded.employeeId || "",
    };
  } catch {
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
    return null;
  }
};

/**
 * Get user roles from localStorage
 */
export const getUserRoles = (): string[] => {
  try {
    const roles = localStorage.getItem("roles");

    return roles ? JSON.parse(roles) : [];
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

  localStorage.clear();
  sessionStorage.clear();

  if (typeof caches !== "undefined") {
    caches.keys().then(keys => {
      keys.forEach(key => caches.delete(key));
    });
  }

  window.dispatchEvent(new Event("auth-change"));

  window.location.replace("/login");
};
