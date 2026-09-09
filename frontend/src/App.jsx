import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { useTranslation } from 'react-i18next';
import Navbar from './components/Navbar';
import OfflineNotice from './components/OfflineNotice';
import EmergencyAlertBanner from './components/EmergencyAlertBanner';
import ProtectedRoute from './components/ProtectedRoute';

import DashboardPage from './pages/DashboardPage';
import MapPage from './pages/MapPage';
import FieldReportPage from './pages/FieldReportPage';
import PublicAlertsPage from './pages/PublicAlertsPage';
import PredictorPage from './pages/PredictorPage';
import LoginPage from './pages/LoginPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
    },
  },
});

function AppFooter() {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-[#D9E2DE] dark:border-zinc-800 bg-white dark:bg-black py-6 text-xs text-slate-600 dark:text-zinc-400 shadow-sm mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#006B4F]"></span>
          <span className="font-bold text-[#006B4F] dark:text-emerald-400">
            {t('footer.platform_name')}
          </span>
          <span>• {t('footer.pilot_district')}</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium">
          <span>{t('footer.telemetry')}</span>
          <span>•</span>
          <span>{t('footer.emergency_ops')}</span>
          <span>•</span>
          <span className="font-mono">{t('footer.api_version')}</span>
        </div>
      </div>
    </footer>
  );
}

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
            <div className="min-h-screen flex flex-col bg-[#F5F7F6] dark:bg-black text-[#1F2937] dark:text-zinc-100 transition-colors">
              <Navbar />
              <OfflineNotice />
              <EmergencyAlertBanner />

              <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                <Routes>
                  {/* ── Public routes ─────────────────────────────────────── */}
                  <Route path="/login" element={<LoginPage />} />

                  {/* ── Protected routes (require authentication) ─────────── */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/map"
                    element={
                      <ProtectedRoute>
                        <MapPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/report"
                    element={
                      <ProtectedRoute>
                        <FieldReportPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/alerts"
                    element={
                      <ProtectedRoute>
                        <PublicAlertsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/predict"
                    element={
                      <ProtectedRoute>
                        <PredictorPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* ── Catch-all: redirect unknown URLs to dashboard (which will redirect to login if not authed) */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              <AppFooter />
            </div>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
