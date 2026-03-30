import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid2, IconButton, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
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
import { RealtimeSessionEvent, SelectOption, VehicleSession, ServiceType, Pricing, SessionMessage, SessionMessageEvent, PaymentMethod, SessionPaymentRecord } from '../types';
import { formatCurrency } from '../utils/currency';
import { formatDateTime } from '../utils/format';
import { resizeVehicleImage } from '../utils/imageUpload';
import { WS_URL } from '../utils/constants';
import { getAdminBranchPreference, saveAdminBranchPreference } from '../utils/adminBranchPreference';
import { calculateAddOnTotal, getRecommendedAddOnNames } from '../utils/addOns';
import { getRecommendationToneColor, getSessionRecommendation } from '../utils/recommendations';
import { Add, DirectionsCar, Person, AccessTime, Wifi, WifiOff, Payments, ContentCopy, ChatBubbleOutline } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import { servicesApi, sessionApi } from '../api/admin';

const sessionsWallpaper = '/flavien-WJiSMLedW3o-unsplash.jpg';

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
  const [addOnOptions, setAddOnOptions] = useState<ServiceType[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | ''>('');
  const [selectedVehicleType, setSelectedVehicleType] = useState('SUV');
  const [estimatedPrice, setEstimatedPrice] = useState<number>(0);
  const [pricingMatrix, setPricingMatrix] = useState<Pricing[]>([]);
  const [vehicleImageUrl, setVehicleImageUrl] = useState('');
  const [selectedAddOnServices, setSelectedAddOnServices] = useState<string[]>([]);
  const [messageDialogSession, setMessageDialogSession] = useState<VehicleSession | null>(null);
  const [sessionMessages, setSessionMessages] = useState<SessionMessage[]>([]);
  const [messageDraft, setMessageDraft] = useState('');
  const [messageLoading, setMessageLoading] = useState(false);
  const [messageSending, setMessageSending] = useState(false);
  const [unreadMessageCounts, setUnreadMessageCounts] = useState<Record<number, number>>({});
  const [paymentDialogSession, setPaymentDialogSession] = useState<VehicleSession | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentSending, setPaymentSending] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<SessionPaymentRecord[]>([]);
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
  const addOnTotal = calculateAddOnTotal(selectedAddOnServices, addOnOptions);
  const finalEstimatedPrice = estimatedPrice + addOnTotal;
  const recommendedAddOnNames = getRecommendedAddOnNames(selectedVehicleType, services.find((s) => s.id === selectedServiceId)?.serviceName || '', addOnOptions);

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
    servicesApi.getAll(true).then((allServices) => {
      setServices(allServices.filter((service) => service.category !== 'ADDON'));
      setAddOnOptions(allServices.filter((service) => service.category === 'ADDON' && (!service.branchId || service.branchId === effectiveBranchIdRef.current)));
    });

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
      client.subscribe('/topic/session-messages', (payload) => {
        const event = JSON.parse(payload.body) as SessionMessageEvent;
        if (messageDialogSession && messageDialogSession.id === event.sessionId) {
          setSessionMessages((current) =>
            current.some((item) => item.id === event.message.id) ? current : [...current, event.message],
          );
          return;
        }

        if (event.message.senderType === 'CUSTOMER') {
          setUnreadMessageCounts((current) => ({
            ...current,
            [event.sessionId]: (current[event.sessionId] ?? 0) + 1,
          }));
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
  }, [messageDialogSession]);

  useEffect(() => {
    servicesApi.getAll(true).then((allServices) => {
      setAddOnOptions(
        allServices.filter(
          (service) => service.category === 'ADDON' && (!service.branchId || service.branchId === effectiveBranchId),
        ),
      );
      setSelectedAddOnServices((prev) =>
        prev.filter((selected) =>
          allServices.some(
            (service) => service.category === 'ADDON' && service.serviceName === selected && (!service.branchId || service.branchId === effectiveBranchId),
          ),
        ),
      );
    });
  }, [effectiveBranchId]);

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

  useEffect(() => {
    if (!messageDialogSession) return;

    void loadSessionMessages(messageDialogSession.id);
    const interval = window.setInterval(() => {
      void loadSessionMessages(messageDialogSession.id);
    }, 12000);

    return () => window.clearInterval(interval);
  }, [messageDialogSession]);

  useEffect(() => {
    if (!messageDialogSession) return;
    setUnreadMessageCounts((current) => ({ ...current, [messageDialogSession.id]: 0 }));
  }, [messageDialogSession, sessionMessages.length]);

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
        vehicleImageUrl: vehicleImageUrl || null,
        servicePackage: services.find(s => s.id === selectedServiceId)?.serviceName || '',
        addOnServices: selectedAddOnServices,
        estimatedPrice: finalEstimatedPrice,
        sourceRequestId: crypto.randomUUID()
      }, true);
      setMessage(navigator.onLine ? 'Session created successfully' : 'Offline: registration queued for sync');
      load();
      event.currentTarget.reset();
      setSelectedServiceId('');
      setSelectedVehicleType('SUV');
      setEstimatedPrice(0);
      setPricingMatrix([]);
      setVehicleImageUrl('');
      setSelectedAddOnServices([]);
    } catch (err) {
      setMessage(`Error: ${(err as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVehiclePhotoChange = async (file: File | null) => {
    if (!file) {
      setVehicleImageUrl('');
      return;
    }

    try {
      const image = await resizeVehicleImage(file);
      setVehicleImageUrl(image);
    } catch (err) {
      setMessage(`Error: ${(err as Error).message}`);
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
      setPaymentDialogSession(session);
      setPaymentMethod('CASH');
      setPaymentReference('');
      setPaymentNotes('');
      setPaymentHistory(await sessionApi.getPayments(session.id));
      return;
    }
    load();
  };

  const canActOnSession = (session: VehicleSession): boolean => {
    if (session.status === 'EXPIRED') return false;
    if (session.status === 'COMPLETED' && !session.paid && canCreateSession) return true;
    if (session.status === 'COMPLETED') return false;
    if ((session.status === 'REGISTERED' || session.status === 'WASHING') && canOperateLane) return true;
    if ((session.status === 'INTERIOR' || session.status === 'INSPECTION') && canInspect) return true;
    return false;
  };

  const actionLabel = (session: VehicleSession): string => {
    if (session.status === 'EXPIRED') return 'EXPIRED';
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
      case 'EXPIRED': return '#dc2626';
      case 'WASHING': return '#3b82f6';
      case 'INTERIOR': return '#f5b942';
      case 'INSPECTION': return '#8b5cf6';
      case 'COMPLETED': return '#64748b';
      default: return '#64748b';
    }
  };

  const loadSessionMessages = async (sessionId: number) => {
    setMessageLoading(true);
    try {
      const data = await api.get<SessionMessage[]>(`/sessions/${sessionId}/messages`);
      setSessionMessages(data);
    } catch (err) {
      setMessage(`Error: ${(err as Error).message}`);
    } finally {
      setMessageLoading(false);
    }
  };

  const openMessageDialog = async (session: VehicleSession) => {
    setMessageDialogSession(session);
    setMessageDraft('');
    setUnreadMessageCounts((current) => ({ ...current, [session.id]: 0 }));
    await loadSessionMessages(session.id);
  };

  const sendSessionMessage = async () => {
    if (!messageDialogSession || !messageDraft.trim()) return;

    setMessageSending(true);
    try {
      await api.post(`/sessions/${messageDialogSession.id}/messages`, { message: messageDraft.trim() });
      setMessageDraft('');
      await loadSessionMessages(messageDialogSession.id);
      setMessage('Message sent to customer session thread');
    } catch (err) {
      setMessage(`Error: ${(err as Error).message}`);
    } finally {
      setMessageSending(false);
    }
  };

  const submitPayment = async () => {
    if (!paymentDialogSession) return;
    setPaymentSending(true);
    try {
      await sessionApi.pay(paymentDialogSession.id, {
        paymentMethod,
        amount: paymentDialogSession.price,
        referenceNumber: paymentReference || null,
        paymentNotes: paymentNotes || null,
      });
      setMessage('Payment recorded successfully');
      setPaymentDialogSession(null);
      setPaymentHistory([]);
      await load();
    } catch (err) {
      setMessage(`Error: ${(err as Error).message}`);
    } finally {
      setPaymentSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 6,
          p: { xs: 2, md: 2.5 },
          background: 'linear-gradient(180deg, rgba(7,10,12,0.96), rgba(10,14,18,0.92))',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(135deg, rgba(6,10,13,0.72), rgba(8,12,16,0.9)), url("${sessionsWallpaper}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 44%',
            opacity: 0.9,
            filter: 'saturate(0.92) contrast(1.02)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at top left, rgba(255,255,255,0.05), transparent 22%), radial-gradient(circle at bottom right, rgba(14,165,233,0.14), transparent 24%)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(7,10,12,0.08), rgba(7,10,12,0.24) 48%, rgba(7,10,12,0.38))',
            pointerEvents: 'none',
          }}
        />
        <Stack spacing={4} sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Grid2 container spacing={3} alignItems="stretch">
            <Grid2 size={{ xs: 12, xl: 7 }}>
              <Paper sx={{ p: { xs: 3, md: 4 }, minHeight: '100%', position: 'relative', overflow: 'hidden', backdropFilter: 'blur(18px)', background: 'linear-gradient(180deg, rgba(20,16,14,0.96), rgba(15,12,10,0.93))' }}>
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
                    <Button
                      component="label"
                      variant="outlined"
                      disabled={!canCreateInCurrentView}
                      sx={{ borderRadius: 2, justifyContent: 'flex-start' }}
                    >
                      {vehicleImageUrl ? 'Replace car photo' : 'Add car photo'}
                      <input
                        hidden
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                          void handleVehiclePhotoChange(event.target.files?.[0] ?? null);
                        }}
                      />
                    </Button>
                    {vehicleImageUrl && (
                      <Box
                        component="img"
                        src={vehicleImageUrl}
                        alt="Vehicle preview"
                        sx={{
                          width: '100%',
                          maxHeight: 180,
                          objectFit: 'cover',
                          borderRadius: 2,
                          border: '1px solid rgba(148,163,184,0.16)',
                        }}
                      />
                    )}
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
                        <Typography variant="h6" sx={{ color: '#0ea5e9', fontWeight: 800 }}>{formatCurrency(finalEstimatedPrice)}</Typography>
                      </Box>
                    )}
                    <Stack spacing={1}>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        Add-on services
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {addOnOptions.map((addOn) => {
                          const selected = selectedAddOnServices.includes(addOn.serviceName);
                          return (
                            <Chip
                              key={addOn.id}
                              label={`${addOn.serviceName} (+${formatCurrency(addOn.basePrice)})${recommendedAddOnNames.includes(addOn.serviceName) ? ' • Recommended' : ''}`}
                              clickable
                              disabled={!canCreateInCurrentView}
                              onClick={() =>
                                setSelectedAddOnServices((prev) =>
                                  prev.includes(addOn.serviceName)
                                    ? prev.filter((entry) => entry !== addOn.serviceName)
                                    : [...prev, addOn.serviceName],
                                )
                              }
                              sx={{
                                bgcolor: selected ? 'rgba(14,165,233,0.18)' : 'rgba(148,163,184,0.08)',
                                color: selected ? '#8fd0e6' : 'text.secondary',
                                border: selected ? '1px solid rgba(14,165,233,0.34)' : '1px solid rgba(148,163,184,0.12)',
                              }}
                            />
                          );
                        })}
                      </Box>
                      {addOnOptions.length === 0 && (
                        <Typography variant="caption" color="text.secondary">
                          No active admin add-ons yet. Create `ADDON` services in admin to offer them here.
                        </Typography>
                      )}
                    </Stack>
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
                          background: 'rgba(24, 18, 15, 0.94)',
                          backdropFilter: 'blur(16px)',
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
                          {session.vehicleImageUrl && (
                            <Box
                              component="img"
                              src={session.vehicleImageUrl}
                              alt={`${session.registrationNumber} vehicle`}
                              sx={{
                                width: '100%',
                                height: 160,
                                objectFit: 'cover',
                                borderRadius: 3,
                                border: '1px solid rgba(148,163,184,0.14)',
                              }}
                            />
                          )}
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
                              {session.addOnServices && session.addOnServices.length > 0 && (
                                <Typography color="text.secondary" sx={{ fontSize: '0.85rem', mt: 0.5 }}>
                                  Add-ons: {session.addOnServices.join(', ')}
                                </Typography>
                              )}
                              {session.price !== undefined && (
                                <Typography sx={{ color: '#0ea5e9', fontWeight: 700, fontSize: '1.1rem', mt: 1 }}>
                                  {formatCurrency(session.price)} {session.paid && <Chip label="PAID" size="small" sx={{ ml: 1, bgcolor: 'rgba(14, 165, 233, 0.2)', color: '#0ea5e9', fontWeight: 800, height: 20 }} />}
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
                              {session.latestPayment && (
                                <Typography color="text.secondary" sx={{ fontSize: '0.82rem', mt: 0.6 }}>
                                  Last payment: {session.latestPayment.paymentMethod.replace('_', ' ')} • {new Date(session.latestPayment.paidAt).toLocaleString()}
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

                          {(() => {
                            const recommendation = getSessionRecommendation(session);
                            const tone = getRecommendationToneColor(recommendation.tone);

                            return (
                              <Box
                                sx={{
                                  p: 1.5,
                                  borderRadius: 2.5,
                                  border: `1px solid ${tone.border}`,
                                  bgcolor: tone.bg,
                                }}
                              >
                                <Typography sx={{ fontWeight: 700, color: tone.text, mb: 0.45 }}>
                                  Recommended next step
                                </Typography>
                                <Typography sx={{ fontWeight: 700, color: '#eef2f4', mb: 0.45 }}>
                                  {recommendation.title}
                                </Typography>
                                <Typography variant="body2" sx={{ color: tone.body, lineHeight: 1.6 }}>
                                  {recommendation.body}
                                </Typography>
                              </Box>
                            );
                          })()}

                          <Button
                            variant="outlined"
                            startIcon={<ChatBubbleOutline />}
                            onClick={() => { void openMessageDialog(session); }}
                            sx={{
                              borderRadius: 2,
                              borderColor: 'rgba(148,163,184,0.18)',
                              color: 'rgba(226,232,240,0.92)',
                              '&:hover': {
                                borderColor: 'rgba(56,189,248,0.42)',
                                bgcolor: 'rgba(56,189,248,0.08)'
                              }
                            }}
                          >
                            Messages {unreadMessageCounts[session.id] ? `(${unreadMessageCounts[session.id]})` : ''}
                          </Button>

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
                            session.status !== 'COMPLETED' && session.status !== 'EXPIRED' && (
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
                          {session.status === 'EXPIRED' && (
                            <Typography
                              variant="caption"
                              sx={{
                                display: 'block',
                                textAlign: 'center',
                                p: 1,
                                background: 'rgba(220, 38, 38, 0.12)',
                                color: '#fca5a5',
                                borderRadius: 1,
                              }}
                            >
                              Booking expired after 24 hours without customer check-in
                            </Typography>
                          )}
                        </Stack>
                      </Paper>
                    </motion.div>
                  </Grid2>
                ))}
              </AnimatePresence>
              {sessions.length === 0 && (
                <Grid2 size={{ xs: 12 }}>
                  <Paper sx={{ p: 4, borderRadius: 4, bgcolor: 'rgba(24, 18, 15, 0.9)', border: '1px solid rgba(148,163,184,0.12)', backdropFilter: 'blur(14px)' }}>
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
      </Box>

      <Dialog
        open={Boolean(messageDialogSession)}
        onClose={() => setMessageDialogSession(null)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            background: 'rgba(9, 14, 18, 0.96)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(148,163,184,0.12)',
            borderRadius: 4,
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Session Messages {messageDialogSession ? `• ${messageDialogSession.registrationNumber}` : ''}
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'rgba(148,163,184,0.12)' }}>
          <Stack spacing={2}>
            <Typography color="text.secondary">
              Send updates to the customer or respond to messages tied to this wash session.
            </Typography>
            <Paper
              sx={{
                p: 2,
                minHeight: 220,
                maxHeight: 340,
                overflowY: 'auto',
                bgcolor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(148,163,184,0.1)',
                borderRadius: 3,
                boxShadow: 'none',
              }}
            >
              <Stack spacing={1.5}>
                {messageLoading ? (
                  <Typography color="text.secondary">Loading messages...</Typography>
                ) : sessionMessages.length ? (
                  sessionMessages.map((item) => {
                    const isStaff = item.senderType === 'STAFF';
                    return (
                      <Stack key={item.id} spacing={0.65} alignItems={isStaff ? 'flex-end' : 'flex-start'}>
                        <Typography sx={{ color: 'text.secondary', fontSize: '0.78rem' }}>
                          {item.senderName} • {new Date(item.createdAt).toLocaleString()}
                        </Typography>
                        <Box
                          sx={{
                            px: 1.5,
                            py: 1.1,
                            borderRadius: 2.5,
                            maxWidth: '100%',
                            bgcolor: isStaff ? 'rgba(14,165,233,0.16)' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${isStaff ? 'rgba(14,165,233,0.28)' : 'rgba(148,163,184,0.12)'}`,
                          }}
                        >
                          <Typography sx={{ lineHeight: 1.55 }}>{item.message}</Typography>
                        </Box>
                      </Stack>
                    );
                  })
                ) : (
                  <Typography color="text.secondary">
                    No messages yet for this session.
                  </Typography>
                )}
              </Stack>
            </Paper>
            <TextField
              fullWidth
              multiline
              minRows={3}
              maxRows={5}
              label="Reply to customer"
              value={messageDraft}
              onChange={(event) => setMessageDraft(event.target.value)}
              placeholder="Let the customer know their wash has started, ask a question, or confirm pickup readiness."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setMessageDialogSession(null)} sx={{ color: 'text.secondary' }}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => { void sendSessionMessage(); }}
            disabled={messageSending || !messageDraft.trim()}
            sx={{
              borderRadius: 999,
              background: 'linear-gradient(135deg, #0ea5e9 0%, #10b360 100%)',
            }}
          >
            {messageSending ? 'Sending...' : 'Send message'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(paymentDialogSession)}
        onClose={() => setPaymentDialogSession(null)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            background: 'rgba(9, 14, 18, 0.96)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(148,163,184,0.12)',
            borderRadius: 4,
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Record Payment {paymentDialogSession ? `• ${paymentDialogSession.registrationNumber}` : ''}
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'rgba(148,163,184,0.12)' }}>
          <Stack spacing={2}>
            <Typography color="text.secondary">
              Capture the payment method, reference, and notes for this completed session.
            </Typography>
            {paymentDialogSession && (
              <Paper sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(148,163,184,0.1)', boxShadow: 'none' }}>
                <Stack spacing={0.7}>
                  <Typography sx={{ fontWeight: 700 }}>{paymentDialogSession.servicePackage}</Typography>
                  <Typography color="text.secondary">Amount due: {formatCurrency(paymentDialogSession.price)}</Typography>
                  <Typography color="text.secondary">Customer: {paymentDialogSession.customerName}</Typography>
                </Stack>
              </Paper>
            )}
            <TextField
              select
              fullWidth
              label="Payment method"
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
            >
              <MenuItem value="CASH">Cash</MenuItem>
              <MenuItem value="MOBILE_MONEY">Mobile Money</MenuItem>
              <MenuItem value="CARD">Card</MenuItem>
              <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Reference number"
              value={paymentReference}
              onChange={(event) => setPaymentReference(event.target.value)}
              placeholder="Transaction ID, receipt number, or teller reference"
            />
            <TextField
              fullWidth
              multiline
              minRows={3}
              maxRows={5}
              label="Payment notes"
              value={paymentNotes}
              onChange={(event) => setPaymentNotes(event.target.value)}
              placeholder="Optional cashier note"
            />
            {!!paymentHistory.length && (
              <Paper sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(148,163,184,0.1)', boxShadow: 'none' }}>
                <Stack spacing={1.2}>
                  <Typography sx={{ fontWeight: 700 }}>Payment history</Typography>
                  {paymentHistory.map((item) => (
                    <Box key={item.id}>
                      <Typography sx={{ fontWeight: 600 }}>
                        {item.paymentMethod.replace('_', ' ')} • {formatCurrency(item.amount)}
                      </Typography>
                      <Typography color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                        {new Date(item.paidAt).toLocaleString()}{item.processedByName ? ` • ${item.processedByName}` : ''}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setPaymentDialogSession(null)} sx={{ color: 'text.secondary' }}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => { void submitPayment(); }}
            disabled={paymentSending}
            sx={{
              borderRadius: 999,
              background: 'linear-gradient(135deg, #0ea5e9 0%, #10b360 100%)',
            }}
          >
            {paymentSending ? 'Saving...' : 'Save payment'}
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}
