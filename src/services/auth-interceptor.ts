import { readResponseBody } from "@/lib/api-errors";
import type { TokenResponse } from "@/services/auth-types";
import { API_BASE_URL } from "@/services/api-config";
import { tokenStorage } from "@/services/token-storage";

let refreshPromise: Promise<boolean> | null = null;

const isAuthExemptRequest = (url: string) =>
  url.includes("/auth/refresh") || url.includes("/authenticate");

export const refreshAccessToken = async (): Promise<boolean> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        return false;
      }

      const body = await readResponseBody(response);
      const data = (body && typeof body === "object" ? body : {}) as TokenResponse;

      if (!data.accessToken) {
        return false;
      }

      tokenStorage.setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken ?? refreshToken,
        expiresIn: data.expiresIn,
      });

      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

export const fetchWithAuthRetry = async (
  url: string,
  options: RequestInit & { skipAuth?: boolean; _retried?: boolean } = {}
): Promise<Response> => {
  const { skipAuth, _retried, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers);
  if (!skipAuth) {
    const accessToken = tokenStorage.getAccessToken();
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
    if (!headers.has("Content-Type") && fetchOptions.body) {
      headers.set("Content-Type", "application/json");
    }
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (
    response.status === 401 &&
    !skipAuth &&
    !_retried &&
    !isAuthExemptRequest(url)
  ) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return fetchWithAuthRetry(url, { ...options, _retried: true });
    }
  }

  return response;
};
