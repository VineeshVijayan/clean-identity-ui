// API Configuration
// These should be set in environment variables in production

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://idf-connector.ndashdigital.com/api";
export const SESSION_BASE_URL = import.meta.env.VITE_SESSION_BASE_URL || "https://idf-session-api.ndashdigital.com/api";

/**
 * Get authorization headers for API calls
 */
export const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem("auth-token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/**
 * Generic API fetch wrapper with error handling
 */
export const apiFetch = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "An error occurred" }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};


export const sessionApiFetch = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${SESSION_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "An error occurred" }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};
