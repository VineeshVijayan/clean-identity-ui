import { jwtDecode } from "jwt-decode";
import {
  getApiErrorMessage,
  getErrorFromCatch,
  readResponseBody,
  unwrapApiData,
} from "@/lib/api-errors";
import type {
  AuthResponse,
  LoginCredentials,
  SessionTimeoutRequest,
  TokenResponse,
} from "@/services/auth-types";
import { fetchWithAuthRetry, refreshAccessToken } from "@/services/auth-interceptor";
import { API_BASE_URL } from "@/services/api-config";
import { tokenStorage } from "@/services/token-storage";

const PROACTIVE_REFRESH_BUFFER_MS = 60_000;
let proactiveRefreshTimer: ReturnType<typeof setTimeout> | null = null;
let isLoggingOut = false;

const isPublicAuthRoute = () => {
  const path = window.location.pathname;
  return (
    path === "/login" ||
    path.startsWith("/login/") ||
    path === "/forgot-password" ||
    path.startsWith("/forgot-password/") ||
    path === "/reset-password" ||
    path.startsWith("/reset-password/")
  );
};

const resolveUserIdForLogout = (): string | null => {
  const accessToken = tokenStorage.getAccessToken();
  if (accessToken) {
    try {
      const decoded = jwtDecode<{ userId?: string; sub?: string }>(accessToken);
      return decoded.userId || decoded.sub || null;
    } catch {
      // fall through to stored user profile
    }
  }

  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser) as { userId?: string };
      return parsed.userId || null;
    }
  } catch {
    return null;
  }

  return null;
};

export const clearAuthState = (): void => {
  stopProactiveRefresh();
  tokenStorage.clearAuth();
  sessionStorage.clear();

  if (typeof caches !== "undefined") {
    caches.keys().then((keys) => {
      keys.forEach((key) => caches.delete(key));
    });
  }
};

export const clearSessionAndRedirect = (): void => {
  if (isLoggingOut) return;

  if (!tokenStorage.hasSession() && isPublicAuthRoute()) {
    return;
  }

  isLoggingOut = true;
  clearAuthState();

  if (!isPublicAuthRoute()) {
    window.location.replace("/login");
    return;
  }

  isLoggingOut = false;
};

const scheduleProactiveRefresh = () => {
  if (proactiveRefreshTimer) {
    clearTimeout(proactiveRefreshTimer);
    proactiveRefreshTimer = null;
  }

  const expiresAt = tokenStorage.getExpiresAt();
  if (!expiresAt || !tokenStorage.getRefreshToken()) {
    return;
  }

  const delay = Math.max(expiresAt - Date.now() - PROACTIVE_REFRESH_BUFFER_MS, 0);

  proactiveRefreshTimer = setTimeout(async () => {
    proactiveRefreshTimer = null;
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      scheduleProactiveRefresh();
    }
  }, delay);
};

export const startProactiveRefresh = () => {
  scheduleProactiveRefresh();
};

export const stopProactiveRefresh = () => {
  if (proactiveRefreshTimer) {
    clearTimeout(proactiveRefreshTimer);
    proactiveRefreshTimer = null;
  }
};

export const persistUserSession = (accessToken: string, email: string) => {
  const decoded = jwtDecode<{
    userName?: string;
    connectorUserId?: string;
    userId?: string;
    employeeId?: string;
    sub?: string;
    roles?: string | string[];
  }>(accessToken);

  if (decoded.roles) {
    const roles = Array.isArray(decoded.roles) ? decoded.roles : [decoded.roles];
    localStorage.setItem("roles", JSON.stringify(roles));
  }

  localStorage.setItem(
    "user",
    JSON.stringify({
      name: decoded.userName || "",
      connectorUserId: decoded.connectorUserId || "",
      userId: decoded.userId || "",
      employeeId: decoded.employeeId || "",
      email: decoded.sub || email,
    })
  );
};

export const login = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/authenticate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const body = await readResponseBody(response);
  const data = (body && typeof body === "object" ? body : { message: body }) as AuthResponse &
    Record<string, unknown>;

  if (!response.ok) {
    throw new Error(getApiErrorMessage(data, "Authentication failed"));
  }

  tokenStorage.setTokens(data);
  const accessToken = data.accessToken ?? data.token;
  if (accessToken) {
    persistUserSession(accessToken, credentials.email);
  }
  startProactiveRefresh();

  return data;
};

const GENERIC_RESET_MESSAGE =
  "If an account exists for that email, we sent password reset instructions.";

export const requestPasswordReset = async (email: string): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const body = await readResponseBody(response);
  if (!response.ok) {
    throw new Error(getApiErrorMessage(body, "Unable to send reset instructions"));
  }

  const data = unwrapApiData<string>(body);
  return typeof data === "string" && data.trim() ? data : GENERIC_RESET_MESSAGE;
};

export const confirmPasswordReset = async (
  token: string,
  newPassword: string
): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ token, newPassword }),
  });

  const body = await readResponseBody(response);
  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(body, "This reset link is invalid or has expired. Request a new one.")
    );
  }

  const data = unwrapApiData<string>(body);
  return typeof data === "string" && data.trim()
    ? data
    : "Password updated. You can now sign in.";
};

export const ensureValidAccessToken = async (): Promise<boolean> => {
  if (tokenStorage.getAccessToken() && !tokenStorage.isAccessTokenExpired()) {
    return true;
  }

  return refreshAccessToken();
};

export const logout = async (): Promise<void> => {
  if (isLoggingOut) return;
  isLoggingOut = true;

  const userId = resolveUserIdForLogout();
  const accessToken = tokenStorage.getAccessToken();

  if (userId && accessToken) {
    try {
      await fetch(`${API_BASE_URL}/auth/session-timeout/${userId}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch {
      // Best-effort server cleanup; always clear local session.
    }
  }

  clearAuthState();

  if (!isPublicAuthRoute()) {
    window.location.replace("/login");
    return;
  }

  isLoggingOut = false;
};

export const updateSessionTimeout = async (
  request: SessionTimeoutRequest
): Promise<TokenResponse> => {
  if (!tokenStorage.getAccessToken() && !tokenStorage.getRefreshToken()) {
    throw new Error("You must be signed in to update session timeout.");
  }

  const response = await fetchWithAuthRetry(`${API_BASE_URL}/auth/session-timeout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(request),
  });

  const body = await readResponseBody(response);
  const data = (body && typeof body === "object" ? body : {}) as TokenResponse &
    Record<string, unknown>;

  if (!response.ok) {
    throw new Error(getApiErrorMessage(data, "Failed to update session timeout"));
  }

  if (data.accessToken && data.expiresIn != null) {
    tokenStorage.updateAccessToken(data.accessToken, data.expiresIn);
    startProactiveRefresh();
  }

  return data;
};

export const resetSessionTimeout = async (userId: string): Promise<void> => {
  if (!tokenStorage.getAccessToken() && !tokenStorage.getRefreshToken()) {
    throw new Error("You must be signed in to reset session timeout.");
  }

  const response = await fetchWithAuthRetry(
    `${API_BASE_URL}/auth/session-timeout/${userId}`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok && response.status !== 204) {
    const body = await readResponseBody(response);
    throw new Error(getApiErrorMessage(body, "Failed to reset session timeout"));
  }
};

export const getAuthErrorMessage = (error: unknown, fallback: string) =>
  getErrorFromCatch(error, fallback);
