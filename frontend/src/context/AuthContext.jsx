import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('nagaed_token') || null);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('nagaed_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Sync state if unauthorized event is dispatched from API interceptor
  useEffect(() => {
    function handleUnauthorized() {
      setToken(null);
      setUser(null);
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    setLoading(false);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    // data has shape { token, user: { id, username, email, address } }
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('nagaed_token', data.token);
    localStorage.setItem('nagaed_user', JSON.stringify(data.user));
    return data.user;
  };

  const register = async (formData) => {
    return await authService.register(formData);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('nagaed_token');
    localStorage.removeItem('nagaed_user');
  };

  const refreshProfile = async () => {
    if (!user?.id) return;
    try {
      const freshUser = await authService.getUserProfile(user.id);
      setUser(freshUser);
      localStorage.setItem('nagaed_user', JSON.stringify(freshUser));
      return freshUser;
    } catch (err) {
      if (err.status === 401) {
        logout();
      }
      throw err;
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    register,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

