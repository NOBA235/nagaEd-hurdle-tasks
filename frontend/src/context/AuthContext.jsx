import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { authService } from '../services/auth.service';
import { AuthContext } from './auth-context';

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

  // Sync state if unauthorized event is dispatched from API interceptor
  useEffect(() => {
    function handleUnauthorized() {
      setToken(null);
      setUser(null);
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('nagaed_token', data.token);
    localStorage.setItem('nagaed_user', JSON.stringify(data.user));
    return data.user;
  }, []);

  const register = useCallback(async (formData) => {
    return await authService.register(formData);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('nagaed_token');
    localStorage.removeItem('nagaed_user');
  }, []);

  const userId = user?.id;

  const refreshProfile = useCallback(async () => {
    if (!userId) return null;
    try {
      const freshUser = await authService.getUserProfile(userId);
      setUser(freshUser);
      localStorage.setItem('nagaed_user', JSON.stringify(freshUser));
      return freshUser;
    } catch (err) {
      if (err.status === 401) {
        logout();
      }
      throw err;
    }
  }, [userId, logout]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token && !!user,
      loading: false,
      login,
      register,
      logout,
      refreshProfile,
    }),
    [user, token, login, register, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
