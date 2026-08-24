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

// API Configuration — override via VITE_* env vars per environment

const IDENTITY_API_PROD = "https://identity-api.ndashdigital.com/api";
const IDENTITY_API_LOCAL = "http://localhost:8080/api";
const CONNECTOR_API_PROD = "https://idf-connector.ndashdigital.com/api";
const CONNECTOR_API_LOCAL = "http://localhost:8081/api";
const SESSION_API_PROD = "https://idf-session-api.ndashdigital.com/api";
const SESSION_API_LOCAL = "http://localhost:8082/api";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? IDENTITY_API_LOCAL : IDENTITY_API_PROD);

export const SESSION_BASE_URL =
  import.meta.env.VITE_SESSION_BASE_URL ||
  (import.meta.env.DEV ? SESSION_API_LOCAL : SESSION_API_PROD);

export const CONNECTOR_API_BASE_URL =
  import.meta.env.VITE_CONNECTOR_BASE_URL ||
  (import.meta.env.DEV ? CONNECTOR_API_LOCAL : CONNECTOR_API_PROD);

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
) => apiRequest(SESSION_BASE_URL, endpoint, options);

export const connectorFetch = (
  endpoint: string,
  options?: ApiRequestOptions
) => apiRequest(CONNECTOR_API_BASE_URL, endpoint, options);

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
