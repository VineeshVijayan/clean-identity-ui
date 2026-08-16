/**
 * Centralized API error mapping utility.
 *
 * Toast message priority:
 * 1. Integration errors `{ errorCode, message, timestamp }` → `message`
 * 2. Identity ApiResponse `{ error: "..." }` → `error`
 * 3. Other safe `message` / nested fields
 * 4. Caller-provided fallback
 */

export type FriendlyFieldErrors = {
  email?: string;
  ssn?: string;
  phoneNumber?: string;
  dob?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  address?: string;
};

export interface FriendlyError {
  toast: { title: string; description: string };
  fieldErrors: FriendlyFieldErrors;
}

const FIELD_MESSAGES = {
  emailDuplicate:
    "A user with this email address already exists. Please use a different email address.",
  emailInvalid: "Please enter a valid email address.",
  ssnDuplicate:
    "This Social Security Number is already assigned to another user.",
  phoneDuplicate:
    "This phone number is already associated with another user.",
  dobInvalid: "Please enter a valid date of birth.",
  dobFuture: "Date of birth cannot be in the future.",
};

/**
 * Reads a response body once, parsing JSON when possible.
 */
export async function readResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text.trim()) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

const readString = (value: unknown): string =>
  typeof value === "string" && value.trim() ? value.trim() : "";

const isStatusLabel = (value: string): boolean => {
  const normalized = value.trim().toUpperCase();
  return normalized === "ERROR" || normalized === "SUCCESS";
};

/**
 * Attempts to pull a message string out of any shape of error body we've
 * seen from the backend so far.
 */
export const extractRawMessage = (body: unknown): string => {
  if (!body) return "";
  if (typeof body === "string") return body.trim();
  if (typeof body !== "object") return "";

  const b = body as Record<string, unknown>;

  // Integration / connector errors: { errorCode, message, timestamp }
  const integrationMessage = readString(b.message);
  if (typeof b.errorCode === "string" && integrationMessage) {
    return integrationMessage;
  }

  // Identity ApiResponse: { statusMessage, statusCode, error, data }
  const apiError = readString(b.error);
  if (apiError) {
    return apiError;
  }

  if (integrationMessage) {
    return integrationMessage;
  }

  const nestedError = readString(
    (b.data as Record<string, unknown> | undefined)?.error
  );
  if (nestedError) {
    return nestedError;
  }

  const nestedMessage = readString(
    (b.data as Record<string, unknown> | undefined)?.message
  );
  if (nestedMessage) {
    return nestedMessage;
  }

  const nestedErrorObjectMessage = readString(
    (b.error as Record<string, unknown> | undefined)?.message
  );
  if (nestedErrorObjectMessage) {
    return nestedErrorObjectMessage;
  }

  const candidates = [b.detail, b.details, b.description, b.statusMessage];

  for (const candidate of candidates) {
    const message = readString(candidate);
    if (message && !isStatusLabel(message)) return message;
  }

  return "";
};

/**
 * Strip anything that looks like a technical detail so we never leak
 * stack traces, Graph URLs, or SDK versions to the end user.
 */
export const looksTechnical = (msg: string): boolean => {
  const lower = msg.toLowerCase();
  return (
    lower.includes("graph.microsoft.com") ||
    lower.includes("sdk version") ||
    lower.includes("stack trace") ||
    lower.includes("exception") ||
    lower.includes("at java.") ||
    lower.includes("at com.") ||
    lower.includes("nullpointer") ||
    lower.includes("userprincipalname")
  );
};

/**
 * Returns the best user-facing message from an API error body.
 */
export function getApiErrorMessage(body: unknown, fallback: string): string {
  const raw = extractRawMessage(body);
  if (raw && !looksTechnical(raw)) return raw;
  return fallback;
}

/**
 * Convenience helper for pages that only need a toast message.
 */
export function getApiErrorToast(
  response: { status?: number } | null | undefined,
  body: unknown,
  opts?: { fallbackTitle?: string; fallbackMessage?: string }
): { title: string; description: string } {
  const mapped = mapApiError(response, body, opts);
  return mapped.toast;
}

