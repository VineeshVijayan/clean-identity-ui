import { useEffect } from 'react';

export const useTheme = () => {
  useEffect(() => {
    // Always light mode - remove any dark class
    const root = window.document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');
    localStorage.setItem('theme', 'light');
  }, []);

  return { theme: 'light' as const, setTheme: () => {}, toggleTheme: () => {} };
};
