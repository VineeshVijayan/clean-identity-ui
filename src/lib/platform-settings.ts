export const SETTING_KEYS = {
  displayName: "platform.displayName",
  organizationName: "platform.organizationName",
  supportEmail: "platform.supportEmail",
  welcomeMessage: "platform.welcomeMessage",
  maintenanceMode: "platform.maintenanceMode",
  defaultLandingPage: "platform.defaultLandingPage",
  listingPageSize: "users.defaultListingPageSize",
  allowSelfRegistration: "users.allowSelfRegistration",
  allowProfileUpdate: "users.allowProfileUpdate",
  mailFrom: "notifications.mailFrom",
  sidebarIcons: "ui.sidebarIcons",
  buttonColors: "ui.buttonColors",
  showCompanyMenu: "SHOW_COMPANY_MENU",
} as const;

export type ButtonColorConfig = {
  bgColor: string;
  borderColor: string;
  borderRadius: number[];
};

export const BUTTON_COLOR_KEYS = ["btn1", "btn2", "btn3"] as const;
export type ButtonColorKey = (typeof BUTTON_COLOR_KEYS)[number];

export const DEFAULT_BUTTON_COLORS: Record<ButtonColorKey, ButtonColorConfig> = {
  btn1: { bgColor: "#333366", borderColor: "#333366", borderRadius: [8] },
  btn2: { bgColor: "#f58b1f", borderColor: "#f58b1f", borderRadius: [8] },
  btn3: { bgColor: "#cf2027", borderColor: "#cf2027", borderRadius: [8] },
};

export const DEFAULT_SIDEBAR_ICONS: Record<string, string> = {
  dashboard: "Home",
  users: "Users",
  roles: "Shield",
  admin: "Settings",
  reports: "BarChart3",
};

const BUTTON_STORAGE_PREFIX = "buttonConfig_";

export const parseJsonObject = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return {};
    }
  }
  return {};
};

export const parseSidebarIcons = (
  settings: Record<string, unknown> | undefined
): Record<string, string> => {
  const raw = parseJsonObject(settings?.[SETTING_KEYS.sidebarIcons]);
  const icons: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string" && value.trim()) {
      icons[key] = value.trim();
    }
  }
  return icons;
};

export const sidebarIconSelections = (
  settings: Record<string, unknown> | undefined
): Record<string, string> => ({
  ...DEFAULT_SIDEBAR_ICONS,
  ...parseSidebarIcons(settings),
});

const asButtonConfig = (value: unknown): ButtonColorConfig | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (typeof record.bgColor !== "string" || typeof record.borderColor !== "string") return null;
  const radius = Array.isArray(record.borderRadius)
    ? record.borderRadius.map((entry) => Number(entry)).filter((entry) => Number.isFinite(entry))
    : [Number(record.borderRadius)];
  return {
    bgColor: record.bgColor,
    borderColor: record.borderColor,
    borderRadius: [radius[0] ?? 8],
  };
};

export const parseButtonColors = (
  settings: Record<string, unknown> | undefined
): Partial<Record<ButtonColorKey, ButtonColorConfig>> => {
  const raw = parseJsonObject(settings?.[SETTING_KEYS.buttonColors]);
  const colors: Partial<Record<ButtonColorKey, ButtonColorConfig>> = {};
  for (const key of BUTTON_COLOR_KEYS) {
    const parsed = asButtonConfig(raw[key]);
    if (parsed) colors[key] = parsed;
  }
  return colors;
};

export const readLocalButtonConfig = (key: string): ButtonColorConfig | null => {
  try {
    const saved = localStorage.getItem(`${BUTTON_STORAGE_PREFIX}${key}`);
    return saved ? asButtonConfig(JSON.parse(saved)) : null;
  } catch {
    return null;
  }
};

export const writeLocalButtonConfigs = (
  configs: Partial<Record<ButtonColorKey, ButtonColorConfig>>
) => {
  for (const key of BUTTON_COLOR_KEYS) {
    const config = configs[key];
    if (config) {
      localStorage.setItem(`${BUTTON_STORAGE_PREFIX}${key}`, JSON.stringify(config));
    }
  }
};

export const buttonColorSelections = (
  settings: Record<string, unknown> | undefined
): Record<ButtonColorKey, ButtonColorConfig> => {
  const fromApi = parseButtonColors(settings);
  const result = { ...DEFAULT_BUTTON_COLORS };
  for (const key of BUTTON_COLOR_KEYS) {
    result[key] = fromApi[key] ?? readLocalButtonConfig(key) ?? DEFAULT_BUTTON_COLORS[key];
  }
  return result;
};

export const settingJson = (value: unknown): string => {
  if (typeof value === "string" && value.trim()) return value;
  if (value && typeof value === "object") return JSON.stringify(value);
  return "{}";
};

let pendingButtonColors: Partial<Record<ButtonColorKey, ButtonColorConfig>> | null = null;

export const setPendingButtonColors = (
  configs: Partial<Record<ButtonColorKey, ButtonColorConfig>> | null
) => {
  pendingButtonColors = configs;
};

export const setPendingButtonColor = (key: ButtonColorKey, config: ButtonColorConfig) => {
  pendingButtonColors = { ...pendingButtonColors, [key]: config };
};

export const appearanceButtonColorsJson = (
  settings: Record<string, unknown> | undefined
): string => {
  const saved = parseButtonColors(settings);
  if (!pendingButtonColors) return JSON.stringify(saved);
  return JSON.stringify({ ...saved, ...pendingButtonColors });
};

export const ADMIN_SETTING_CATEGORIES = [
  "GENERAL",
  "USER_MANAGEMENT",
  "USER_LIFECYCLE",
  "APPLICATIONS",
  "NOTIFICATIONS",
  "AUDIT",
] as const;

export type AdminSettingCategory = (typeof ADMIN_SETTING_CATEGORIES)[number];

export const settingString = (
  settings: Record<string, unknown> | undefined,
  key: string,
  fallback = ""
): string => {
  const value = settings?.[key];
  if (value == null || value === "") return fallback;
  return String(value);
};

export const listingPageSize = (
  settings: Record<string, unknown> | undefined,
  fallback = 20
): number => {
  const raw = settings?.[SETTING_KEYS.listingPageSize];
  const parsed = typeof raw === "number" ? raw : Number.parseInt(String(raw ?? ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(100, Math.max(5, parsed));
};

export const postLoginPath = (
  settings: Record<string, unknown> | undefined,
  options: { endUser: boolean }
): string => {
  if (options.endUser) return "/welcome";
  const landing = settingString(settings, SETTING_KEYS.defaultLandingPage, "dashboard");
  return landing === "welcome" ? "/welcome" : "/dashboard";
};

export const splitBrandName = (name: string | undefined) => {
  const display = (name || "Identity Framework").trim() || "Identity Framework";
  const match = display.match(/^(.*?)(framework)$/i);
  if (match && match[1]?.trim()) {
    return { lead: match[1].trim(), accent: match[2] };
  }
  return { lead: display, accent: "" };
};
