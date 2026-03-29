import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  alpha,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid2,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
} from '@mui/material';
import {
  AccessTime,
  ChatBubbleOutline,
  CheckCircle,
  ContentCopy,
  DirectionsCar,
  Email,
  History,
  LocalOffer,
  Loyalty,
  NotificationsActive,
  Payment,
  Refresh,
  Stars,
  TaskAlt,
  Verified,
} from '@mui/icons-material';
import SignaturePad from 'react-signature-canvas';
import { motion } from 'framer-motion';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { PaymentMethod, SessionMessage, SessionMessageEvent, SessionStatus, VehicleSession } from '../types';
import { CustomerSessionTimeoutGuard } from '../components/customer/CustomerSessionTimeoutGuard';
import { CustomerContactStrip } from '../components/customer/CustomerContactStrip';
import { formatCurrency } from '../utils/currency';
import { customerSelectMenuProps } from '../utils/customerUi';
import { API_ORIGIN, WS_URL } from '../utils/constants';

const API_BASE = `${API_ORIGIN}/api/portal/sessions`;
const heroImage = '/cory-rogers-6l4CBNleEBE-unsplash.jpg';

const statusOrder: SessionStatus[] = ['REGISTERED', 'WASHING', 'INTERIOR', 'INSPECTION', 'COMPLETED'];

const pricingCards = [
  { title: 'Sedan', price: 'GHS 45', detail: 'Starting price' },
  { title: 'SUV', price: 'GHS 45', detail: 'Starting price' },
  { title: 'Truck / Van', price: 'GHS 45', detail: 'Starting price' },
];

function formatStage(status: SessionStatus) {
  return status.replace('_', ' ');
}

function formatRelativeDate(value?: string) {
  if (!value) return 'Just now';
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));

  if (diffHours < 1) return 'Less than 1 hour ago';
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString();
}

function getNotificationToneStyles(tone: string) {
  switch (tone) {
    case 'success':
      return { bg: 'rgba(88, 173, 135, 0.12)', border: 'rgba(88, 173, 135, 0.28)', color: '#8fe2b6' };
    case 'warning':
      return { bg: 'rgba(227, 170, 44, 0.12)', border: 'rgba(227, 170, 44, 0.28)', color: '#f0c96e' };
    default:
      return { bg: 'rgba(82, 151, 255, 0.12)', border: 'rgba(82, 151, 255, 0.26)', color: '#8ab9ff' };
  }
}

function buildStatusCopy(session: VehicleSession) {
  switch (session.status) {
    case 'REGISTERED':
      return 'Your vehicle is booked and waiting for wash lane handling.';
    case 'EXPIRED':
      return 'This booking expired because the scheduled arrival window passed without check-in.';
    case 'WASHING':
      return 'The wash process is active right now.';
    case 'INTERIOR':
      return 'Interior detailing is currently in progress.';
    case 'INSPECTION':
      return 'Final quality inspection is underway.';
    case 'COMPLETED':
      return session.paid ? 'Everything is complete and paid.' : 'Your wash is complete and waiting for payment.';
    default:
      return 'Your session is live.';
  }
}

