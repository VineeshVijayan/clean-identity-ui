import { createContext, useContext, useEffect, useState } from "react";

const SettingsContext = createContext<any>(null);

export const SettingsProvider = ({ children }: any) => {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = "https://identity-api.ndashdigital.com/api";

  const fetchSettings = async () => {
    const token = localStorage.getItem("auth-token");

    const res = await fetch(`${API_BASE_URL}/settings`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    return res.json();
  };

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await fetchSettings();
        setSettings(data);      // ✅ important
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, setSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);