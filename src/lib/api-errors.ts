/**
 * Centralized API error mapping utility.
 *
 * Converts raw backend/technical errors (including Microsoft Graph SDK
 * messages, exception traces, and unknown validation payloads) into
 * user-friendly, field-scoped messages that can be shown safely in the UI.
 *
 * Usage:
 *   const mapped = mapApiError(response, payloadJson);
 *   // mapped.toast -> { title, description }
 *   // mapped.fieldErrors -> { email?: string; ssn?: string; phoneNumber?: string; dob?: string }
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
 * Attempts to pull a message string out of any shape of error body we've
 * seen from the backend so far.
 */
const extractRawMessage = (body: unknown): string => {
  if (!body) return "";
  if (typeof body === "string") return body;
  if (typeof body !== "object") return "";

  const b = body as Record<string, any>;
  const candidates = [
    b.error,
    b.message,
    b.statusMessage,
    b.detail,
    b.details,
    b.description,
    b?.error?.message,
    b?.data?.message,
    b?.data?.error,
  ];

  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c;
  }
  return "";
};

/**
 * Strip anything that looks like a technical detail so we never leak
 * stack traces, Graph URLs, or SDK versions to the end user.
 */
const looksTechnical = (msg: string): boolean => {
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
 * Map a backend error response to friendly UI messages.
 */
export function mapApiError(
  response: { status?: number; ok?: boolean } | null | undefined,
  body: unknown,
  opts?: { fallbackTitle?: string; fallbackMessage?: string }
): FriendlyError {
  const raw = extractRawMessage(body);
  const lower = raw.toLowerCase();
  const fieldErrors: FriendlyFieldErrors = {};

  const fallbackTitle = opts?.fallbackTitle || "Unable to complete request";
  const fallbackMessage =
    opts?.fallbackMessage ||
    "The request could not be completed. Please review the highlighted information and try again.";

  // ------ Field-specific detection ------

  // Email / userPrincipalName duplicates (Graph API commonly returns this)
  if (
    lower.includes("userprincipalname") ||
    (lower.includes("email") && (lower.includes("exist") || lower.includes("duplicate") || lower.includes("taken"))) ||
    (lower.includes("username") && lower.includes("exist"))
  ) {
    fieldErrors.email = FIELD_MESSAGES.emailDuplicate;
  } else if (lower.includes("email") && lower.includes("invalid")) {
    fieldErrors.email = FIELD_MESSAGES.emailInvalid;
  }

  // SSN
  if (lower.includes("ssn") || lower.includes("social security")) {
    if (lower.includes("exist") || lower.includes("duplicate") || lower.includes("assigned") || lower.includes("taken")) {
      fieldErrors.ssn = FIELD_MESSAGES.ssnDuplicate;
    } else if (lower.includes("invalid")) {
      fieldErrors.ssn = "Please enter a valid Social Security Number.";
    }
  }

  // Phone
  if (lower.includes("phone")) {
    if (lower.includes("exist") || lower.includes("duplicate") || lower.includes("associated") || lower.includes("taken")) {
      fieldErrors.phoneNumber = FIELD_MESSAGES.phoneDuplicate;
    } else if (lower.includes("invalid")) {
      fieldErrors.phoneNumber = "Please enter a valid phone number.";
    }
  }

  // DOB
  if (
    lower.includes("date of birth") ||
    lower.includes("dob") ||
    lower.includes("birthdate")
  ) {
    if (lower.includes("future")) {
      fieldErrors.dob = FIELD_MESSAGES.dobFuture;
    } else {
      fieldErrors.dob = FIELD_MESSAGES.dobInvalid;
    }
  }

  // Also pick up structured field errors: { errors: { email: "..." } } or
  // { errors: [{ field: "email", message: "..." }] }
  if (body && typeof body === "object") {
    const b = body as Record<string, any>;
    const structured = b.errors || b.fieldErrors || b.validation;
    if (structured) {
      const entries = Array.isArray(structured)
        ? structured.map((e: any) => [e.field || e.name, e.message || e.error])
        : Object.entries(structured);

      for (const [field, msgRaw] of entries) {
        if (!field) continue;
        const key = String(field).toLowerCase();
        const msg = typeof msgRaw === "string" ? msgRaw : String(msgRaw ?? "");
        const safe = looksTechnical(msg) ? "" : msg;

        if (key.includes("email") || key.includes("username") || key.includes("userprincipal")) {
          fieldErrors.email = fieldErrors.email || safe || FIELD_MESSAGES.emailDuplicate;
        } else if (key.includes("ssn") || key.includes("social")) {
          fieldErrors.ssn = fieldErrors.ssn || safe || FIELD_MESSAGES.ssnDuplicate;
        } else if (key.includes("phone")) {
          fieldErrors.phoneNumber = fieldErrors.phoneNumber || safe || FIELD_MESSAGES.phoneDuplicate;
        } else if (key.includes("dob") || key.includes("birth")) {
          fieldErrors.dob = fieldErrors.dob || safe || FIELD_MESSAGES.dobInvalid;
        } else if (key.includes("firstname") || key === "first_name") {
          fieldErrors.firstName = safe || "Please enter a valid first name.";
        } else if (key.includes("lastname") || key === "last_name") {
          fieldErrors.lastName = safe || "Please enter a valid last name.";
        } else if (key === "name") {
          fieldErrors.name = safe || "Please enter a valid name.";
        } else if (key.includes("address")) {
          fieldErrors.address = safe || "Please enter a valid address.";
        }
      }
    }
  }

  const hasFieldErrors = Object.values(fieldErrors).some(Boolean);
  const multiple = Object.values(fieldErrors).filter(Boolean).length > 1;

  // ------ Toast composition ------
  let toast: { title: string; description: string };

  if (hasFieldErrors) {
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
    // No known field — safe fallback. Never surface raw technical strings.
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
