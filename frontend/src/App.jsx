import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';

import DashboardPage from './pages/DashboardPage';
import MapPage from './pages/MapPage';
import FieldReportPage from './pages/FieldReportPage';
import PublicAlertsPage from './pages/PublicAlertsPage';
import PredictorPage from './pages/PredictorPage';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {/*
          IMPORTANT: AuthProvider must be INSIDE <Router> because
          it uses useNavigate() for redirect-on-logout.
        */}
        <Router>
          <AuthProvider>
            <Routes>
              {/* ── Public routes ─────────────────────────────────────── */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* ── Protected Admin Portal routes (wrapped in AdminLayout) */}
              <Route
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/report" element={<FieldReportPage />} />
                <Route path="/alerts" element={<PublicAlertsPage />} />
                <Route path="/predict" element={<PredictorPage />} />
              </Route>

              {/* ── Catch-all: redirect unknown URLs to home ─── */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
