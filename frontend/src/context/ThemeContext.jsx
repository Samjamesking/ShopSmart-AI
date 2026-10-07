import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('shopsmart_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('shopsmart_currency') || 'INR';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('shopsmart_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('shopsmart_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const toggleCurrency = (newCurr) => {
    setCurrency(newCurr);
    localStorage.setItem('shopsmart_currency', newCurr);
  };

  const formatPrice = (amount) => {
    if (amount == null) return '';
    const num = Number(amount);
    if (currency === 'USD') {
      // 1 USD ~ 83 INR
      const usdVal = Math.round(num / 83.5);
      return `$${usdVal.toLocaleString()}`;
    }
    return `₹${num.toLocaleString('en-IN')}`;
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, currency, toggleCurrency, formatPrice }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