/**
 * Parse a failed API response into toast + optional field errors.
 */
export async function parseApiFailure(
  response: Response,
  opts?: { fallbackTitle?: string; fallbackMessage?: string }
): Promise<FriendlyError & { body: unknown }> {
  const body = await readResponseBody(response);
  const mapped = mapApiError(response, body, opts);
  return { body, ...mapped };
}

const applyStructuredFieldErrors = (
  body: unknown,
  fieldErrors: FriendlyFieldErrors,
  safeBackendMessage: string | null
) => {
  if (!body || typeof body !== "object") return;

  const b = body as Record<string, unknown>;
  const structured = b.errors || b.fieldErrors || b.validation;
  if (!structured) return;

  const entries = Array.isArray(structured)
    ? structured.map((entry: Record<string, unknown>) => [
        entry.field || entry.name,
        entry.message || entry.error,
      ])
    : Object.entries(structured as Record<string, unknown>);

  for (const [field, msgRaw] of entries) {
    if (!field) continue;
    const key = String(field).toLowerCase();
    const msg = typeof msgRaw === "string" ? msgRaw : String(msgRaw ?? "");
    const safe = looksTechnical(msg) ? "" : msg;

    if (key.includes("email") || key.includes("username") || key.includes("userprincipal")) {
      fieldErrors.email =
        fieldErrors.email || safe || safeBackendMessage || FIELD_MESSAGES.emailDuplicate;
    } else if (key.includes("ssn") || key.includes("social")) {
      fieldErrors.ssn =
        fieldErrors.ssn || safe || safeBackendMessage || FIELD_MESSAGES.ssnDuplicate;
    } else if (key.includes("phone")) {
      fieldErrors.phoneNumber =
        fieldErrors.phoneNumber || safe || safeBackendMessage || FIELD_MESSAGES.phoneDuplicate;
    } else if (key.includes("dob") || key.includes("birth")) {
      fieldErrors.dob = fieldErrors.dob || safe || safeBackendMessage || FIELD_MESSAGES.dobInvalid;
    } else if (key.includes("firstname") || key === "first_name") {
      fieldErrors.firstName = safe || safeBackendMessage || "Please enter a valid first name.";
    } else if (key.includes("lastname") || key === "last_name") {
      fieldErrors.lastName = safe || safeBackendMessage || "Please enter a valid last name.";
    } else if (key === "name") {
      fieldErrors.name = safe || safeBackendMessage || "Please enter a valid name.";
    } else if (key.includes("address")) {
      fieldErrors.address = safe || safeBackendMessage || "Please enter a valid address.";
    }
  }
};

const detectFieldErrors = (lower: string, safeBackendMessage: string | null): FriendlyFieldErrors => {
  const fieldErrors: FriendlyFieldErrors = {};

  if (
    lower.includes("userprincipalname") ||
    (lower.includes("email") &&
      (lower.includes("exist") || lower.includes("duplicate") || lower.includes("taken"))) ||
    (lower.includes("username") && lower.includes("exist"))
  ) {
    fieldErrors.email = safeBackendMessage || FIELD_MESSAGES.emailDuplicate;
  } else if (lower.includes("email") && lower.includes("invalid")) {
    fieldErrors.email = safeBackendMessage || FIELD_MESSAGES.emailInvalid;
  }

  if (lower.includes("ssn") || lower.includes("social security")) {
    if (
      lower.includes("exist") ||
      lower.includes("duplicate") ||
      lower.includes("assigned") ||
      lower.includes("taken")
    ) {
      fieldErrors.ssn = safeBackendMessage || FIELD_MESSAGES.ssnDuplicate;
    } else if (lower.includes("invalid")) {
      fieldErrors.ssn = safeBackendMessage || "Please enter a valid Social Security Number.";
    }
  }

  if (lower.includes("phone")) {
    if (
      lower.includes("exist") ||
      lower.includes("duplicate") ||
      lower.includes("associated") ||
      lower.includes("taken")
    ) {
      fieldErrors.phoneNumber = safeBackendMessage || FIELD_MESSAGES.phoneDuplicate;
    } else if (lower.includes("invalid")) {
      fieldErrors.phoneNumber = safeBackendMessage || "Please enter a valid phone number.";
    }
  }

  if (lower.includes("date of birth") || lower.includes("dob") || lower.includes("birthdate")) {
    if (lower.includes("future")) {
      fieldErrors.dob = safeBackendMessage || FIELD_MESSAGES.dobFuture;
    } else {
      fieldErrors.dob = safeBackendMessage || FIELD_MESSAGES.dobInvalid;
    }
  }

  return fieldErrors;
};

