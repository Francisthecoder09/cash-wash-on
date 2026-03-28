import { Alert, Box, Button, Chip, Grid2, IconButton, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { motion, AnimatePresence } from 'framer-motion';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { PremiumScene } from '../components/layout/PremiumScene';
import { SessionStatusChip } from '../components/layout/SessionStatusChip';
import { authStore } from '../store/auth';
import { useHasRole } from '../components/auth/RoleGuard';
import { RealtimeSessionEvent, SelectOption, VehicleSession, ServiceType, Pricing } from '../types';
import { formatDateTime } from '../utils/format';
import { WS_URL } from '../utils/constants';
import { getAdminBranchPreference, saveAdminBranchPreference } from '../utils/adminBranchPreference';
import { Add, DirectionsCar, Person, AccessTime, Wifi, WifiOff, Payments, ContentCopy } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import { servicesApi, sessionApi } from '../api/admin';

const sanitizePhone = (value: string) => {
  const trimmed = value.replace(/[^\d+]/g, '');
  const digits = trimmed.replace(/\D/g, '').slice(0, 13);
  return trimmed.startsWith('+') ? `+${digits}` : digits;
};

export function SessionsPage() {
  const auth = authStore.get();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<VehicleSession[]>([]);
  const [lanes, setLanes] = useState<SelectOption[]>([]);
  const [branches, setBranches] = useState<SelectOption[]>([]);
  const [message, setMessage] = useState('Live session board connected');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoading, setIsLoading] = useState(false);
  const [services, setServices] = useState<ServiceType[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | ''>('');
  const [selectedVehicleType, setSelectedVehicleType] = useState('SUV');
  const [estimatedPrice, setEstimatedPrice] = useState<number>(0);
  const [pricingMatrix, setPricingMatrix] = useState<Pricing[]>([]);
  const isAdmin = auth?.role === 'ADMIN';
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    isAdmin ? getAdminBranchPreference(auth?.branchId) : String(auth?.branchId ?? ''),
  );

  // Role-based visibility flags
  const canCreateSession = useHasRole('ADMIN', 'BRANCH_MANAGER', 'CASHIER');
  const canOperateLane = useHasRole('ADMIN', 'BRANCH_MANAGER', 'LANE_OPERATOR');
  const canInspect = useHasRole('ADMIN', 'BRANCH_MANAGER', 'INSPECTOR');

  const effectiveBranchId = selectedBranchId === 'ALL' ? null : Number(selectedBranchId || auth?.branchId);
  const effectiveBranchIdRef = useRef<number | null>(effectiveBranchId);
  const canCreateInCurrentView = canCreateSession && effectiveBranchId !== null;

  useEffect(() => {
    effectiveBranchIdRef.current = effectiveBranchId;
    if (isAdmin) {
      saveAdminBranchPreference(selectedBranchId);
    }
  }, [effectiveBranchId, isAdmin, selectedBranchId]);

  const load = (branchId = effectiveBranchIdRef.current) => {
    const query = branchId ? `/sessions?branchId=${branchId}` : '/sessions';
    return api.get<VehicleSession[]>(query).then(setSessions);
  };

  useEffect(() => {
    api.get<SelectOption[]>('/reference/branches').then(setBranches);
    servicesApi.getAll(true).then(setServices);

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
        const currentBranchId = effectiveBranchIdRef.current;
        if (currentBranchId === null || event.session.branchId === currentBranchId) {
          void load(currentBranchId);
        }
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

  useEffect(() => {
    void load();
    if (effectiveBranchId) {
      api.get<SelectOption[]>(`/reference/branches/${effectiveBranchId}/lanes`).then(setLanes);
      return;
    }
    setLanes([]);
  }, [effectiveBranchId]);

  useEffect(() => {
    if (selectedServiceId) {
      servicesApi.getPricing(selectedServiceId as number).then(setPricingMatrix);
      const service = services.find(s => s.id === selectedServiceId);
      if (service) setEstimatedPrice(service.basePrice);
    } else {
      setPricingMatrix([]);
      setEstimatedPrice(0);
    }
  }, [selectedServiceId, services]);

  useEffect(() => {
    if (selectedServiceId) {
      const specificPrice = pricingMatrix.find(p => p.vehicleCategory === selectedVehicleType && p.active);
      if (specificPrice) {
        setEstimatedPrice(specificPrice.price);
      } else {
        const service = services.find(s => s.id === selectedServiceId);
        if (service) setEstimatedPrice(service.basePrice);
      }
    }
  }, [selectedVehicleType, pricingMatrix, selectedServiceId, services]);

  const createSession = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!effectiveBranchId) {
      setMessage('Select a specific branch before registering a new session.');
      return;
    }
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    try {
      await api.post('/sessions', {
        branchId: effectiveBranchId ?? auth?.branchId,
        laneId: formData.get('laneId') ? Number(formData.get('laneId')) : null,
        registrationNumber: formData.get('registrationNumber'),
        customerName: formData.get('customerName'),
        customerPhone: formData.get('customerPhone'),
        vehicleType: selectedVehicleType,
        servicePackage: services.find(s => s.id === selectedServiceId)?.serviceName || '',
        estimatedPrice: estimatedPrice,
        sourceRequestId: crypto.randomUUID()
      }, true);
      setMessage(navigator.onLine ? 'Session created successfully' : 'Offline: registration queued for sync');
      load();
      event.currentTarget.reset();
      setSelectedServiceId('');
      setSelectedVehicleType('SUV');
      setEstimatedPrice(0);
      setPricingMatrix([]);
    } catch (err) {
      setMessage(`Error: ${(err as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const nextAction = async (session: VehicleSession) => {
    if (session.status === 'REGISTERED' && canOperateLane) {
      await api.post(`/sessions/${session.id}/start-wash`, { laneId: session.laneId, operatorStaffId: auth?.staffId }, true);
      navigate(`/tablet?sessionId=${session.id}`);
      return;
    } else if (session.status === 'WASHING' && canOperateLane) {
      await api.post(`/sessions/${session.id}/record-mats`, { matsRemoved: 4, matsReinstalled: 4, conditionNotes: 'All mats cleaned' }, true);
    } else if (session.status === 'INTERIOR' && canInspect) {
      await api.post(`/sessions/${session.id}/inspect`, { inspectorStaffId: auth?.staffId, bodyCheckPassed: true, interiorCheckPassed: true, notes: 'Approved from desktop board' }, true);
    } else if (session.status === 'INSPECTION' && canInspect) {
      await api.post(`/sessions/${session.id}/complete`, {}, true);
    } else if (session.status === 'COMPLETED' && !session.paid && canCreateSession) {
      await sessionApi.pay(session.id);
    }
    load();
  };

  const canActOnSession = (session: VehicleSession): boolean => {
    if (session.status === 'COMPLETED' && !session.paid && canCreateSession) return true;
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
    if (session.status === 'COMPLETED' && !session.paid) return 'PROCESS PAYMENT';
    return 'DONE';
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'REGISTERED': return '#0ea5e9';
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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Grid2 container spacing={3} alignItems="stretch">
            <Grid2 size={{ xs: 12, xl: 7 }}>
              <Paper sx={{ p: { xs: 3, md: 4 }, minHeight: '100%', position: 'relative', overflow: 'hidden' }}>
                <Stack spacing={2.25}>
                  <Chip label="Session Board" sx={{ width: 'fit-content', bgcolor: 'rgba(240,180,76,0.12)', color: '#f5cb7f' }} />
                  <Typography variant="h2" sx={{ color: '#eef2f4', lineHeight: 1.03, maxWidth: 720 }}>
                    Live queue control built to feel practical, readable, and ready for floor operations
                  </Typography>
                  <Typography sx={{ color: 'rgba(154,168,176,0.86)', maxWidth: 620 }}>
                    Monitor the wash board, move vehicles through the flow, and keep branch operations readable at a glance. Your current role is {auth?.role}.
                  </Typography>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2} useFlexGap flexWrap="wrap">
                    <Chip label={`${sessions.length} sessions in view`} sx={{ bgcolor: 'rgba(95,183,212,0.12)', color: '#8fd0e6' }} />
                    <Chip label={isOnline ? 'Realtime connected' : 'Offline mode'} sx={{ bgcolor: isOnline ? 'rgba(102,194,138,0.12)' : 'rgba(240,180,76,0.12)', color: isOnline ? '#8fd7a7' : '#f5cb7f' }} />
                    <Chip label={effectiveBranchId === null ? 'All branches' : `Branch ${effectiveBranchId}`} sx={{ bgcolor: 'rgba(154,168,176,0.12)', color: '#c4ccd1' }} />
                  </Stack>
                  <Box sx={{ maxWidth: 430 }}>
                    <TextField
                      select
                      fullWidth
                      label="Viewing Branch"
                      value={selectedBranchId}
                      onChange={(event) => setSelectedBranchId(event.target.value)}
                      sx={{ minWidth: 240 }}
                    >
                      {isAdmin && <MenuItem value="ALL">All Branches</MenuItem>}
                      {branches.map((branch) => (
                        <MenuItem key={branch.id} value={String(branch.id)}>
                          {branch.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                </Stack>
              </Paper>
            </Grid2>
            <Grid2 size={{ xs: 12, xl: 5 }}>
              <PremiumScene height="100%" sx={{ minHeight: 280 }} />
            </Grid2>
          </Grid2>
        </motion.div>

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
                ? 'rgba(14, 165, 233, 0.1)'
                : 'rgba(245, 185, 66, 0.1)',
              border: `1px solid ${isOnline ? 'rgba(14, 165, 233, 0.3)' : 'rgba(245, 185, 66, 0.3)'}`,
              '& .MuiAlert-icon': {
                color: isOnline ? '#0ea5e9' : '#f5b942'
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
                        background: 'linear-gradient(135deg, #0ea5e9 0%, #10b360 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Add sx={{ color: 'white', fontSize: 24 }} />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>New Vehicle Session</Typography>
                  </Box>
                  {!canCreateInCurrentView && (
                    <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                      Select a specific branch to register a new staff session.
                    </Alert>
                  )}
                  <Stack component="form" spacing={2} onSubmit={createSession}>
                    <TextField
                      label="Registration Number"
                      name="registrationNumber"
                      required
                      disabled={!canCreateInCurrentView}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#0ea5e9' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#0ea5e9' }
                        }
                      }}
                    />
                    <TextField label="Customer Name" name="customerName" required disabled={!canCreateInCurrentView} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                    <TextField
                      label="Customer Phone"
                      name="customerPhone"
                      disabled={!canCreateInCurrentView}
                      onChange={(e) => {
                        e.currentTarget.value = sanitizePhone(e.currentTarget.value);
                      }}
                      inputProps={{ inputMode: 'tel', pattern: '[0-9+]*', maxLength: 14 }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                    <TextField
                      select
                      label="Vehicle Type"
                      name="vehicleType"
                      value={selectedVehicleType}
                      onChange={(e) => setSelectedVehicleType(e.target.value)}
                      required
                      disabled={!canCreateInCurrentView}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    >
                      <MenuItem value="SEDAN">SEDAN / HATCHBACK</MenuItem>
                      <MenuItem value="SUV">SUV / CROSSOVER</MenuItem>
                      <MenuItem value="TRUCK">TRUCK</MenuItem>
                      <MenuItem value="VAN">VAN / MINIVAN</MenuItem>
                    </TextField>
                    <TextField
                      select
                      label="Service Package"
                      name="servicePackage"
                      value={selectedServiceId}
                      onChange={(e) => setSelectedServiceId(Number(e.target.value))}
                      required
                      disabled={!canCreateInCurrentView}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    >
                      {services.map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                          {s.serviceName} (GHS {s.basePrice.toFixed(2)})
                        </MenuItem>
                      ))}
                    </TextField>

                    {estimatedPrice > 0 && (
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: 'rgba(14, 165, 233, 0.1)',
                          border: '1px dashed rgba(14, 165, 233, 0.3)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Payments sx={{ color: '#0ea5e9', fontSize: 20 }} />
                          <Typography variant="body2" sx={{ color: '#0ea5e9', fontWeight: 600 }}>Calculated Price:</Typography>
                        </Box>
                        <Typography variant="h6" sx={{ color: '#0ea5e9', fontWeight: 800 }}>${estimatedPrice.toFixed(2)}</Typography>
                      </Box>
                    )}
                    <TextField
                      select
                      label="Lane"
                      name="laneId"
                      defaultValue={lanes[0]?.id ?? ''}
                      required
                      disabled={!canCreateInCurrentView}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    >
                      {lanes.map((lane) => <MenuItem key={lane.id} value={lane.id}>{lane.label}</MenuItem>)}
                    </TextField>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={isLoading || !canCreateInCurrentView}
                      sx={{
                        py: 1.5,
                        fontWeight: 700,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #0ea5e9 0%, #10b360 100%)',
                        boxShadow: '0 4px 16px rgba(14, 165, 233, 0.4)',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 24px rgba(14, 165, 233, 0.5)'
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
                                {session.customerName} - {session.servicePackage}
                              </Typography>
                              {session.price !== undefined && (
                                <Typography sx={{ color: '#0ea5e9', fontWeight: 700, fontSize: '1.1rem', mt: 1 }}>
                                  ${session.price.toFixed(2)} {session.paid && <Chip label="PAID" size="small" sx={{ ml: 1, bgcolor: 'rgba(14, 165, 233, 0.2)', color: '#0ea5e9', fontWeight: 800, height: 20 }} />}
                                  {session.portalToken && (
                                    <Tooltip title="Copy Customer Portal Link">
                                      <IconButton
                                        size="small"
                                        onClick={() => {
                                          const url = `${window.location.origin}/portal/${session.portalToken}`;
                                          navigator.clipboard.writeText(url);
                                          setMessage('Portal link copied to clipboard!');
                                        }}
                                        sx={{ ml: 1, color: 'rgba(255,255,255,0.4)', '&:hover': { color: '#38bdf8' } }}
                                      >
                                        <ContentCopy sx={{ fontSize: 16 }} />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </Typography>
                              )}
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
                                Your role ({auth?.role}) cannot advance this step
                              </Typography>
                            )
                          )}
                        </Stack>
                      </Paper>
                    </motion.div>
                  </Grid2>
                ))}
              </AnimatePresence>
              {sessions.length === 0 && (
                <Grid2 size={{ xs: 12 }}>
                  <Paper sx={{ p: 4, borderRadius: 4, bgcolor: 'rgba(15, 27, 22, 0.55)', border: '1px solid rgba(148,163,184,0.12)' }}>
                    <Stack spacing={1} alignItems="center" textAlign="center">
                      <DirectionsCar sx={{ color: 'rgba(148,163,184,0.6)', fontSize: 36 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        No sessions in this branch view
                      </Typography>
                      <Typography color="text.secondary">
                        New portal bookings and staff registrations will appear here for the selected branch.
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid2>
              )}
            </Grid2>
          </Grid2>
        </Grid2>
      </Stack>
    </motion.div>
  );
}