const CustomerPortalPage: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const sigPad = useRef<SignaturePad>(null);
  const theme = useTheme();

  const [session, setSession] = useState<VehicleSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [messages, setMessages] = useState<SessionMessage[]>([]);
  const [messageDraft, setMessageDraft] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [unreadStaffMessages, setUnreadStaffMessages] = useState(0);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('MOBILE_MONEY');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  const fetchSession = async (background = false) => {
    if (!token) return;

    try {
      if (background) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(`${API_BASE}/${token}`);
      if (!response.ok) {
        throw new Error('Session not found or invalid portal link.');
      }

      const data = await response.json();
      setSession(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load the portal session.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchMessages = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE}/${token}/messages`);
      if (!response.ok) {
        throw new Error('Messages could not be loaded.');
      }
      const data: SessionMessage[] = await response.json();
      setMessages(data);
    } catch (err) {
      setError((current) => current ?? (err instanceof Error ? err.message : 'Messages could not be loaded.'));
    }
  };

  useEffect(() => {
    void fetchSession();
    void fetchMessages();
    const interval = window.setInterval(() => {
      void fetchSession(true);
      void fetchMessages();
    }, 15000);
    return () => window.clearInterval(interval);
  }, [token]);

  useEffect(() => {
    if (!session) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      client.subscribe(`/topic/session-messages/${session.id}`, (payload) => {
        const event = JSON.parse(payload.body) as SessionMessageEvent;
        setMessages((current) =>
          current.some((item) => item.id === event.message.id) ? current : [...current, event.message],
        );
        if (event.message.senderType === 'STAFF') {
          setUnreadStaffMessages((current) => current + 1);
        }
      });
    };

    client.activate();
    return () => {
      client.deactivate();
    };
  }, [session?.id]);

  const isExpired = session?.status === 'EXPIRED';
  const progress = session
    ? isExpired
      ? 0
      : ((statusOrder.indexOf(session.status) + 1) / statusOrder.length) * 100
    : 0;
  const stageCopy = session ? buildStatusCopy(session) : '';
  const appointmentText = session?.appointmentAt
    ? new Date(session.appointmentAt).toLocaleString()
    : 'Walk-in session';

  const handleCopyPortalLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Could not copy the portal link on this browser.');
    }
  };

  const handlePayment = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}/${token}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod,
          amount: session?.price,
          referenceNumber: paymentReference || null,
          paymentNotes: paymentNotes || null,
        }),
      });
      if (!response.ok) {
        throw new Error('Payment failed.');
      }
      setShowPaymentDialog(false);
      setPaymentReference('');
      setPaymentNotes('');
      await fetchSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!token || !messageDraft.trim()) return;

    try {
      setSendingMessage(true);
      setError(null);
      const response = await fetch(`${API_BASE}/${token}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageDraft.trim() }),
      });

      if (!response.ok) {
        throw new Error('Message could not be sent.');
      }

      setMessageDraft('');
      setUnreadStaffMessages(0);
      await fetchMessages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Message could not be sent.');
    } finally {
      setSendingMessage(false);
    }
  };

  const markMessagesRead = () => {
    setUnreadStaffMessages(0);
  };

  const openPaymentDialog = () => {
    setPaymentMethod('MOBILE_MONEY');
    setPaymentReference('');
    setPaymentNotes('');
    setShowPaymentDialog(true);
  };

  const handleSign = async () => {
    const pad = sigPad.current;
    if (!pad || pad.isEmpty() || !token || !session) return;

    try {
      setLoading(true);
      setError(null);
      const signatureData = pad.getTrimmedCanvas().toDataURL('image/png');
      const response = await fetch(`${API_BASE}/${token}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signedBy: session.customerName, signatureData }),
      });

      if (!response.ok) {
        throw new Error('Failed to save signature.');
      }

      setShowSignature(false);
      await fetchSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save signature.');
    } finally {
      setLoading(false);
    }
  };

  const handleRepeatBooking = () => {
    if (!session) return;

    const params = new URLSearchParams({
      branchId: String(session.branchId),
      reg: session.registrationNumber,
      name: session.customerName,
      phone: session.customerPhone ?? '',
      email: session.customerEmail ?? '',
      vehicleType: session.vehicleType,
      servicePackage: session.servicePackage,
    });
    session.addOnServices?.forEach((addOn) => params.append('addOn', addOn));

    navigate(`/portal/book?${params.toString()}`);
  };

  const nextActions = useMemo(() => {
    if (!session) return [];

    const actions = [
      `Branch: ${session.branchName}`,
      `Arrival: ${appointmentText}`,
      `Service: ${session.servicePackage}`,
      session.paid ? 'Payment received' : 'Payment pending',
    ];

    if (session.status === 'INSPECTION') {
      actions.unshift('Signature may be required before handoff');
    }

    return actions;
  }, [appointmentText, session]);

  const trackingStages = useMemo(
    () =>
      !session
        ? []
        : statusOrder.map((status, index) => {
        const currentIndex = statusOrder.indexOf(session.status);
        return {
          status,
          title: formatStage(status),
          active: currentIndex === index,
          complete: currentIndex > index,
          time:
            status === 'REGISTERED'
              ? session.registeredAt
              : status === 'WASHING'
                ? session.washingStartedAt
                : status === 'INTERIOR'
                ? session.interiorStartedAt
                : status === 'INSPECTION'
                  ? session.inspectionStartedAt
                  : session.completedAt,
        };
      }),
    [session],
  );

  const savedVehicles = useMemo(() => session?.savedVehicles ?? [], [session?.savedVehicles]);
  const notifications = useMemo(() => session?.notifications ?? [], [session?.notifications]);
  const recentSessions = useMemo(() => session?.recentSessions ?? [], [session?.recentSessions]);
  const loyaltyTier = session?.customerProfile?.loyaltyTier ?? 'Starter';
  const loyaltyPoints = session?.customerProfile?.loyaltyPoints ?? 0;
  const nextTierThreshold = loyaltyTier === 'Starter' ? 30 : loyaltyTier === 'Silver' ? 60 : loyaltyTier === 'Gold' ? 120 : loyaltyPoints;
  const loyaltyProgress = nextTierThreshold === loyaltyPoints ? 100 : Math.min(100, Math.round((loyaltyPoints / nextTierThreshold) * 100));

  const handleVehicleRebook = (
    registrationNumber: string,
    vehicleType?: string,
    servicePackage?: string,
    preferredAddOnServices?: string[],
  ) => {
    if (!session) return;
    const params = new URLSearchParams({
      branchId: String(session.branchId),
      reg: registrationNumber,
      name: session.customerName,
      phone: session.customerPhone ?? '',
      email: session.customerEmail ?? '',
      vehicleType: vehicleType ?? '',
      servicePackage: servicePackage ?? '',
    });
    (preferredAddOnServices ?? []).forEach((addOn) => params.append('addOn', addOn));
    navigate(`/portal/book?${params.toString()}`);
  };

  if (loading && !session) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: 'background.default' }}>
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  if (error && !session) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>
      </Container>
    );
  }

  if (!session) return null;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      <CustomerSessionTimeoutGuard />
      <Box
        sx={{
          minHeight: { xs: 520, md: 620 },
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'stretch',
          backgroundColor: '#12100f',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(90deg, rgba(18,16,15,0.74) 0%, rgba(18,16,15,0.56) 38%, rgba(18,16,15,0.2) 100%), url("${heroImage}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 42%',
          }}
        />
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: { xs: 3, md: 5 } }}>
          <Stack spacing={6}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <Box sx={{ width: 42, height: 42, borderRadius: '50%', bgcolor: '#e36b2c', display: 'grid', placeItems: 'center', color: 'white', fontWeight: 800 }}>
                  S
                </Box>
                <Box>
                  <Typography sx={{ color: '#fff8f1', fontWeight: 700, fontSize: '1.1rem' }}>Spark Wash Portal</Typography>
                  <Typography sx={{ color: 'rgba(255,244,233,0.7)', fontSize: '0.92rem' }}>Live customer access</Typography>
                </Box>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
                <Button variant="outlined" startIcon={<ContentCopy />} onClick={handleCopyPortalLink} sx={heroGhostButtonSx}>
                  {copied ? 'Link copied' : 'Copy link'}
                </Button>
                <Button variant="contained" startIcon={refreshing ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : <Refresh />} onClick={() => fetchSession(true)} sx={heroButtonSx}>
                  Refresh
                </Button>
              </Stack>
            </Stack>

            <Grid2 container spacing={4} alignItems="center">
              <Grid2 size={{ xs: 12, lg: 7 }}>
                <Stack spacing={2.5}>
                  <Chip label="Car Wash Delivery" sx={heroTagSx} />
                  <Typography variant="h1" sx={{ color: '#fff8f1', maxWidth: 760, lineHeight: 0.95 }}>
                    Your wash session, delivered with the same premium feel as the booking site
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,244,233,0.78)', maxWidth: 620, fontSize: '1.04rem', lineHeight: 1.7 }}>
                    Track your vehicle, confirm the next steps, handle payment, and keep your live service link all from one customer page.
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} useFlexGap flexWrap="wrap">
                    <Chip icon={<DirectionsCar sx={{ color: '#fff' }} />} label={session.registrationNumber} sx={heroChipSx} />
                    <Chip icon={<AccessTime sx={{ color: '#fff' }} />} label={appointmentText} sx={heroChipSx} />
                    <Chip icon={<Verified sx={{ color: '#fff' }} />} label={formatStage(session.status)} sx={heroChipSx} />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                    {!session.paid && !isExpired && (
                      <Button variant="contained" startIcon={<Payment />} onClick={openPaymentDialog} sx={heroButtonSx}>
                        Pay now
                      </Button>
                    )}
                    {session.status === 'INSPECTION' && !isExpired && (
                      <Button variant="outlined" startIcon={<TaskAlt />} onClick={() => setShowSignature(true)} sx={heroGhostButtonSx}>
                        Sign approval
                      </Button>
                    )}
                    <Button variant="outlined" onClick={handleRepeatBooking} sx={heroGhostButtonSx}>
                      Book again
                    </Button>
                  </Stack>
                </Stack>
              </Grid2>

              <Grid2 size={{ xs: 12, lg: 5 }}>
                <Paper sx={heroSessionCardSx}>
                  <Stack spacing={2.5}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography sx={{ fontWeight: 800, fontSize: '1.12rem' }}>Current session</Typography>
                      <Chip label={session.paid ? 'Paid' : 'Open'} sx={session.paid ? paidChipSx : openChipSx} />
                    </Stack>
                    <Typography variant="h3" sx={{ fontWeight: 700, lineHeight: 1 }}>
                      {session.servicePackage}
                    </Typography>
                    <Typography sx={{ color: 'text.secondary' }}>{stageCopy}</Typography>
                    {isExpired && (
                      <Alert severity="warning" sx={{ borderRadius: 3 }}>
                        This booking expired after 24 hours past the selected arrival time. Please book a new session to continue.
                      </Alert>
                    )}
                    <Box sx={{ height: 10, borderRadius: 999, bgcolor: alpha(theme.palette.primary.main, 0.14), overflow: 'hidden' }}>
                      <Box sx={{ width: `${Math.max(progress, 8)}%`, height: '100%', bgcolor: 'primary.main', borderRadius: 999, transition: 'width 0.3s ease' }} />
                    </Box>
                    <Grid2 container spacing={1.5}>
                      <Grid2 size={{ xs: 6 }}>
                        <InfoTile label="Customer" value={session.customerName} />
                      </Grid2>
                      <Grid2 size={{ xs: 6 }}>
                        <InfoTile label="Vehicle" value={session.vehicleType} />
                      </Grid2>
                          <Grid2 size={{ xs: 6 }}>
                            <InfoTile label="Branch" value={session.branchName} />
                          </Grid2>
                          <Grid2 size={{ xs: 6 }}>
                            <InfoTile label="Price" value={formatCurrency(session.price ?? 45)} />
                          </Grid2>
                          <Grid2 size={{ xs: 12 }}>
                            <InfoTile label="Add-ons" value={session.addOnServices?.length ? session.addOnServices.join(', ') : 'None selected'} />
                          </Grid2>
                          {session.latestPayment && (
                            <Grid2 size={{ xs: 12 }}>
                              <InfoTile
                                label="Last payment"
                                value={`${session.latestPayment.paymentMethod.replace('_', ' ')} • ${new Date(session.latestPayment.paidAt).toLocaleString()}`}
                              />
                            </Grid2>
                          )}
                        </Grid2>
                      </Stack>
                    </Paper>
              </Grid2>
            </Grid2>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: { xs: 5, md: 7 } }}>
        <Stack spacing={6}>
          {error && <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>}

          <Grid2 container spacing={3}>
            {pricingCards.map((card) => (
              <Grid2 key={card.title} size={{ xs: 12, md: 4 }}>
                <Paper sx={pricingCardSx}>
                  <Typography sx={{ color: '#7d7066', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.74rem' }}>
                    {card.title}
                  </Typography>
                  <Typography sx={{ mt: 1.2, fontSize: '2.6rem', fontWeight: 800, lineHeight: 1 }}>
                    {card.price}
                  </Typography>
                  <Typography sx={{ mt: 0.8, color: '#7d7066' }}>{card.detail}</Typography>
                  {session.vehicleType.toLowerCase().includes(card.title.toLowerCase().split(' ')[0]) && (
                    <Chip label="Closest match" sx={{ mt: 2, bgcolor: 'rgba(227,107,44,0.1)', color: '#9e4c24' }} />
                  )}
                </Paper>
              </Grid2>
            ))}
          </Grid2>

          <Grid2 container spacing={4}>
            <Grid2 size={{ xs: 12, lg: 7 }}>
              <Stack spacing={3}>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  Track your session
                </Typography>
                <Typography sx={{ color: 'text.secondary', maxWidth: 760 }}>
                  Follow each stage of your wash in real time, see what has already been completed, and know exactly what comes next.
                </Typography>
                <Paper sx={sectionCardSx}>
                  <Stack spacing={2.2}>
                    {trackingStages.map((item, index) => (
                      <Stack key={item.status} direction="row" spacing={2} alignItems="flex-start">
                        <Stack alignItems="center" spacing={0.8}>
                          <Box
                            sx={{
                              width: 34,
                              height: 34,
                              borderRadius: '50%',
                              display: 'grid',
                              placeItems: 'center',
                              bgcolor: item.complete || item.active ? 'primary.main' : alpha(theme.palette.common.white, 0.06),
                              color: item.complete || item.active ? '#fffaf5' : 'text.secondary',
                              border: `1px solid ${item.complete || item.active ? alpha(theme.palette.primary.main, 0.45) : theme.palette.divider}`,
                            }}
                          >
                            {item.complete ? <CheckCircle sx={{ fontSize: 18 }} /> : <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{index + 1}</Typography>}
                          </Box>
                          {index < trackingStages.length - 1 && (
                            <Box
                              sx={{
                                width: 2,
                                flex: 1,
                                minHeight: 28,
                                bgcolor: item.complete ? alpha(theme.palette.primary.main, 0.42) : theme.palette.divider,
                              }}
                            />
                          )}
                        </Stack>
                        <Box sx={{ pt: 0.35 }}>
                          <Typography sx={{ fontWeight: item.active ? 800 : 700, color: 'text.primary' }}>
                            {item.title}
                          </Typography>
                          <Typography sx={{ color: item.active ? 'primary.main' : 'text.secondary', mt: 0.4 }}>
                            {item.complete
                              ? 'Completed'
                              : item.active
                                ? 'Currently in progress'
                                : 'Waiting for this stage'}
                            {item.time ? ` • ${new Date(item.time).toLocaleString()}` : ''}
                          </Typography>
                        </Box>
                      </Stack>
                    ))}
                  </Stack>
                </Paper>
                <Paper sx={sectionCardSx}>
                  <Grid2 container spacing={2.5}>
                    {nextActions.map((item) => (
                      <Grid2 key={item} size={{ xs: 12, sm: 6 }}>
                        <Stack direction="row" spacing={1.25} alignItems="flex-start">
                          <Box sx={{ mt: 0.2, width: 28, height: 28, borderRadius: '50%', bgcolor: 'rgba(227,107,44,0.1)', display: 'grid', placeItems: 'center' }}>
                            <CheckCircle sx={{ color: '#e36b2c', fontSize: 18 }} />
                          </Box>
                          <Typography sx={{ color: 'text.primary' }}>{item}</Typography>
                        </Stack>
                      </Grid2>
                    ))}
                  </Grid2>
                </Paper>

                <Paper sx={sectionCardSx}>
                  <Stack spacing={2.2}>
                    <Stack direction="row" spacing={1.2} alignItems="center">
                      <Box sx={sectionIconSx}>
                        <DirectionsCar sx={{ color: '#e36b2c', fontSize: 18 }} />
                      </Box>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                          Saved vehicles
                        </Typography>
                        <Typography sx={{ color: 'text.secondary' }}>
                          Jump back into booking with the vehicles you use most.
                        </Typography>
                      </Box>
                    </Stack>
                    <Grid2 container spacing={2}>
                      {savedVehicles.length ? savedVehicles.map((vehicle) => (
                        <Grid2 key={vehicle.registrationNumber} size={{ xs: 12, md: 6 }}>
                          <Paper sx={savedVehicleCardSx}>
                            <Stack spacing={1.3}>
                              <Stack direction="row" justifyContent="space-between" spacing={1.5}>
                                <Box>
                                  <Typography sx={{ fontWeight: 800 }}>{vehicle.registrationNumber}</Typography>
                                  <Typography sx={{ color: 'text.secondary', fontSize: '0.92rem' }}>
                                    {vehicle.vehicleType || 'Vehicle on file'}
                                  </Typography>
                                </Box>
                                <Chip
                                  label={`${vehicle.totalSessions} visit${vehicle.totalSessions === 1 ? '' : 's'}`}
                                  sx={{ bgcolor: 'rgba(227,107,44,0.12)', color: '#e9a37f', fontWeight: 700 }}
                                />
                              </Stack>
                              <Typography sx={{ color: 'text.secondary', fontSize: '0.93rem' }}>
                                Preferred wash: {vehicle.preferredServicePackage || 'Standard service'}
                              </Typography>
                              <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                                Last branch: {vehicle.lastBranchName || session.branchName} • {formatRelativeDate(vehicle.lastSeenAt)}
                              </Typography>
                              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={() =>
                                    handleVehicleRebook(
                                      vehicle.registrationNumber,
                                      vehicle.vehicleType,
                                      vehicle.preferredServicePackage,
                                      vehicle.preferredAddOnServices,
                                    )
                                  }
                                  sx={compactCtaButtonSx}
                                >
                                  Rebook this vehicle
                                </Button>
                                {!!vehicle.preferredAddOnServices?.length && (
                                  <Chip
                                    label={vehicle.preferredAddOnServices.join(', ')}
                                    sx={{ maxWidth: '100%', '& .MuiChip-label': { whiteSpace: 'normal' } }}
                                  />
                                )}
                              </Stack>
                            </Stack>
                          </Paper>
                        </Grid2>
                      )) : (
                        <Grid2 size={{ xs: 12 }}>
                          <Typography sx={{ color: 'text.secondary' }}>
                            Your saved vehicles will appear here after more bookings are completed.
                          </Typography>
                        </Grid2>
                      )}
                    </Grid2>
                  </Stack>
                </Paper>

                <Paper sx={sectionCardSx}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                    Add-on services
                  </Typography>
                  <Grid2 container spacing={2}>
                    {(session.addOnServices?.length ? session.addOnServices : ['No add-on services selected']).map((item) => (
                      <Grid2 key={item} size={{ xs: 12, sm: 6 }}>
                        <Paper sx={extraItemSx}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <LocalOffer sx={{ color: 'primary.main', fontSize: 18 }} />
                            <Typography sx={{ fontWeight: 600 }}>{item}</Typography>
                          </Stack>
                        </Paper>
                      </Grid2>
                    ))}
                  </Grid2>
                </Paper>

                <Paper sx={sectionCardSx}>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1.2} alignItems="center">
                      <Box sx={sectionIconSx}>
                        <History sx={{ color: '#e36b2c', fontSize: 18 }} />
                      </Box>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                          Wash history
                        </Typography>
                        <Typography sx={{ color: 'text.secondary' }}>
                          Your recent completed and in-progress sessions.
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack spacing={1.4}>
                      {recentSessions.length ? recentSessions.map((item) => (
                        <Paper key={item.sessionId} sx={historyCardSx}>
                          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5}>
                            <Box>
                              <Typography sx={{ fontWeight: 700 }}>
                                {item.registrationNumber} • {item.servicePackage}
                              </Typography>
                              <Typography sx={{ color: 'text.secondary', fontSize: '0.92rem', mt: 0.4 }}>
                                {item.branchName || session.branchName} • {item.vehicleType || 'Vehicle'} • {formatRelativeDate(item.completedAt || item.createdAt)}
                              </Typography>
                              {!!item.addOnServices?.length && (
                                <Typography sx={{ color: 'text.secondary', fontSize: '0.88rem', mt: 0.65 }}>
                                  Extras: {item.addOnServices.join(', ')}
                                </Typography>
                              )}
                            </Box>
                            <Stack alignItems={{ xs: 'flex-start', sm: 'flex-end' }} spacing={0.8}>
                              <Chip label={formatStage(item.status)} sx={historyStatusChipSx} />
                              <Typography sx={{ fontWeight: 700 }}>
                                {formatCurrency(item.price)}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Paper>
                      )) : (
                        <Typography sx={{ color: 'text.secondary' }}>
                          More wash history will appear here as you complete more sessions.
                        </Typography>
                      )}
                    </Stack>
                  </Stack>
                </Paper>
              </Stack>
            </Grid2>

            <Grid2 size={{ xs: 12, lg: 5 }}>
              <Stack spacing={3}>
                <Paper sx={sectionCardSx}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                    Customer actions
                  </Typography>
                  <Stack spacing={1.5}>
                    {!session.paid && (
                      <Button variant="contained" startIcon={<Payment />} onClick={openPaymentDialog} sx={ctaButtonSx}>
                        Complete payment
                      </Button>
                    )}
                    {session.status === 'INSPECTION' && (
                      <Button variant="outlined" startIcon={<Verified />} onClick={() => setShowSignature(true)} sx={secondaryButtonSx}>
                        Open signature approval
                      </Button>
                    )}
                    <Button variant="outlined" startIcon={<ContentCopy />} onClick={handleCopyPortalLink} sx={secondaryButtonSx}>
                      {copied ? 'Portal link copied' : 'Copy session link'}
                    </Button>
                    <Button variant="outlined" startIcon={<DirectionsCar />} onClick={handleRepeatBooking} sx={secondaryButtonSx}>
                      Book this wash again
                    </Button>
                  </Stack>
                </Paper>

                <Paper sx={sectionCardSx}>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1.2} alignItems="center">
                      <Box sx={sectionIconSx}>
                        <Loyalty sx={{ color: '#e36b2c', fontSize: 18 }} />
                      </Box>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                          Loyalty and rewards
                        </Typography>
                        <Typography sx={{ color: 'text.secondary' }}>
                          Track your tier, points, and progress to the next reward level.
                        </Typography>
                      </Box>
                    </Stack>
                    <Paper sx={loyaltyCardSx}>
                      <Stack spacing={1.8}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Stars sx={{ color: '#f2b24f' }} />
                            <Typography sx={{ fontWeight: 800 }}>{loyaltyTier} member</Typography>
                          </Stack>
                          <Chip label={`${loyaltyPoints} pts`} sx={{ bgcolor: 'rgba(242,178,79,0.12)', color: '#ffd58b', fontWeight: 700 }} />
                        </Stack>
                        <Typography sx={{ color: 'text.secondary' }}>
                          {loyaltyTier === 'Platinum'
                            ? 'You are already at the highest loyalty tier.'
                            : `${Math.max(0, nextTierThreshold - loyaltyPoints)} more points to reach the next tier.`}
                        </Typography>
                        <Box sx={{ height: 10, borderRadius: 999, bgcolor: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                          <Box sx={{ width: `${Math.max(loyaltyProgress, 8)}%`, height: '100%', bgcolor: '#f2b24f', borderRadius: 999 }} />
                        </Box>
                        <Grid2 container spacing={1.5}>
                          <Grid2 size={{ xs: 6 }}>
                            <InfoTile label="Visits" value={String(session.customerProfile?.totalVisits ?? 0)} />
                          </Grid2>
                          <Grid2 size={{ xs: 6 }}>
                            <InfoTile label="Last vehicle" value={session.customerProfile?.lastVehicleRegistration || session.registrationNumber} />
                          </Grid2>
                        </Grid2>
                      </Stack>
                    </Paper>
                  </Stack>
                </Paper>

                <Paper sx={sectionCardSx}>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1.2} alignItems="center">
                      <Box sx={sectionIconSx}>
                        <NotificationsActive sx={{ color: '#e36b2c', fontSize: 18 }} />
                      </Box>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                          Notifications
                        </Typography>
                        <Typography sx={{ color: 'text.secondary' }}>
                          Live customer-facing updates for this wash session.
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack spacing={1.35}>
                      {notifications.length ? notifications.map((item, index) => {
                        const toneStyles = getNotificationToneStyles(item.tone);
                        return (
                          <Paper
                            key={`${item.title}-${index}`}
                            sx={{
                              p: 1.8,
                              borderRadius: 3,
                              bgcolor: toneStyles.bg,
                              border: `1px solid ${toneStyles.border}`,
                              boxShadow: 'none',
                            }}
                          >
                            <Stack spacing={0.5}>
                              <Stack direction="row" justifyContent="space-between" spacing={2}>
                                <Typography sx={{ fontWeight: 700, color: toneStyles.color }}>{item.title}</Typography>
                                <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                                  {item.occurredAt ? new Date(item.occurredAt).toLocaleString() : 'Live'}
                                </Typography>
                              </Stack>
                              <Typography sx={{ color: 'text.secondary', fontSize: '0.93rem', lineHeight: 1.55 }}>
                                {item.body}
                              </Typography>
                            </Stack>
                          </Paper>
                        );
                      }) : (
                        <Typography sx={{ color: 'text.secondary' }}>
                          New session updates will appear here automatically.
                        </Typography>
                      )}
                    </Stack>
                  </Stack>
                </Paper>

                <Paper sx={sectionCardSx}>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1.2} alignItems="center">
                      <Box sx={sectionIconSx}>
                        <ChatBubbleOutline sx={{ color: '#e36b2c', fontSize: 18 }} />
                      </Box>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                          Message the team
                        </Typography>
                        <Typography sx={{ color: 'text.secondary' }}>
                          Send questions or updates to staff for this wash session.
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                      <Chip
                        label={unreadStaffMessages ? `${unreadStaffMessages} unread staff message${unreadStaffMessages === 1 ? '' : 's'}` : 'No unread staff messages'}
                        sx={{
                          bgcolor: unreadStaffMessages ? 'rgba(227,107,44,0.14)' : 'rgba(255,255,255,0.06)',
                          color: unreadStaffMessages ? '#ffb089' : 'text.secondary',
                          fontWeight: 700,
                        }}
                      />
                      {unreadStaffMessages > 0 && (
                        <Button variant="text" onClick={markMessagesRead} sx={{ color: '#f3c49d' }}>
                          Mark as read
                        </Button>
                      )}
                    </Stack>
                    <Paper sx={messageThreadSx}>
                      <Stack spacing={1.2} divider={<Divider flexItem sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />}>
                        {messages.length ? messages.map((item) => {
                          const isCustomer = item.senderType === 'CUSTOMER';
                          return (
                            <Stack key={item.id} spacing={0.7} alignItems={isCustomer ? 'flex-end' : 'flex-start'}>
                              <Typography sx={{ color: 'text.secondary', fontSize: '0.78rem' }}>
                                {item.senderName} • {new Date(item.createdAt).toLocaleString()}
                              </Typography>
                              <Box
                                sx={{
                                  maxWidth: '100%',
                                  px: 1.5,
                                  py: 1.1,
                                  borderRadius: 2.5,
                                  bgcolor: isCustomer ? 'rgba(227,107,44,0.16)' : 'rgba(255,255,255,0.05)',
                                  border: `1px solid ${isCustomer ? 'rgba(227,107,44,0.3)' : 'rgba(255,255,255,0.08)'}`,
                                }}
                              >
                                <Typography sx={{ lineHeight: 1.6 }}>{item.message}</Typography>
                              </Box>
                            </Stack>
                          );
                        }) : (
                          <Typography sx={{ color: 'text.secondary' }}>
                            No messages yet. Start a conversation with the team here.
                          </Typography>
                        )}
                      </Stack>
                    </Paper>
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      maxRows={5}
                      label="Message staff"
                      value={messageDraft}
                      onChange={(event) => setMessageDraft(event.target.value)}
                      placeholder="Ask a question, say you’re arriving, or request an update."
                    />
                    <Button
                      variant="contained"
                      startIcon={<ChatBubbleOutline />}
                      onClick={handleSendMessage}
                      disabled={sendingMessage || !messageDraft.trim()}
                      sx={ctaButtonSx}
                    >
                      {sendingMessage ? 'Sending...' : 'Send message'}
                    </Button>
                  </Stack>
                </Paper>

                <Paper sx={sectionCardSx}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                    Contact
                  </Typography>
                  <Stack spacing={1.4}>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <Email sx={{ color: '#e36b2c' }} />
                      <Typography>info@sparkcarwash.us</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <DirectionsCar sx={{ color: '#e36b2c' }} />
                      <Typography>{session.branchName}</Typography>
                    </Stack>
                    <Typography sx={{ color: 'text.secondary' }}>
                      Keep this page open for live updates. If the team asks for confirmation or payment, use the buttons above.
                    </Typography>
                  </Stack>
                </Paper>
              </Stack>
            </Grid2>
          </Grid2>

          {showSignature && (
            <Paper sx={signatureCardSx}>
              <Stack spacing={2}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Signature approval
                </Typography>
                <Typography sx={{ color: 'text.secondary' }}>
                  Sign below when the team requests final approval for release.
                </Typography>
                <Box sx={{ bgcolor: theme.palette.background.paper, borderRadius: 2.5, overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
                  <SignaturePad
                    ref={sigPad}
                    canvasProps={{ width: 860, height: 220, style: { width: '100%', height: 220, display: 'block' } }}
                  />
                </Box>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <Button variant="contained" onClick={handleSign} sx={ctaButtonSx}>
                    Save signature
                  </Button>
                  <Button variant="outlined" onClick={() => sigPad.current?.clear()} sx={secondaryButtonSx}>
                    Clear
                  </Button>
                  <Button variant="text" onClick={() => setShowSignature(false)} sx={{ color: 'text.secondary', width: 'fit-content' }}>
                    Close
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          )}

          <Dialog
            open={showPaymentDialog}
            onClose={() => setShowPaymentDialog(false)}
            fullWidth
            maxWidth="sm"
            PaperProps={{
              sx: {
                bgcolor: 'rgba(18,13,10,0.96)',
                border: '1px solid rgba(255,244,233,0.14)',
                borderRadius: 4,
                backdropFilter: 'blur(14px)',
              }
            }}
          >
            <DialogTitle sx={{ fontWeight: 700 }}>Complete payment</DialogTitle>
            <DialogContent dividers sx={{ borderColor: 'rgba(255,244,233,0.12)' }}>
              <Stack spacing={2}>
                <Typography sx={{ color: 'text.secondary' }}>
                  Choose how you paid so the branch and your receipt both show the correct payment details.
                </Typography>
                <Paper sx={paymentSummaryCardSx}>
                  <Stack spacing={0.7}>
                    <Typography sx={{ fontWeight: 700 }}>{session.servicePackage}</Typography>
                    <Typography sx={{ color: 'text.secondary' }}>Amount: {formatCurrency(session.price)}</Typography>
                    <Typography sx={{ color: 'text.secondary' }}>Vehicle: {session.registrationNumber}</Typography>
                  </Stack>
                </Paper>
                <TextField
                  select
                  fullWidth
                  label="Payment method"
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
                  SelectProps={{ MenuProps: customerSelectMenuProps }}
                >
                  <MenuItem value="MOBILE_MONEY">Mobile Money</MenuItem>
                  <MenuItem value="CARD">Card</MenuItem>
                  <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
                  <MenuItem value="CASH">Cash</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  label="Reference number"
                  value={paymentReference}
                  onChange={(event) => setPaymentReference(event.target.value)}
                  placeholder="Transaction ID or confirmation number"
                />
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  maxRows={5}
                  label="Payment notes"
                  value={paymentNotes}
                  onChange={(event) => setPaymentNotes(event.target.value)}
                  placeholder="Optional note for the branch"
                />
                {!!session.paymentHistory?.length && (
                  <Paper sx={paymentSummaryCardSx}>
                    <Stack spacing={1.1}>
                      <Typography sx={{ fontWeight: 700 }}>Payment history</Typography>
                      {session.paymentHistory.map((item) => (
                        <Box key={item.id}>
                          <Typography sx={{ fontWeight: 600 }}>
                            {item.paymentMethod.replace('_', ' ')} • {formatCurrency(item.amount)}
                          </Typography>
                          <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                            {new Date(item.paidAt).toLocaleString()}{item.referenceNumber ? ` • ${item.referenceNumber}` : ''}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Paper>
                )}
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button onClick={() => setShowPaymentDialog(false)} sx={{ color: 'text.secondary' }}>
                Cancel
              </Button>
              <Button variant="contained" startIcon={<Payment />} onClick={handlePayment} sx={ctaButtonSx}>
                Confirm payment
              </Button>
            </DialogActions>
          </Dialog>

          <Divider />

          <Typography sx={{ color: 'text.secondary', textAlign: 'center', pb: 2 }}>
            Live tracking active for {session.registrationNumber}
          </Typography>
        </Stack>
      </Container>

      <CustomerContactStrip />
    </Box>
  );
};

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <Paper sx={(theme) => ({ p: 1.6, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.08), border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' })}>
      <Typography sx={{ color: 'text.secondary', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </Typography>
      <Typography sx={{ mt: 0.6, fontWeight: 700, color: 'text.primary' }}>
        {value}
      </Typography>
    </Paper>
  );
}

const heroTagSx = {
  width: 'fit-content',
  bgcolor: 'rgba(255,248,241,0.14)',
  color: '#fff8f1',
  border: '1px solid rgba(255,248,241,0.22)',
  fontWeight: 700,
};

const heroChipSx = {
  bgcolor: 'rgba(255,248,241,0.1)',
  color: '#fff8f1',
  border: '1px solid rgba(255,248,241,0.18)',
  fontWeight: 600,
};

const heroButtonSx = {
  bgcolor: '#e36b2c',
  color: '#fffaf5',
  px: 3,
  py: 1.35,
  borderRadius: 999,
  '&:hover': {
    bgcolor: '#cf5d21',
  },
};

const heroGhostButtonSx = {
  color: '#fff8f1',
  borderColor: 'rgba(255,248,241,0.26)',
  px: 3,
  py: 1.35,
  borderRadius: 999,
  '&:hover': {
    borderColor: 'rgba(255,248,241,0.46)',
    bgcolor: 'rgba(255,248,241,0.06)',
  },
};

const heroSessionCardSx = {
  p: 3.25,
  borderRadius: 5,
  bgcolor: 'rgba(18,13,10,0.88)',
  border: '1px solid rgba(255,244,233,0.26)',
  boxShadow: '0 22px 42px rgba(0,0,0,0.18)',
  color: '#f5ede5',
};

const pricingCardSx = {
  p: 3,
  borderRadius: 4,
  height: '100%',
  bgcolor: 'rgba(255,247,240,0.05)',
};

const sectionCardSx = {
  p: 3,
  borderRadius: 4,
  bgcolor: 'rgba(255,247,240,0.05)',
};

const sectionIconSx = {
  width: 32,
  height: 32,
  borderRadius: '50%',
  bgcolor: 'rgba(227,107,44,0.12)',
  display: 'grid',
  placeItems: 'center',
  flexShrink: 0,
};

const extraItemSx = {
  p: 1.8,
  borderRadius: 3,
  bgcolor: 'rgba(227,107,44,0.06)',
  border: '1px solid rgba(255,243,232,0.08)',
  boxShadow: 'none',
};

const signatureCardSx = {
  p: 3,
  borderRadius: 4,
  bgcolor: 'rgba(255,247,240,0.05)',
};

const ctaButtonSx = {
  bgcolor: '#e36b2c',
  color: '#fffaf5',
  borderRadius: 999,
  py: 1.35,
  '&:hover': {
    bgcolor: '#cf5d21',
  },
};

const secondaryButtonSx = {
  color: '#f5ede5',
  borderColor: 'rgba(255,243,232,0.14)',
  borderRadius: 999,
  py: 1.2,
  '&:hover': {
    borderColor: 'rgba(255,243,232,0.24)',
    bgcolor: 'rgba(255,247,240,0.05)',
  },
};

const compactCtaButtonSx = {
  ...ctaButtonSx,
  py: 1,
  px: 2,
  width: 'fit-content',
};

const paidChipSx = {
  bgcolor: 'rgba(79,155,136,0.12)',
  color: '#3f796b',
  fontWeight: 700,
};

const openChipSx = {
  bgcolor: 'rgba(227,107,44,0.12)',
  color: '#9e4c24',
  fontWeight: 700,
};

const savedVehicleCardSx = {
  p: 2,
  borderRadius: 3.2,
  bgcolor: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.06)',
  boxShadow: 'none',
  height: '100%',
};

const historyCardSx = {
  p: 1.8,
  borderRadius: 3,
  bgcolor: 'rgba(255,255,255,0.025)',
  border: '1px solid rgba(255,255,255,0.06)',
  boxShadow: 'none',
};

const historyStatusChipSx = {
  bgcolor: 'rgba(227,107,44,0.12)',
  color: '#efb393',
  fontWeight: 700,
};

const loyaltyCardSx = {
  p: 2.2,
  borderRadius: 3.2,
  bgcolor: 'rgba(242,178,79,0.05)',
  border: '1px solid rgba(242,178,79,0.14)',
  boxShadow: 'none',
};

const messageThreadSx = {
  p: 1.6,
  borderRadius: 3.2,
  bgcolor: 'rgba(255,255,255,0.025)',
  border: '1px solid rgba(255,255,255,0.06)',
  boxShadow: 'none',
  maxHeight: 340,
  overflowY: 'auto',
};

const paymentSummaryCardSx = {
  p: 2,
  borderRadius: 3.2,
  bgcolor: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.06)',
  boxShadow: 'none',
};

export default CustomerPortalPage;