/**
 * Map a backend error response to friendly UI messages.
 */
export function mapApiError(
  response: { status?: number; ok?: boolean } | null | undefined,
  body: unknown,
  opts?: { fallbackTitle?: string; fallbackMessage?: string }
): FriendlyError {
  const raw = extractRawMessage(body);
  const lower = raw.toLowerCase();
  const safeBackendMessage = raw && !looksTechnical(raw) ? raw : null;

  const fallbackTitle = opts?.fallbackTitle || "Unable to complete request";
  const fallbackMessage =
    opts?.fallbackMessage ||
    "The request could not be completed. Please review the highlighted information and try again.";

  const fieldErrors = detectFieldErrors(lower, safeBackendMessage);
  applyStructuredFieldErrors(body, fieldErrors, safeBackendMessage);

  const hasFieldErrors = Object.values(fieldErrors).some(Boolean);
  const multiple = Object.values(fieldErrors).filter(Boolean).length > 1;

  let toast: { title: string; description: string };

  if (safeBackendMessage) {
    toast = {
      title: fallbackTitle,
      description: safeBackendMessage,
    };
  } else if (hasFieldErrors) {
    if (multiple) {
      toast = {
        title: "Please review the highlighted fields",
        description: "Please correct the highlighted fields and try again.",
      };
    } else if (fieldErrors.email) {
      toast = {
        title: "Email already exists",
        description: fieldErrors.email,
      };
    } else if (fieldErrors.ssn) {
      toast = { title: "Duplicate SSN", description: fieldErrors.ssn };
    } else if (fieldErrors.phoneNumber) {
      toast = { title: "Duplicate phone number", description: fieldErrors.phoneNumber };
    } else if (fieldErrors.dob) {
      toast = { title: "Invalid date of birth", description: fieldErrors.dob };
    } else {
      toast = { title: fallbackTitle, description: fallbackMessage };
    }
  } else {
    toast = { title: fallbackTitle, description: fallbackMessage };
  }

  return { toast, fieldErrors };
}

/**
 * Convenience wrapper for a network/exception path where we don't have a
 * parsed body at all.
 */
export function networkError(fallbackTitle = "Something went wrong"): FriendlyError {
  return {
    toast: {
      title: fallbackTitle,
      description:
        "We couldn't reach the server. Please check your connection and try again.",
    },
    fieldErrors: {},
  };
}

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

/**
 * Extracts the `data` field from an ApiResponse wrapper when present.
 */
export function unwrapApiData<T>(body: unknown): T {
  if (body && typeof body === "object" && "data" in body) {
    return (body as { data: T }).data;
  }
  return body as T;
}

/**
 * Returns the best message from a caught error (ApiError, Error, or fallback).
 */
export function getErrorFromCatch(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.message) {
    return error.message;
  }
  if (error instanceof Error && error.message && !error.message.startsWith("HTTP error")) {
    return error.message;
  }
  return fallback;
}

/**
 * Parse a fetch Response, throwing ApiError when not ok.
 */
export async function parseResponse<T = unknown>(response: Response): Promise<T> {
  const body = await readResponseBody(response);
  if (!response.ok) {
    throw new ApiError(
      getApiErrorMessage(body, `Request failed (${response.status})`),
      response.status,
      body
    );
  }
  return body as T;
}
