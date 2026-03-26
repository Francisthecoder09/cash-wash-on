import { Box, CircularProgress, CssBaseline, ThemeProvider } from '@mui/material';
import { Suspense, lazy, useMemo, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { RoleGuard } from './components/auth/RoleGuard';
import { useOfflineSync } from './hooks/useOfflineSync';
import { getAppTheme } from './theme/theme';

const AdminPage = lazy(() => import('./pages/AdminPage').then((module) => ({ default: module.AdminPage })));
const AuditLogsPage = lazy(() => import('./pages/AuditLogsPage').then((module) => ({ default: module.AuditLogsPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })));
const SearchPage = lazy(() => import('./pages/SearchPage').then((module) => ({ default: module.SearchPage })));
const SessionsPage = lazy(() => import('./pages/SessionsPage').then((module) => ({ default: module.SessionsPage })));
const TabletLanePage = lazy(() => import('./pages/TabletLanePage').then((module) => ({ default: module.TabletLanePage })));
const CustomerPortalPage = lazy(() => import('./pages/CustomerPortalPage'));
const CustomerLoginPage = lazy(() => import('./pages/CustomerLoginPage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));

function RouteLoader() {
  return (
    <Box
      sx={{
        minHeight: '40vh',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <CircularProgress size={32} />
    </Box>
  );
}

export default function App() {
  const [mode] = useState<'light' | 'dark'>('dark');
  const theme = useMemo(() => getAppTheme(mode), [mode]);
  useOfflineSync();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppShell>
          <Suspense fallback={<RouteLoader />}>
            <Routes>
              <Route path="/portal/login" element={<CustomerLoginPage />} />
              <Route path="/portal/book" element={<BookingPage />} />
              <Route path="/portal/:token" element={<CustomerPortalPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Dashboard - all authenticated roles */}
              <Route path="/" element={
                <RoleGuard allowedRoles={['ADMIN', 'BRANCH_MANAGER', 'CASHIER', 'LANE_OPERATOR', 'INSPECTOR', 'AUDITOR']}>
                  <DashboardPage />
                </RoleGuard>
              } />

              {/* Sessions - all roles (role-based button visibility handled inside the page) */}
              <Route path="/sessions" element={
                <RoleGuard allowedRoles={['ADMIN', 'BRANCH_MANAGER', 'CASHIER', 'LANE_OPERATOR', 'INSPECTOR', 'AUDITOR']}>
                  <SessionsPage />
                </RoleGuard>
              } />

              {/* Search - all roles */}
              <Route path="/search" element={
                <RoleGuard allowedRoles={['ADMIN', 'BRANCH_MANAGER', 'CASHIER', 'LANE_OPERATOR', 'INSPECTOR', 'AUDITOR']}>
                  <SearchPage />
                </RoleGuard>
              } />

              {/* Tablet - only ADMIN and LANE_OPERATOR */}
              <Route path="/tablet" element={
                <RoleGuard allowedRoles={['ADMIN', 'BRANCH_MANAGER', 'LANE_OPERATOR']} redirectTo="/">
                  <TabletLanePage />
                </RoleGuard>
              } />

              {/* Admin - only ADMIN */}
              <Route path="/admin" element={
                <RoleGuard allowedRoles={['ADMIN']} redirectTo="/">
                  <AdminPage />
                </RoleGuard>
              } />

              {/* Audit Logs - only ADMIN and AUDITOR */}
              <Route path="/audit-logs" element={
                <RoleGuard allowedRoles={['ADMIN', 'AUDITOR']} redirectTo="/">
                  <AuditLogsPage />
                </RoleGuard>
              } />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </AppShell>
      </BrowserRouter>
    </ThemeProvider>
  );
}
