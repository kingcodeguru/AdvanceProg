// src/utilities/ThemeContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark'; // Initialize from storage
  });

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  useEffect(() => {
    const theme = isDarkMode ? 'dark' : 'light';
    // CRITICAL: This line tells the browser's CSS which theme to use
    document.documentElement.setAttribute('data-theme', theme); 
    localStorage.setItem('theme', theme);
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);