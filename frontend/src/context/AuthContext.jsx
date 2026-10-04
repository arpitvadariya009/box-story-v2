import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [logoUrl, setLogoUrlState] = useState(localStorage.getItem('app_logo_url') || '');
  const [loading, setLoading] = useState(true);

  // Setup Axios defaults
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
  });

  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  useEffect(() => {
    const fetchProfileAndSettings = async () => {
      if (token) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const res = await api.get('/auth/me');
          setUser(res.data);

          // Fetch logo setting from API if saved in DB
          try {
            const settingsRes = await api.get('/settings');
            const logoSetting = settingsRes.data?.find((s) => s.key === 'LOGO_URL');
            if (logoSetting?.value) {
              setLogoUrlState(logoSetting.value);
              localStorage.setItem('app_logo_url', logoSetting.value);
            }
          } catch (e) {
            console.warn('Failed to load logo from settings API');
          }
        } catch (error) {
          console.error('Session expired or invalid token', error);
          logout();
        }
      }
      setLoading(false);
    };

    fetchProfileAndSettings();
  }, [token]);

  const updateLogoUrl = (url) => {
    setLogoUrlState(url);
    if (url) {
      localStorage.setItem('app_logo_url', url);
    } else {
      localStorage.removeItem('app_logo_url');
    }
  };

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: userToken, ...userData } = res.data;

      localStorage.setItem('token', userToken);
      setToken(userToken);
      setUser(userData);
      return userData;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, loading, login, logout, api, logoUrl, updateLogoUrl }}>
      {children}
    </AuthContext.Provider>
  );
};
