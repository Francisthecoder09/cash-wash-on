import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import {
  alpha,
  Avatar,
  Box,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { authStore } from '../../store/auth';
import { Role } from '../../types';
import {
  AdminPanelSettings,
  ChevronLeft,
  Dashboard,
  DirectionsCar,
  HistoryEdu,
  Logout,
  Menu,
  Search,
  TabletAndroid,
} from '@mui/icons-material';
import { PremiumScene } from './PremiumScene';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  roles?: Role[];
  accent: string;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Overview', icon: <Dashboard />, accent: '#5fb7d4' },
  { path: '/sessions', label: 'Sessions', icon: <DirectionsCar />, accent: '#66c28a' },
  { path: '/search', label: 'Search', icon: <Search />, accent: '#7f95a1' },
  { path: '/tablet', label: 'Lane Tablet', icon: <TabletAndroid />, roles: ['ADMIN', 'LANE_OPERATOR', 'BRANCH_MANAGER'], accent: '#f0b44c' },
  { path: '/admin', label: 'Admin', icon: <AdminPanelSettings />, roles: ['ADMIN'], accent: '#de6f5d' },
  { path: '/audit-logs', label: 'Audit Logs', icon: <HistoryEdu />, roles: ['ADMIN', 'AUDITOR'], accent: '#9aa8b0' },
];

function useLiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return time;
}

const SIDEBAR_W = 304;
const RAIL_W = 88;

