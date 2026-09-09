import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin, logout as apiLogout } from '../api/client';

const AuthContext = createContext();

/** Roles that have admin/official access */
const ADMIN_ROLES = new Set(['district_admin', 'field_official', 'District Admin', 'admin', 'official']);

function isAdminRole(role) {
  return ADMIN_ROLES.has(role);
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem('auth_token');
      const saved = localStorage.getItem('user_profile');
      if (token) {
        if (saved) {
          return JSON.parse(saved);
        }
        // Fallback default — treated as admin so admin layout shows
        const defaultProfile = { token, role: 'district_admin', district: 'East Khasi Hills' };
        localStorage.setItem('user_profile', JSON.stringify(defaultProfile));
        return defaultProfile;
      }
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

      // Redirect based on role — admins → dashboard, citizens → citizen portal
      if (isAdminRole(profile?.role)) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/citizen', { replace: true });
      }

      return profile;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const logoutUser = useCallback(() => {
    // 1. Clear all tokens and session data from localStorage
    apiLogout(); // removes auth_token + user_profile

    // 2. Clear any other auth-adjacent cached data stored during session
    localStorage.removeItem('my_local_reports');
    localStorage.removeItem('user_view_mode');
    try {
      sessionStorage.clear();
    } catch (e) {}

    // 3. Reset React auth state
    setUser(null);

    // 4. Force hard location replace to /login so browser history & bfcache cannot navigate back
    window.location.replace('/login');
  }, []);

  const isOfficial = Boolean(user && isAdminRole(user.role));

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
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
