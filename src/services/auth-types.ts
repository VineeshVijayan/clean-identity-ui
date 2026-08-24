export type SessionTimeoutUnit = "SECONDS" | "MINUTES" | "HOURS";

export interface AuthResponse {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface SessionTimeoutRequest {
  userId: string;
  value: number;
  unit: SessionTimeoutUnit;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
