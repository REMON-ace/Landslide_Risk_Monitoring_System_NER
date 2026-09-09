import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('ner_theme');
    if (saved) return saved;
    return 'light'; // Default to Indian Government Light Theme (#F5F7F6)
  });

  useEffect(() => {
    const root = document.documentElement;
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');

    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.setProperty('--bg-app', '#000000');
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#000000');
    } else {
      root.classList.remove('dark');
      root.style.setProperty('--bg-app', '#F5F7F6');
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#006B4F');
    }

    localStorage.setItem('ner_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
