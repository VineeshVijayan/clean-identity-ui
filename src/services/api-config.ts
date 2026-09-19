import { loadingStore } from "@/services/loading-store";
import {
  ApiError,
  getApiErrorMessage,
  parseResponse,
  readResponseBody,
  unwrapApiData,
} from "@/lib/api-errors";
import { fetchWithAuthRetry } from "@/services/auth-interceptor";
import { clearSessionAndRedirect } from "@/services/auth-service";
import { tokenStorage } from "@/services/token-storage";

export { ApiError, getApiErrorMessage, parseResponse, readResponseBody, unwrapApiData };

const DEFAULT_API_BASE_URL = "/api";

/** Hub clamps page size at 100 (AGENTS.md / identity-central-hub). */
export const HUB_MAX_PAGE_SIZE = 100;
export const applicationsListPath = `/applications?page=0&size=${HUB_MAX_PAGE_SIZE}`;

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;

export type ApiRequestOptions = RequestInit & {
  skipLoader?: boolean;
  skipAuth?: boolean;
};

/**
 * Get authorization headers for API calls
 */
export const getAuthHeaders = (): HeadersInit => {
  const token = tokenStorage.getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const resolveUrl = (baseUrl: string, endpoint: string) => {
  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
    return endpoint;
  }

  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${baseUrl}${path}`;
};

const buildHeaders = (options: ApiRequestOptions) => {
  const { skipAuth, headers } = options;

  if (skipAuth) {
    return headers;
  }

  return {
    ...getAuthHeaders(),
    ...headers,
  };
};

const apiRequest = async (
  baseUrl: string,
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<Response> => {
  const { skipLoader, skipAuth, ...fetchOptions } = options;

  if (!skipLoader) {
    loadingStore.start();
  }

  try {
    const url = resolveUrl(baseUrl, endpoint);
    const response = await fetchWithAuthRetry(url, {
      ...fetchOptions,
      skipAuth,
      headers: buildHeaders(options),
    });

    if (response.status === 401 && !skipAuth && tokenStorage.hasSession()) {
      clearSessionAndRedirect();
    }

    return response;
  } finally {
    if (!skipLoader) {
      loadingStore.end();
    }
  }
};

export const identityFetch = (
  endpoint: string,
  options?: ApiRequestOptions
) => apiRequest(API_BASE_URL, endpoint, options);

export const sessionFetch = (
  endpoint: string,
  options?: ApiRequestOptions
) => apiRequest(API_BASE_URL, endpoint, options);

export const connectorFetch = (
  endpoint: string,
  options?: ApiRequestOptions
) => apiRequest(API_BASE_URL, endpoint, options);

const fetchJson = async <T>(
  fetchFn: (endpoint: string, options?: ApiRequestOptions) => Promise<Response>,
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> => {
  const response = await fetchFn(endpoint, options);
  return parseResponse<T>(response);
};

/**
 * Generic API fetch wrapper with error handling
 */
export const apiFetch = async <T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> => {
  return fetchJson<T>(identityFetch, endpoint, options);
};

export const identityFetchJson = async <T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> => fetchJson<T>(identityFetch, endpoint, options);

export const sessionApiFetch = async <T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> => fetchJson<T>(sessionFetch, endpoint, options);

export const connectorApiFetch = async <T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> => fetchJson<T>(connectorFetch, endpoint, options);
