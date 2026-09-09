import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin, logout as apiLogout } from '../api/client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try {
      // Only restore user if the auth_token is also present — both must exist
      const token = localStorage.getItem('auth_token');
      const saved = localStorage.getItem('user_profile');
      if (token && saved) {
        return JSON.parse(saved);
      }
      // Token missing — clear any stale profile that may have been left
      localStorage.removeItem('user_profile');
      return null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  // Guard: if the token disappears from storage (e.g., cleared by another tab),
  // sync the React state immediately.
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'auth_token' && !e.newValue) {
        setUser(null);
        navigate('/login', { replace: true });
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate]);

  // Guard against Back-Forward cache (bfcache) or back navigation restoring stale auth
  useEffect(() => {
    const checkTokenIntegrity = () => {
      const token = localStorage.getItem('auth_token');
      if (!token && user) {
        setUser(null);
        window.location.replace('/login');
      }
    };
    window.addEventListener('pageshow', checkTokenIntegrity);
    window.addEventListener('popstate', checkTokenIntegrity);
    return () => {
      window.removeEventListener('pageshow', checkTokenIntegrity);
      window.removeEventListener('popstate', checkTokenIntegrity);
    };
  }, [user]);

  const loginUser = useCallback(async (username, password) => {
    setIsLoading(true);
    try {
      const profile = await apiLogin(username, password);
      setUser(profile);
      return profile;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logoutUser = useCallback(() => {
    // 1. Clear all tokens and session data from localStorage
    apiLogout(); // removes auth_token + user_profile

    // 2. Clear any other auth-adjacent cached data stored during session
    localStorage.removeItem('my_local_reports');
    try {
      sessionStorage.clear();
    } catch (e) {}

    // 3. Reset React auth state
    setUser(null);

    // 4. Force hard location replace to /login so browser history & bfcache cannot navigate back
    window.location.replace('/login');
  }, []);

  const isOfficial = Boolean(user && (user.role === 'district_admin' || user.role === 'official'));

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user || (typeof window !== 'undefined' && localStorage.getItem('auth_token'))),
        isOfficial,
        isLoading,
        login: loginUser,
        logout: logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
