import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('shopsmart_token');
      if (token) {
        try {
          const profile = await api.getMe();
          if (profile) {
            setUser(profile);
          } else {
            localStorage.removeItem('shopsmart_token');
          }
        } catch {
          localStorage.removeItem('shopsmart_token');
        }
      } else {
        // Auto-login default demo user for seamless out-of-the-box experience
        try {
          const res = await api.login('sammya@shopsmart.ai', 'password123');
          if (res && res.access_token) {
            localStorage.setItem('shopsmart_token', res.access_token);
            setUser(res.user);
          }
        } catch (e) {
          console.error("Auto demo login failed", e);
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    localStorage.setItem('shopsmart_token', res.access_token);
    setUser(res.user);
    return res;
  };

  const register = async (name, email, password) => {
    const res = await api.register(name, email, password);
    localStorage.setItem('shopsmart_token', res.access_token);
    setUser(res.user);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('shopsmart_token');
    setUser(null);
  };

  const updatePreferences = async (newPrefs) => {
    try {
      const res = await api.updatePreferences(newPrefs);
      if (res && res.preferences) {
        setUser(prev => ({ ...prev, preferences: res.preferences }));
      }
      return res;
    } catch (e) {
      console.error("Preferences update failed", e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updatePreferences }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
