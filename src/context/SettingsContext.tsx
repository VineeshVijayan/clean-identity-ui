import { identityFetch } from "@/services/api-config";
import { getApiErrorMessage, getErrorFromCatch, readResponseBody } from "@/lib/api-errors";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

export const normalizeSettings = (raw: unknown): Record<string, unknown> => {
  if (!raw || typeof raw !== "object") return {};

  const obj = raw as Record<string, unknown>;
  if (obj.data && typeof obj.data === "object" && !Array.isArray(obj.data)) {
    return obj.data as Record<string, unknown>;
  }

  return obj;
};

export const isSettingEnabled = (value: unknown, defaultValue = true): boolean => {
  if (value === undefined || value === null || value === "") return defaultValue;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return Boolean(value);
};

const SettingsContext = createContext<any>(null);

export const SettingsProvider = ({ children }: any) => {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    const res = await identityFetch("/settings");

    if (!res.ok) {
      const body = await readResponseBody(res);
      throw new Error(getApiErrorMessage(body, "Failed to load settings"));
    }

    const data = await res.json();

    setSettings(normalizeSettings(data));

    return normalizeSettings(data);
  };

  useEffect(() => {

    const token = localStorage.getItem("auth-token");

    if (!token) {
      setLoading(false);
      return;
    }

    const loadSettings = async () => {
      try {
        await fetchSettings();
      } catch (err) {
        console.error("Failed to load settings", err);
        toast.error(getErrorFromCatch(err, "Failed to load settings"));
      } finally {
        setLoading(false);
      }
    };

    loadSettings();

  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        setSettings,
        loading,
        fetchSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);