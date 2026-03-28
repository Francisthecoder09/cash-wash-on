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
          background:
            'radial-gradient(circle at top left, rgba(158,220,255,0.16), transparent 22%), radial-gradient(circle at top right, rgba(125,226,209,0.1), transparent 18%), linear-gradient(180deg, #091018 0%, #0b1520 50%, #101c28 100%)',
        }}
      />
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: -2,
          pointerEvents: 'none',
          opacity: 0.18,
          backgroundImage:
            'linear-gradient(rgba(95,183,212,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(95,183,212,0.08) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.72), transparent 92%)',
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
          borderRight: '1px solid rgba(255,255,255,0.14)',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.07) 100%)',
          boxShadow: '18px 0 42px rgba(3,10,18,0.24), inset 0 1px 0 rgba(255,255,255,0.14)',
          backdropFilter: 'blur(26px)',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 2, pt: 2, pb: 1.5 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2.5,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08))',
              border: '1px solid rgba(255,255,255,0.18)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: 'linear-gradient(180deg, #f0b44c 0%, #5fb7d4 100%)',
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
                <Typography variant="h6" noWrap sx={{ fontWeight: 700, color: '#eef2f4' }}>
                  RinseFlow
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(217,230,240,0.78)', fontFamily: '"IBM Plex Mono", monospace' }}>
                  Operations control
                </Typography>
              </motion.div>
            )}
          </AnimatePresence>
          <IconButton
            onClick={() => setExpanded((prev) => !prev)}
            sx={{
              color: 'rgba(244,249,253,0.86)',
              bgcolor: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.14)',
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
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06))',
                  border: '1px solid rgba(255,255,255,0.16)',
                }}
              />
            )}
          </AnimatePresence>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)', mx: 2 }} />

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
                  minHeight: 54,
                  px: expanded ? 1.5 : 0,
                  borderRadius: 4,
                  textDecoration: 'none',
                  color: isActive ? '#f4f9fd' : 'rgba(217,230,240,0.84)',
                  background: isActive
                    ? `linear-gradient(135deg, ${alpha(item.accent, 0.28)} 0%, rgba(255,255,255,0.1) 100%)`
                    : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${isActive ? alpha(item.accent, 0.34) : 'rgba(255,255,255,0.1)'}`,
                  overflow: 'hidden',
                  transition: 'transform 0.18s ease, border-color 0.18s ease, background 0.18s ease',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    borderColor: alpha(item.accent, 0.28),
                    background: `linear-gradient(135deg, ${alpha(item.accent, 0.18)} 0%, rgba(255,255,255,0.08) 100%)`,
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
                    borderRadius: 2.5,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: isActive ? alpha(item.accent, 0.22) : 'rgba(255,255,255,0.06)',
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
              background: 'linear-gradient(180deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              border: '1px solid rgba(255,255,255,0.14)',
            }}
          >
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}>
                  <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', color: '#f0b44c', fontSize: '1.2rem', fontWeight: 600 }}>
                    {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(217,230,240,0.78)', fontFamily: '"IBM Plex Mono", monospace' }}>
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
                  bgcolor: 'linear-gradient(135deg, #7dd3fc, #34d399)',
                  background: 'linear-gradient(135deg, #5fb7d4, #f0b44c)',
                  color: '#161b1f',
                  fontWeight: 700,
                }}
              >
                {auth.email.charAt(0).toUpperCase()}
              </Avatar>
              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ minWidth: 0, flex: 1 }}>
                    <Typography noWrap sx={{ fontWeight: 700, color: '#eef2f4' }}>
                      {auth.email}
                    </Typography>
                    <Chip
                      size="small"
                      label={auth.role.replace('_', ' ')}
                      sx={{
                        mt: 0.5,
                        bgcolor: 'rgba(95,183,212,0.12)',
                        color: '#8fd0e6',
                        border: '1px solid rgba(95,183,212,0.18)',
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <Tooltip title="Logout">
                <IconButton onClick={logout} sx={{ color: '#de6f5d' }}>
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
              border: '1px solid rgba(255,255,255,0.14)',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.1), rgba(255,255,255,0.06))',
              backdropFilter: 'blur(24px)',
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(217,230,240,0.78)', fontFamily: '"IBM Plex Mono", monospace' }}>
                ACTIVE WORKSPACE
              </Typography>
              <Typography variant="h6" sx={{ color: '#eef2f4' }}>
                {visibleNav.find((item) => item.path === location.pathname)?.label ?? 'Operations'}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label="Realtime active" sx={{ bgcolor: 'rgba(125,226,209,0.14)', color: '#b8fff4', border: '1px solid rgba(125,226,209,0.16)' }} />
              <Chip label={auth.role.replace('_', ' ')} sx={{ bgcolor: 'rgba(158,220,255,0.14)', color: '#d9f3ff', border: '1px solid rgba(158,220,255,0.16)' }} />
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
