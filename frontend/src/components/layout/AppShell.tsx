import { PropsWithChildren } from 'react';
import { AppBar, Box, Button, Chip, Stack, Toolbar, Typography, Avatar } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authStore } from '../../store/auth';
import { Role } from '../../types';
import { Logout, Dashboard, DirectionsCar, Search, TabletAndroid, HistoryEdu, AdminPanelSettings } from '@mui/icons-material';

// Navigation item definition with role restrictions
interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  roles?: Role[];
}

const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Overview', icon: <Dashboard /> },
  { path: '/sessions', label: 'Sessions', icon: <DirectionsCar /> },
  { path: '/search', label: 'Search', icon: <Search /> },
  { path: '/tablet', label: 'Lane Tablet', icon: <TabletAndroid />, roles: ['ADMIN', 'LANE_OPERATOR'] },
  { path: '/admin', label: 'Admin', icon: <AdminPanelSettings />, roles: ['ADMIN'] },
  { path: '/audit-logs', label: 'Audit Logs', icon: <HistoryEdu />, roles: ['ADMIN', 'AUDITOR'] },
];

export function AppShell({ children }: PropsWithChildren) {
  const auth = authStore.get();
  const location = useLocation();
  const navigate = useNavigate();

  const logout = () => {
    authStore.clear();
    navigate('/login');
  };

  if (!auth) {
    return <>{children}</>;
  }

  const visibleNav = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(auth.role as Role)
  );

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative' }}>
      {/* Animated gradient background */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 0% 0%, rgba(20, 184, 106, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 100% 0%, rgba(245, 185, 66, 0.06) 0%, transparent 40%),
            radial-gradient(circle at 100% 100%, rgba(20, 184, 106, 0.05) 0%, transparent 40%),
            radial-gradient(circle at 0% 100%, rgba(245, 185, 66, 0.04) 0%, transparent 40%),
            linear-gradient(180deg, #08110d 0%, #0f1b16 50%, #08110d 100%)
          `,
          zIndex: -1
        }}
      />

      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          backdropFilter: 'blur(20px)',
          background: 'rgba(8, 17, 13, 0.85)',
          borderBottom: '1px solid rgba(148, 163, 184, 0.08)'
        }}
      >
        <Toolbar sx={{ gap: 2, flexWrap: 'wrap', py: 1 }}>
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: { xs: 1, sm: 0 } }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #14b86a 0%, #10b360 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(20, 184, 106, 0.3)'
                }}
              >
                <DirectionsCar sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #14b86a 0%, #14b86a 80%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                RinseFlow
              </Typography>
            </Box>
          </motion.div>

          {/* Navigation */}
          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              flexGrow: 1,
              flexWrap: 'wrap',
              justifyContent: 'center',
              mx: 2
            }}
          >
            {visibleNav.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                >
                  <Button
                    component={Link}
                    to={item.path}
                    startIcon={item.icon}
                    sx={{
                      color: isActive ? '#14b86a' : 'rgba(255, 255, 255, 0.7)',
                      background: isActive ? 'rgba(20, 184, 106, 0.15)' : 'transparent',
                      borderRadius: 2,
                      px: 2,
                      py: 1,
                      fontWeight: isActive ? 700 : 500,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'rgba(20, 184, 106, 0.1)',
                        color: '#14b86a',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                      {item.label}
                    </Box>
                  </Button>
                </motion.div>
              );
            })}
          </Stack>

          {/* User Info & Logout */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <AnimatePresence mode="wait">
              <motion.div
                key={auth.username}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <Chip
                  avatar={
                    <Avatar
                      sx={{
                        background: 'linear-gradient(135deg, #14b86a 0%, #f5b942 100%)',
                        color: 'white',
                        fontWeight: 700
                      }}
                    >
                      {auth.username.charAt(0).toUpperCase()}
                    </Avatar>
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box component="span" sx={{ fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
                        {auth.username}
                      </Box>
                      <Box
                        component="span"
                        sx={{
                          color: 'rgba(255,255,255,0.5)',
                          fontSize: '0.75rem',
                          display: { xs: 'none', md: 'block' }
                        }}
                      >
                        • {auth.role}
                      </Box>
                    </Box>
                  }
                  sx={{
                    background: 'rgba(148, 163, 184, 0.1)',
                    border: '1px solid rgba(148, 163, 184, 0.15)',
                    borderRadius: 2,
                    pl: 0.5,
                    '& .MuiChip-label': {
                      px: 1
                    }
                  }}
                />
              </motion.div>
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                onClick={logout}
                startIcon={<Logout />}
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  borderRadius: 2,
                  '&:hover': {
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444'
                  }
                }}
              >
                <Box component="span" sx={{ display: { xs: 'none', md: 'block' } }}>
                  Logout
                </Box>
              </Button>
            </motion.div>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box
        component={motion.main}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        sx={{
          p: { xs: 2, md: 4 },
          maxWidth: 1600,
          mx: 'auto'
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
