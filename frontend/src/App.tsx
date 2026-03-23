import { CssBaseline, IconButton, ThemeProvider } from '@mui/material';
import { ReactNode, useMemo, useState } from 'react';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { RoleGuard } from './components/auth/RoleGuard';
import { useOfflineSync } from './hooks/useOfflineSync';
import { AdminPage } from './pages/AdminPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { SearchPage } from './pages/SearchPage';
import { SessionsPage } from './pages/SessionsPage';
import { TabletLanePage } from './pages/TabletLanePage';
import { authStore } from './store/auth';
import { getAppTheme } from './theme/theme';

/** Redirects to /login if not authenticated */
function Protected({ children }: { children: ReactNode }) {
  return authStore.get() ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('dark');
  const theme = useMemo(() => getAppTheme(mode), [mode]);
  useOfflineSync();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <IconButton
          onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
          sx={{ position: 'fixed', right: 24, bottom: 24, zIndex: 2000, bgcolor: 'background.paper', boxShadow: 3 }}
        >
          {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
        <AppShell>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Dashboard — all authenticated roles */}
            <Route path="/" element={
              <RoleGuard allowedRoles={['ADMIN', 'BRANCH_MANAGER', 'CASHIER', 'LANE_OPERATOR', 'INSPECTOR', 'AUDITOR']}>
                <DashboardPage />
              </RoleGuard>
            } />

            {/* Sessions — all roles (role-based button visibility handled inside the page) */}
            <Route path="/sessions" element={
              <RoleGuard allowedRoles={['ADMIN', 'BRANCH_MANAGER', 'CASHIER', 'LANE_OPERATOR', 'INSPECTOR', 'AUDITOR']}>
                <SessionsPage />
              </RoleGuard>
            } />

            {/* Search — all roles */}
            <Route path="/search" element={
              <RoleGuard allowedRoles={['ADMIN', 'BRANCH_MANAGER', 'CASHIER', 'LANE_OPERATOR', 'INSPECTOR', 'AUDITOR']}>
                <SearchPage />
              </RoleGuard>
            } />

            {/* Tablet — only ADMIN and LANE_OPERATOR */}
            <Route path="/tablet" element={
              <RoleGuard allowedRoles={['ADMIN', 'BRANCH_MANAGER', 'LANE_OPERATOR']} redirectTo="/">
                <TabletLanePage />
              </RoleGuard>
            } />

            {/* Admin — only ADMIN */}
            <Route path="/admin" element={
              <RoleGuard allowedRoles={['ADMIN']} redirectTo="/">
                <AdminPage />
              </RoleGuard>
            } />

            {/* Audit Logs — only ADMIN and AUDITOR */}
            <Route path="/audit-logs" element={
              <RoleGuard allowedRoles={['ADMIN', 'AUDITOR']} redirectTo="/">
                <AuditLogsPage />
              </RoleGuard>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </ThemeProvider>
  );
}
