import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 1. Load saved theme on startup
  useEffect(() => {
    const loadTheme = async () => {
      const saved = await AsyncStorage.getItem('theme');
      if (saved === 'dark') setIsDarkMode(true);
    };
    loadTheme();
  }, []);

  // 2. Toggle and Save
  const toggleTheme = async () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      AsyncStorage.setItem('theme', newMode ? 'dark' : 'light'); // Save to phone storage
      return newMode;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);