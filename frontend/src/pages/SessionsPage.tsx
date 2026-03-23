import { Alert, Box, Button, Grid2, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { motion, AnimatePresence } from 'framer-motion';
import { FormEvent, useEffect, useState } from 'react';
import { api } from '../api/client';
import { SessionStatusChip } from '../components/layout/SessionStatusChip';
import { authStore } from '../store/auth';
import { useHasRole } from '../components/auth/RoleGuard';
import { RealtimeSessionEvent, SelectOption, VehicleSession } from '../types';
import { formatDateTime } from '../utils/format';
import { WS_URL } from '../utils/constants';
import { Add, DirectionsCar, Person, AccessTime, Wifi, WifiOff } from '@mui/icons-material';

export function SessionsPage() {
  const auth = authStore.get();
  const [sessions, setSessions] = useState<VehicleSession[]>([]);
  const [lanes, setLanes] = useState<SelectOption[]>([]);
  const [message, setMessage] = useState('Live session board connected');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoading, setIsLoading] = useState(false);

  // Role-based visibility flags
  const canCreateSession = useHasRole('ADMIN', 'BRANCH_MANAGER', 'CASHIER');
  const canOperateLane = useHasRole('ADMIN', 'BRANCH_MANAGER', 'LANE_OPERATOR');
  const canInspect = useHasRole('ADMIN', 'BRANCH_MANAGER', 'INSPECTOR');

  const load = () => api.get<VehicleSession[]>(`/sessions?branchId=${auth?.branchId}`).then(setSessions);

  useEffect(() => {
    load();
    api.get<SelectOption[]>(`/reference/branches/${auth?.branchId}/lanes`).then(setLanes);

    // Online/offline detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // WebSocket connection
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000
    });
    client.onConnect = () => {
      setMessage('Live session board connected');
      client.subscribe('/topic/sessions', (payload) => {
        const event = JSON.parse(payload.body) as RealtimeSessionEvent;
        setSessions((current) => {
          const index = current.findIndex((item) => item.id === event.session.id);
          if (index >= 0) {
            const next = [...current];
            next[index] = event.session;
            return next;
          }
          return [event.session, ...current];
        });
      });
    };
    client.onDisconnect = () => {
      setMessage('Reconnecting to session board...');
    };
    client.activate();

    return () => {
      client.deactivate();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const createSession = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    try {
      await api.post('/sessions', {
        branchId: auth?.branchId,
        laneId: Number(formData.get('laneId')),
        registrationNumber: formData.get('registrationNumber'),
        customerName: formData.get('customerName'),
        customerPhone: formData.get('customerPhone'),
        vehicleType: formData.get('vehicleType'),
        servicePackage: formData.get('servicePackage'),
        sourceRequestId: crypto.randomUUID()
      }, true);
      setMessage(navigator.onLine ? 'Session created successfully' : 'Offline: registration queued for sync');
      load();
      event.currentTarget.reset();
    } catch (err) {
      setMessage(`Error: ${(err as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const nextAction = async (session: VehicleSession) => {
    if (session.status === 'REGISTERED' && canOperateLane) {
      await api.post(`/sessions/${session.id}/start-wash`, { laneId: session.laneId, operatorStaffId: auth?.staffId }, true);
    } else if (session.status === 'WASHING' && canOperateLane) {
      await api.post(`/sessions/${session.id}/record-mats`, { matsRemoved: 4, matsReinstalled: 4, conditionNotes: 'All mats cleaned' }, true);
    } else if (session.status === 'INTERIOR' && canInspect) {
      await api.post(`/sessions/${session.id}/inspect`, { inspectorStaffId: auth?.staffId, bodyCheckPassed: true, interiorCheckPassed: true, notes: 'Approved from desktop board' }, true);
    } else if (session.status === 'INSPECTION' && canInspect) {
      await api.post(`/sessions/${session.id}/complete`, {}, true);
    }
    load();
  };

  const canActOnSession = (session: VehicleSession): boolean => {
    if (session.status === 'COMPLETED') return false;
    if ((session.status === 'REGISTERED' || session.status === 'WASHING') && canOperateLane) return true;
    if ((session.status === 'INTERIOR' || session.status === 'INSPECTION') && canInspect) return true;
    return false;
  };

  const actionLabel = (session: VehicleSession): string => {
    if (session.status === 'REGISTERED') return 'START WASH';
    if (session.status === 'WASHING') return 'RECORD MATS';
    if (session.status === 'INTERIOR') return 'INSPECT';
    if (session.status === 'INSPECTION') return 'COMPLETE';
    return 'Completed';
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'REGISTERED': return '#14b86a';
      case 'WASHING': return '#3b82f6';
      case 'INTERIOR': return '#f5b942';
      case 'INSPECTION': return '#8b5cf6';
      case 'COMPLETED': return '#64748b';
      default: return '#64748b';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Stack spacing={4}>
        {/* Header */}
        <Box>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h3"
              sx={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontWeight: 700,
                mb: 1
              }}
            >
              Session Command Center
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: '1.05rem' }}>
              Monitor the live wash queue. Your role ({auth?.role}) controls which actions are available.
            </Typography>
          </motion.div>
        </Box>

        {/* Status Alert */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Alert
            severity={isOnline ? 'success' : 'warning'}
            icon={isOnline ? <Wifi /> : <WifiOff />}
            sx={{
              borderRadius: 2,
              background: isOnline
                ? 'rgba(20, 184, 106, 0.1)'
                : 'rgba(245, 185, 66, 0.1)',
              border: `1px solid ${isOnline ? 'rgba(20, 184, 106, 0.3)' : 'rgba(245, 185, 66, 0.3)'}`,
              '& .MuiAlert-icon': {
                color: isOnline ? '#14b86a' : '#f5b942'
              }
            }}
          >
            {message}
          </Alert>
        </motion.div>

        <Grid2 container spacing={3}>
          {/* New Session Form */}
          {canCreateSession && (
            <Grid2 size={{ xs: 12, lg: 4 }}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Paper
                  sx={{
                    p: 3,
                    background: 'rgba(15, 27, 22, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(148, 163, 184, 0.1)',
                    borderRadius: 4
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #14b86a 0%, #10b360 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Add sx={{ color: 'white', fontSize: 24 }} />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>New Vehicle Session</Typography>
                  </Box>
                  <Stack component="form" spacing={2} onSubmit={createSession}>
                    <TextField
                      label="Registration Number"
                      name="registrationNumber"
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#14b86a' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#14b86a' }
                        }
                      }}
                    />
                    <TextField label="Customer Name" name="customerName" required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                    <TextField label="Customer Phone" name="customerPhone" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                    <TextField
                      label="Vehicle Type"
                      name="vehicleType"
                      defaultValue="SUV"
                      required
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                    <TextField
                      label="Service Package"
                      name="servicePackage"
                      defaultValue="Premium Wash"
                      required
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                    <TextField
                      select
                      label="Lane"
                      name="laneId"
                      defaultValue={lanes[0]?.id ?? ''}
                      required
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    >
                      {lanes.map((lane) => <MenuItem key={lane.id} value={lane.id}>{lane.label}</MenuItem>)}
                    </TextField>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={isLoading}
                      sx={{
                        py: 1.5,
                        fontWeight: 700,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #14b86a 0%, #10b360 100%)',
                        boxShadow: '0 4px 16px rgba(20, 184, 106, 0.4)',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 24px rgba(20, 184, 106, 0.5)'
                        }
                      }}
                    >
                      {isLoading ? 'Creating...' : 'Register Session'}
                    </Button>
                  </Stack>
                </Paper>
              </motion.div>
            </Grid2>
          )}

          {/* Live Sessions Board */}
          <Grid2 size={{ xs: 12, lg: canCreateSession ? 8 : 12 }}>
            <Grid2 container spacing={2}>
              <AnimatePresence mode="popLayout">
                {sessions.map((session, index) => (
                  <Grid2 key={session.id} size={{ xs: 12, md: 6 }}>
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -20 }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.05,
                        type: 'spring',
                        stiffness: 100
                      }}
                    >
                      <Paper
                        sx={{
                          p: 3,
                          border: '1px solid rgba(148,163,184,0.16)',
                          borderRadius: 4,
                          background: 'rgba(15, 27, 22, 0.8)',
                          backdropFilter: 'blur(10px)',
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: `0 12px 32px ${getStatusColor(session.status)}20`,
                            borderColor: `${getStatusColor(session.status)}40`
                          }
                        }}
                      >
                        {/* Status indicator */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: 4,
                            background: getStatusColor(session.status)
                          }}
                        />

                        <Stack spacing={2}>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <DirectionsCar sx={{ color: getStatusColor(session.status), fontSize: 28 }} />
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                  {session.registrationNumber}
                                </Typography>
                              </Box>
                              <Typography color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                                {session.customerName} • {session.servicePackage}
                              </Typography>
                            </Box>
                            <SessionStatusChip status={session.status} />
                          </Stack>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                              <Person sx={{ fontSize: 18 }} />
                              <Typography variant="body2">
                                {session.laneName ?? 'Unassigned'}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                              <AccessTime sx={{ fontSize: 18 }} />
                              <Typography variant="body2">
                                {formatDateTime(session.registeredAt)}
                              </Typography>
                            </Box>
                          </Box>

                          <Typography variant="body2" color="text.secondary">
                            Operator: {session.operatorName ?? 'Pending assignment'}
                          </Typography>

                          {/* Action button */}
                          {canActOnSession(session) ? (
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Button
                                variant="contained"
                                onClick={() => nextAction(session)}
                                fullWidth
                                sx={{
                                  py: 1.5,
                                  fontWeight: 700,
                                  borderRadius: 2,
                                  background: getStatusColor(session.status),
                                  boxShadow: `0 4px 16px ${getStatusColor(session.status)}40`,
                                  '&:hover': {
                                    background: getStatusColor(session.status),
                                    boxShadow: `0 8px 24px ${getStatusColor(session.status)}60`
                                  }
                                }}
                              >
                                {actionLabel(session)}
                              </Button>
                            </motion.div>
                          ) : (
                            session.status !== 'COMPLETED' && (
                              <Typography
                                variant="caption"
                                color="text.disabled"
                                sx={{
                                  display: 'block',
                                  textAlign: 'center',
                                  p: 1,
                                  background: 'rgba(148, 163, 184, 0.1)',
                                  borderRadius: 1
                                }}
                              >
                                ⛔ Your role ({auth?.role}) cannot advance this step
                              </Typography>
                            )
                          )}
                        </Stack>
                      </Paper>
                    </motion.div>
                  </Grid2>
                ))}
              </AnimatePresence>
            </Grid2>
          </Grid2>
        </Grid2>
      </Stack>
    </motion.div>
  );
}