export function AppShell({ children }: PropsWithChildren) {
  const auth = authStore.get();
  const location = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(true);
  const time = useLiveClock();

  const visibleNav = useMemo(
    () => NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(auth?.role as Role)),
    [auth?.role],
  );

  const sidebarW = expanded ? SIDEBAR_W : RAIL_W;

  const logout = () => {
    authStore.clear();
    navigate('/login');
  };

  if (!auth) return <>{children}</>;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: -3,
          background: 'linear-gradient(180deg, #0f0b09 0%, #16100d 54%, #1e1612 100%)',
        }}
      />
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: -2,
          pointerEvents: 'none',
          opacity: 0.34,
          backgroundImage:
            'linear-gradient(rgba(255,236,220,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,236,220,0.045) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.4), transparent 90%)',
        }}
      />

      <Box
        component={motion.aside}
        animate={{ width: sidebarW }}
        transition={{ type: 'spring', stiffness: 220, damping: 28 }}
        sx={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 20,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRight: '1px solid rgba(255,243,232,0.08)',
          background: 'linear-gradient(180deg, rgba(27,20,17,0.98) 0%, rgba(21,16,13,0.97) 100%)',
          boxShadow: '18px 0 42px rgba(0,0,0,0.28)',
          backdropFilter: 'blur(18px)',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 2, pt: 2, pb: 1.5 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2.5,
              background: 'linear-gradient(180deg, rgba(46,35,29,0.96), rgba(35,27,22,0.94))',
              border: '1px solid rgba(255,243,232,0.12)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: 'linear-gradient(180deg, #e36b2c 0%, #f0b67e 100%)',
              }}
            />
          </Box>
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                style={{ flex: 1, overflow: 'hidden' }}
              >
                <Typography variant="h6" noWrap sx={{ fontWeight: 700, color: '#f5ede5' }}>
                  RinseFlow
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(228,206,190,0.68)' }}>
                  Car wash operations
                </Typography>
              </motion.div>
            )}
          </AnimatePresence>
          <IconButton
            onClick={() => setExpanded((prev) => !prev)}
            sx={{
              color: 'rgba(245,237,229,0.88)',
              bgcolor: 'rgba(255,247,240,0.06)',
              border: '1px solid rgba(255,243,232,0.08)',
            }}
          >
            {expanded ? <ChevronLeft /> : <Menu />}
          </IconButton>
        </Stack>

        <Box sx={{ px: expanded ? 2 : 1.2, pb: 2 }}>
          <AnimatePresence initial={false}>
            {expanded ? (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}>
                <PremiumScene height={188} compact />
              </motion.div>
            ) : (
              <Box
                sx={{
                  mx: 'auto',
                  width: 52,
                  height: 52,
                  borderRadius: 2.5,
                  background: 'linear-gradient(180deg, rgba(255,247,240,0.08), rgba(255,247,240,0.04))',
                  border: '1px solid rgba(255,243,232,0.08)',
                }}
              />
            )}
          </AnimatePresence>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,243,232,0.08)', mx: 2 }} />

        <Stack spacing={1} sx={{ px: expanded ? 2 : 1.2, py: 2, flex: 1, overflowY: 'auto' }}>
          {visibleNav.map((item, index) => {
            const isActive = location.pathname === item.path;
            const navContent = (
              <Box
                component={Link}
                to={item.path}
                sx={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: expanded ? 'flex-start' : 'center',
                  gap: 1.25,
                  minHeight: 48,
                  px: expanded ? 1.5 : 0,
                  borderRadius: 3,
                  textDecoration: 'none',
                  color: isActive ? '#fff3e8' : 'rgba(226,208,194,0.86)',
                  background: isActive
                    ? `linear-gradient(135deg, ${alpha(item.accent, 0.24)} 0%, rgba(43,32,27,0.94) 100%)`
                    : 'rgba(31,24,20,0.9)',
                  border: `1px solid ${isActive ? alpha(item.accent, 0.34) : 'rgba(255,243,232,0.07)'}`,
                  overflow: 'hidden',
                  transition: 'transform 0.18s ease, border-color 0.18s ease, background 0.18s ease',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    borderColor: alpha(item.accent, 0.28),
                    background: `linear-gradient(135deg, ${alpha(item.accent, 0.14)} 0%, rgba(255,247,240,0.06) 100%)`,
                  },
                }}
              >
                {isActive && (
                  <Box
                    component={motion.div}
                    layoutId="navGlow"
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 4,
                      boxShadow: `inset 0 0 0 1px ${alpha(item.accent, 0.24)}`,
                    }}
                  />
                )}
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: 2,
                    display: 'grid',
                    placeItems: 'center',
                        bgcolor: isActive ? alpha(item.accent, 0.18) : 'rgba(52,40,34,0.92)',
                    color: isActive ? item.accent : 'inherit',
                    zIndex: 1,
                  }}
                >
                  {item.icon}
                </Box>
                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      style={{ overflow: 'hidden', zIndex: 1 }}
                    >
                      <Typography sx={{ fontWeight: isActive ? 800 : 700 }}>
                        {item.label}
                      </Typography>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Box>
            );

            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 * index }}
              >
                {expanded ? navContent : <Tooltip title={item.label} placement="right">{navContent}</Tooltip>}
              </motion.div>
            );
          })}
        </Stack>

        <Box sx={{ p: expanded ? 2 : 1.2 }}>
          <Stack
            spacing={1.5}
            sx={{
              p: expanded ? 1.5 : 1,
              borderRadius: 4,
              background: 'linear-gradient(180deg, rgba(35,27,23,0.96), rgba(27,21,18,0.94))',
              border: '1px solid rgba(255,243,232,0.12)',
            }}
          >
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}>
                  <Typography sx={{ color: '#e36b2c', fontSize: '1.2rem', fontWeight: 700 }}>
                    {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(228,206,190,0.68)' }}>
                    {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </Typography>
                </motion.div>
              )}
            </AnimatePresence>

            <Stack direction="row" spacing={1.2} alignItems="center">
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: 'linear-gradient(135deg, #e36b2c, #f0b67e)',
                  background: 'linear-gradient(135deg, #e36b2c, #f0b67e)',
                  color: '#fffaf5',
                  fontWeight: 700,
                }}
              >
                {auth.email.charAt(0).toUpperCase()}
              </Avatar>
              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ minWidth: 0, flex: 1 }}>
                    <Typography noWrap sx={{ fontWeight: 700, color: '#f5ede5' }}>
                      {auth.email}
                    </Typography>
                    <Chip
                      size="small"
                      label={auth.role.replace('_', ' ')}
                      sx={{
                        mt: 0.5,
                        bgcolor: 'rgba(227,107,44,0.1)',
                        color: '#9e4c24',
                        border: '1px solid rgba(227,107,44,0.16)',
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <Tooltip title="Logout">
                <IconButton onClick={logout} sx={{ color: '#c8583d' }}>
                  <Logout />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Box>
      </Box>

      <Box
        component={motion.main}
        animate={{ marginLeft: sidebarW }}
        transition={{ type: 'spring', stiffness: 220, damping: 28 }}
        sx={{ flex: 1, minHeight: '100vh', position: 'relative' }}
      >
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            px: { xs: 2.5, md: 4 },
            pt: 2,
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1.5}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
            sx={{
              px: 2,
              py: 1.5,
              borderRadius: 4,
              border: '1px solid rgba(255,243,232,0.08)',
              background: 'linear-gradient(180deg, rgba(34,26,22,0.96), rgba(26,20,17,0.94))',
              backdropFilter: 'blur(16px)',
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(228,206,190,0.68)' }}>
                ACTIVE WORKSPACE
              </Typography>
              <Typography variant="h6" sx={{ color: '#f5ede5' }}>
                {visibleNav.find((item) => item.path === location.pathname)?.label ?? 'Operations'}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label="Realtime active" sx={{ bgcolor: 'rgba(79,155,136,0.1)', color: '#3f796b', border: '1px solid rgba(79,155,136,0.16)' }} />
              <Chip label={auth.role.replace('_', ' ')} sx={{ bgcolor: 'rgba(227,107,44,0.1)', color: '#9e4c24', border: '1px solid rgba(227,107,44,0.16)' }} />
            </Stack>
          </Stack>
        </Box>

        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            style={{ padding: '26px 28px 44px' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
}
