import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — guards any route that requires authentication.
 *
 * If the user is NOT authenticated:
 *   → Redirects to /login with the attempted path stored in `state.from`
 *     so the app can redirect back after a successful login.
 *   → Uses `replace` so the protected route is NOT added to browser history,
 *     which prevents the Back button from returning to a protected page.
 *
 * If the user IS authenticated:
 *   → Renders children normally.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const hasToken = typeof window !== 'undefined' ? Boolean(localStorage.getItem('auth_token')) : false;

  if (!isAuthenticated || !hasToken) {
    // Replace the current history entry so the Back button
    // cannot navigate back to the protected page.
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
}
