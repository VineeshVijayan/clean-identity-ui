import { jwtDecode } from "jwt-decode";
import type { AuthResponse, TokenResponse } from "@/services/auth-types";

const ACCESS_TOKEN_KEY = "auth-token";
const REFRESH_TOKEN_KEY = "auth-refresh-token";
const EXPIRES_AT_KEY = "auth-expires-at";

const resolveAccessToken = (response: AuthResponse | TokenResponse): string | null => {
  return response.accessToken ?? (response as AuthResponse).token ?? null;
};

export const tokenStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  getExpiresAt(): number | null {
    const value = localStorage.getItem(EXPIRES_AT_KEY);
    return value ? Number(value) : null;
  },

  setTokens(response: AuthResponse | TokenResponse): void {
    const accessToken = resolveAccessToken(response);
    if (!accessToken) {
      throw new Error("Missing access token in auth response");
    }

    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

    if ("refreshToken" in response && response.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
    }

    if (response.expiresIn != null) {
      localStorage.setItem(
        EXPIRES_AT_KEY,
        String(Date.now() + response.expiresIn * 1000)
      );
    }

    window.dispatchEvent(new Event("auth-change"));
  },

  updateAccessToken(accessToken: string, expiresIn: number): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(
      EXPIRES_AT_KEY,
      String(Date.now() + expiresIn * 1000)
    );
    window.dispatchEvent(new Event("auth-change"));
  },

  clearAuth(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(EXPIRES_AT_KEY);
    localStorage.removeItem("user");
    localStorage.removeItem("roles");
    window.dispatchEvent(new Event("auth-change"));
  },

  isAccessTokenExpired(bufferMs = 0): boolean {
    const expiresAt = this.getExpiresAt();
    if (expiresAt != null) {
      return Date.now() >= expiresAt - bufferMs;
    }

    const token = this.getAccessToken();
    if (!token) return true;

    try {
      const decoded = jwtDecode<{ exp: number }>(token);
      return decoded.exp * 1000 <= Date.now() + bufferMs;
    } catch {
      return true;
    }
  },

  hasSession(): boolean {
    return Boolean(this.getAccessToken() || this.getRefreshToken());
  },
};
