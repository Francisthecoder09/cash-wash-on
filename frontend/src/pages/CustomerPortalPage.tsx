import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  LinearProgress,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  ContentCopy as CopyIcon,
  ContentPasteGo as StatusIcon,
  Draw as SignIcon,
  EmojiEvents as LoyaltyIcon,
  EventAvailable as SlotIcon,
  History as HistoryIcon,
  LocalOffer as OfferIcon,
  MarkUnreadChatAlt as MessageIcon,
  Payment as PaymentIcon,
  Refresh as RefreshIcon,
  Schedule as ClockIcon,
  TaskAlt as TaskAltIcon,
} from '@mui/icons-material';
import SignaturePad from 'react-signature-canvas';
import { AnimatePresence, motion } from 'framer-motion';
import { SessionStatus, VehicleSession } from '../types';
import { API_ORIGIN } from '../utils/constants';

const API_BASE = `${API_ORIGIN}/api/portal/sessions`;
const statusSteps: SessionStatus[] = ['REGISTERED', 'WASHING', 'INTERIOR', 'INSPECTION', 'COMPLETED'];

const CustomerPortalPage: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const [session, setSession] = useState<VehicleSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [copied, setCopied] = useState(false);
  const sigPad = useRef<SignaturePad>(null);

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
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load the portal session.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSession();
    const interval = setInterval(() => fetchSession(true), 10000);
    return () => clearInterval(interval);
  }, [token]);

  const handleSign = async () => {
    const pad = sigPad.current;
    if (!pad || pad.isEmpty()) return;

    try {
      setLoading(true);
      setError(null);
      const signatureData = pad.getTrimmedCanvas().toDataURL('image/png');
      const response = await fetch(`${API_BASE}/${token}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signedBy: session?.customerName, signatureData }),
      });

      if (!response.ok) {
        throw new Error('Failed to save signature.');
      }

      setSigning(false);
      await fetchSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save signature.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}/${token}/pay`, { method: 'POST' });
      if (!response.ok) {
        throw new Error('Payment failed.');
      }
      await fetchSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPortalLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Could not copy the portal link on this browser.');
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

    navigate(`/portal/book?${params.toString()}`);
  };

  const activeStep = session ? statusSteps.indexOf(session.status) : 0;
  const progress = session ? ((activeStep + 1) / statusSteps.length) * 100 : 0;
  const bookedSlotText = session?.appointmentAt ? new Date(session.appointmentAt).toLocaleString() : 'Walk-in session';
  const currentStageLabel = session ? statusSteps[Math.max(activeStep, 0)] : 'REGISTERED';
  const customerProfile = session?.customerProfile;
  const recentSessions = session?.recentSessions ?? [];

  const nextAction = useMemo(() => {
    if (!session) return 'We are preparing your live wash tracking details.';
    switch (session.status) {
      case 'REGISTERED':
        return 'Your vehicle is checked in and queued for wash lane handling.';
      case 'WASHING':
        return 'The exterior wash is underway. Keep this page open for live updates.';
      case 'INTERIOR':
        return 'Interior detailing is in progress. The next stop is final inspection.';
      case 'INSPECTION':
        return 'Final inspection is ready. Review the handoff and sign when the team prompts you.';
      case 'COMPLETED':
        return session.paid
          ? 'Everything is complete and paid. The vehicle is ready for collection.'
          : 'Your wash is complete. Payment is the final step before release.';
      default:
        return 'Stay on this page for the latest session updates.';
    }
  }, [session]);

  const recommendedCard = useMemo(() => {
    if (!session) return { title: 'Preparing your session', body: 'We are connecting your booking to the live wash board.' };
    if (session.status === 'INSPECTION') {
      return { title: 'Inspection approval', body: 'Use the signature action below once the team confirms the vehicle is ready for final handoff.' };
    }
    if (session.status === 'COMPLETED' && !session.paid) {
      return { title: 'Payment ready', body: 'Complete payment now so the team can release the vehicle immediately.' };
    }
    if (session.status === 'COMPLETED' && session.paid) {
      return { title: 'Ready for pickup', body: 'Everything is complete and paid. Keep the portal open in case you need to reference the completed session.' };
    }
    return { title: 'No action needed yet', body: 'The operations team is still working through the current stage. The portal will refresh automatically.' };
  }, [session]);

  const loyaltySummary = useMemo(() => {
    if (!customerProfile) {
      return {
        tier: 'Starter',
        title: 'Your loyalty profile is warming up',
        body: 'Complete this visit and your customer profile will start building perks, points, and faster repeat bookings.',
        progressToNext: 0,
        nextTierLabel: 'Silver',
      };
    }

    const visits = customerProfile.totalVisits ?? 0;
    const tier = customerProfile.loyaltyTier ?? 'Starter';
    const thresholds = [
      { tier: 'Starter', next: 'Silver', floor: 0, ceiling: 3 },
      { tier: 'Silver', next: 'Gold', floor: 3, ceiling: 6 },
      { tier: 'Gold', next: 'Platinum', floor: 6, ceiling: 12 },
      { tier: 'Platinum', next: 'Elite retention', floor: 12, ceiling: 12 },
    ];
    const currentThreshold = thresholds.find((item) => item.tier === tier) ?? thresholds[0];
    const progressToNext =
      currentThreshold.ceiling === currentThreshold.floor
        ? 100
        : Math.min(100, ((visits - currentThreshold.floor) / (currentThreshold.ceiling - currentThreshold.floor)) * 100);

    return {
      tier,
      title: tier === 'Platinum' ? 'Top-tier returning customer' : `${tier} loyalty tier unlocked`,
      body:
        tier === 'Platinum'
          ? 'You are in the highest customer tier right now. Priority-ready service and repeat-booking confidence are already built into your profile.'
          : `You have ${customerProfile.loyaltyPoints ?? 0} loyalty points. Keep booking with the same phone number to move toward ${currentThreshold.next}.`,
      progressToNext,
      nextTierLabel: currentThreshold.next,
    };
  }, [customerProfile]);

  const messageTimeline = useMemo(() => {
    if (!session) return [];

    const items = [
      {
        id: 'booking',
        title: 'Booking confirmed',
        body: `Your ${session.servicePackage} booking for ${session.registrationNumber} was accepted at ${new Date(session.createdAt).toLocaleString()}.`,
        time: session.createdAt,
        tone: 'success' as const,
      },
      {
        id: 'arrival',
        title: 'Arrival plan locked in',
        body: session.appointmentAt
          ? `Your arrival slot is ${new Date(session.appointmentAt).toLocaleString()}. Arrive close to that time for the smoothest handoff.`
          : 'This session is marked as a walk-in. The team will work it into the live queue as soon as possible.',
        time: session.appointmentAt ?? session.registeredAt,
        tone: 'info' as const,
      },
      {
        id: 'washing',
        title: session.washingStartedAt ? 'Wash lane started' : 'Wash lane pending',
        body: session.washingStartedAt
          ? `The wash team started work at ${new Date(session.washingStartedAt).toLocaleTimeString()}.`
          : 'The car is waiting for lane handoff. You do not need to do anything yet.',
        time: session.washingStartedAt ?? session.updatedAt,
        tone: session.washingStartedAt ? ('success' as const) : ('muted' as const),
      },
      {
        id: 'interior',
        title: session.interiorStartedAt ? 'Interior detailing active' : 'Interior queue standing by',
        body: session.interiorStartedAt
          ? `Interior detailing moved live at ${new Date(session.interiorStartedAt).toLocaleTimeString()}.`
          : 'Interior work will begin automatically after wash lane completion.',
        time: session.interiorStartedAt ?? session.updatedAt,
        tone: session.interiorStartedAt ? ('success' as const) : ('muted' as const),
      },
      {
        id: 'inspection',
        title: session.inspectionStartedAt ? 'Inspection handoff ready' : 'Inspection not started yet',
        body: session.inspectionStartedAt
          ? 'The team is completing final checks. Stay nearby in case signature approval is requested.'
          : 'Once the detailing team finishes, inspection and approval will happen here in the portal.',
        time: session.inspectionStartedAt ?? session.updatedAt,
        tone: session.inspectionStartedAt ? ('warning' as const) : ('muted' as const),
      },
      {
        id: 'payment',
        title: session.paid ? 'Payment received' : session.status === 'COMPLETED' ? 'Payment pending' : 'Payment will open after completion',
        body: session.paid
          ? 'Payment has been recorded successfully. The team can release the vehicle.'
          : session.status === 'COMPLETED'
            ? 'The vehicle is complete. Finish payment in this portal to close the session.'
            : 'A payment action will appear automatically once the wash is complete.',
        time: session.completedAt ?? session.updatedAt,
        tone: session.paid ? ('success' as const) : session.status === 'COMPLETED' ? ('warning' as const) : ('muted' as const),
      },
    ];

    return items.slice().reverse();
  }, [session]);

  const savingsMessage = useMemo(() => {
    if (!customerProfile) {
      return 'Use the same phone number for future bookings so your visits and loyalty progress stay connected.';
    }
    if (customerProfile.loyaltyTier === 'Platinum') {
      return 'You are already in the top loyalty band. Keep the same phone number on every visit to preserve your premium customer history.';
    }
    return `You have ${customerProfile.loyaltyPoints ?? 0} points across ${customerProfile.totalVisits ?? 0} completed visit(s).`;
  }, [customerProfile]);

  if (loading && !session) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '100vh', bgcolor: '#08111c' }}>
        <CircularProgress sx={{ color: '#f0b44c' }} />
      </Box>
    );
  }

  if (error && !session) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>
        <Button fullWidth onClick={() => window.location.reload()} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Container>
    );
  }

  if (!session) return null;

  return (
    <Box sx={{ minHeight: '100vh', color: 'white', py: { xs: 4, md: 6 }, background: 'linear-gradient(180deg, #101519 0%, #12181d 100%)' }}>
      <Container maxWidth="xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Stack spacing={3}>
            <Paper sx={heroPaperSx}>
              <Stack spacing={3}>
                <Stack direction={{ xs: 'column', xl: 'row' }} justifyContent="space-between" spacing={3}>
                  <Box>
                    <Chip label="Live Customer Portal" sx={portalChipSx} />
                    <Typography variant="h2" sx={{ mt: 2.5, fontWeight: 900, letterSpacing: -1.4, lineHeight: 1.03 }}>
                      {session.registrationNumber}
                    </Typography>
                    <Typography sx={{ mt: 1.5, color: 'rgba(154,168,176,0.82)', fontSize: '1rem' }}>
                      {session.customerName} - {session.vehicleType} - {session.servicePackage}
                    </Typography>
                  </Box>

                  <Stack spacing={1.25} alignItems={{ xs: 'flex-start', xl: 'flex-end' }}>
                    <Chip label={session.status} color={session.status === 'COMPLETED' ? 'success' : 'primary'} sx={{ fontWeight: 800, borderRadius: 2 }} />
                    <Button startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />} onClick={() => fetchSession(true)} disabled={refreshing} sx={{ color: '#67e8f9' }}>
                      Refresh now
                    </Button>
                    <Button startIcon={<CopyIcon />} onClick={handleCopyPortalLink} sx={{ color: copied ? '#86efac' : 'rgba(226,232,240,0.88)' }}>
                      {copied ? 'Portal link copied' : 'Copy portal link'}
                    </Button>
                  </Stack>
                </Stack>

                <Alert severity={session.status === 'COMPLETED' ? 'success' : 'info'} sx={{ borderRadius: 3 }}>
                  {nextAction}
                </Alert>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} useFlexGap flexWrap="wrap">
                  <Chip icon={<SlotIcon />} label={bookedSlotText} sx={featureChipSx} />
                  <Chip icon={<ClockIcon />} label={`Workflow progress ${Math.round(progress)}%`} sx={featureChipSx} />
                  <Chip icon={<TaskAltIcon />} label={session.paid ? 'Payment complete' : 'Payment pending'} sx={featureChipSx} />
                  <Chip icon={<LoyaltyIcon />} label={`${loyaltySummary.tier} customer profile`} sx={featureChipSx} />
                </Stack>
              </Stack>
            </Paper>

            <Stack direction={{ xs: 'column', xl: 'row' }} spacing={3} alignItems="stretch">
              <Stack flex={1.1} spacing={3}>
                <Paper sx={panelSx}>
                  <Stack spacing={2.5}>
                    <SectionHeading icon={<StatusIcon sx={{ color: '#67e8f9' }} />} title="Wash progress" />
                    <Box sx={{ display: 'grid', placeItems: 'center', py: 1 }}>
                      <Box sx={progressOrbitSx}>
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Number.POSITIVE_INFINITY, duration: 9, ease: 'linear' }} style={{ position: 'absolute', inset: 0 }}>
                          <Box sx={{ position: 'absolute', top: -7, left: '50%', width: 14, height: 14, borderRadius: 999, bgcolor: '#67e8f9', boxShadow: '0 0 18px rgba(103,232,249,0.75)', transform: 'translateX(-50%)' }} />
                        </motion.div>
                        <Box sx={{ textAlign: 'center', zIndex: 1 }}>
                          <Typography variant="caption" sx={{ color: 'rgba(226,232,240,0.55)', letterSpacing: 1.4 }}>
                            CURRENT STAGE
                          </Typography>
                          <Typography variant="h4" sx={{ mt: 0.5, fontWeight: 900 }}>
                            {currentStageLabel}
                          </Typography>
                          <Typography sx={{ mt: 0.5, color: '#67e8f9', fontWeight: 700 }}>
                            {Math.round(progress)}% complete
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Paper sx={progressCardSx}>
                      <Box sx={{ height: 10, borderRadius: 999, bgcolor: 'rgba(148,163,184,0.16)', overflow: 'hidden' }}>
                        <Box sx={{ width: `${Math.max(progress, 8)}%`, height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #67e8f9 0%, #22d3ee 100%)', boxShadow: '0 0 14px rgba(34,211,238,0.24)', transition: 'width 0.4s ease' }} />
                      </Box>
                      <Typography sx={{ mt: 1.25, color: 'rgba(226,232,240,0.66)' }}>
                        {Math.round(progress)}% through the full wash workflow
                      </Typography>
                    </Paper>

                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2} useFlexGap flexWrap="wrap">
                      {statusSteps.map((step, index) => {
                        const isComplete = index < activeStep;
                        const isCurrent = index === activeStep;
                        return (
                          <Chip key={step} label={step} sx={{ bgcolor: isCurrent ? 'rgba(103,232,249,0.16)' : isComplete ? 'rgba(52,211,153,0.14)' : 'rgba(255,255,255,0.05)', color: isCurrent ? '#67e8f9' : isComplete ? '#86efac' : 'rgba(226,232,240,0.66)', border: isCurrent ? '1px solid rgba(103,232,249,0.24)' : isComplete ? '1px solid rgba(134,239,172,0.22)' : '1px solid rgba(148,163,184,0.12)', fontWeight: 700 }} />
                        );
                      })}
                    </Stack>

                    <Stepper activeStep={activeStep} alternativeLabel sx={{ '& .MuiStepLabel-label': { color: 'rgba(226,232,240,0.55)', fontSize: '0.76rem' }, '& .MuiStepLabel-label.Mui-active': { color: '#67e8f9', fontWeight: 700 }, '& .MuiStepLabel-label.Mui-completed': { color: '#38bdf8' }, '& .MuiStepIcon-root': { color: 'rgba(148,163,184,0.18)' }, '& .MuiStepIcon-root.Mui-active': { color: '#67e8f9' }, '& .MuiStepIcon-root.Mui-completed': { color: '#38bdf8' } }}>
                      {statusSteps.map((label) => (
                        <Step key={label}>
                          <StepLabel>{label}</StepLabel>
                        </Step>
                      ))}
                    </Stepper>
                  </Stack>
                </Paper>

                <Paper sx={panelSx}>
                  <Stack spacing={2.5}>
                    <SectionHeading icon={<MessageIcon sx={{ color: '#fbbf24' }} />} title="SMS-style updates" />
                    <Typography sx={{ color: 'rgba(226,232,240,0.66)' }}>
                      A clean message center for the same updates customers usually expect over SMS.
                    </Typography>
                    <Stack spacing={1.4}>
                      {messageTimeline.map((message) => (
                        <MessageCard key={message.id} {...message} />
                      ))}
                    </Stack>
                  </Stack>
                </Paper>

                <Paper sx={panelSx}>
                  <Stack spacing={2.5}>
                    <SectionHeading icon={<ClockIcon sx={{ color: '#67e8f9' }} />} title="Recommended action" />
                    <Paper sx={focusCardSx}>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {recommendedCard.title}
                      </Typography>
                      <Typography sx={{ mt: 1, color: 'rgba(226,232,240,0.7)' }}>
                        {recommendedCard.body}
                      </Typography>
                    </Paper>

                    {session.status === 'INSPECTION' && !signing && (
                      <Button variant="outlined" fullWidth startIcon={<SignIcon />} onClick={() => setSigning(true)} sx={secondaryActionSx}>
                        Sign to approve inspection
                      </Button>
                    )}

                    {session.status === 'COMPLETED' && !session.paid && (
                      <Button variant="contained" fullWidth size="large" startIcon={<PaymentIcon />} onClick={handlePayment} sx={primaryActionSx}>
                        Proceed to payment
                      </Button>
                    )}

                    {session.paid && (
                      <Alert severity="success" icon={<CheckCircleIcon />} sx={{ borderRadius: 3, bgcolor: 'rgba(16,185,129,0.1)', color: '#d1fae5' }}>
                        Your wash session is complete and paid. Thank you for choosing RinseFlow.
                      </Alert>
                    )}

                    {!session.paid && session.status !== 'INSPECTION' && session.status !== 'COMPLETED' && (
                      <Alert severity="info" sx={{ borderRadius: 3 }}>
                        No action is needed from you yet. The operations team is still working through the current stage.
                      </Alert>
                    )}

                    {error && <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>}
                  </Stack>
                </Paper>
              </Stack>

              <Stack flex={0.9} spacing={3}>
                <Paper sx={panelSx}>
                  <Stack spacing={2.5}>
                    <SectionHeading icon={<SlotIcon sx={{ color: '#86efac' }} />} title="Session snapshot" />
                    <MetricGrid items={[{ label: 'Branch', value: session.branchName }, { label: 'Arrival slot', value: bookedSlotText }, { label: 'Service', value: session.servicePackage }, { label: 'Price', value: `$${session.price?.toFixed(2) ?? '0.00'}` }, { label: 'Payment', value: session.paid ? 'Paid' : 'Pending' }, { label: 'Operator', value: session.operatorName ?? 'Pending assignment' }]} />
                    {lastUpdated && (
                      <Typography variant="caption" sx={{ color: 'rgba(226,232,240,0.46)' }}>
                        Last updated at {lastUpdated.toLocaleTimeString()}
                      </Typography>
                    )}
                  </Stack>
                </Paper>

                <Paper sx={panelSx}>
                  <Stack spacing={2.25}>
                    <SectionHeading icon={<LoyaltyIcon sx={{ color: '#f59e0b' }} />} title="Loyalty and returning-customer perks" />
                    <Paper sx={loyaltyHeroSx}>
                      <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="center">
                        <Box>
                          <Typography variant="overline" sx={{ letterSpacing: 1.5, color: 'rgba(255,255,255,0.6)' }}>
                            {loyaltySummary.tier} Tier
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 900 }}>
                            {loyaltySummary.title}
                          </Typography>
                        </Box>
                        <Chip icon={<OfferIcon />} label={`${customerProfile?.loyaltyPoints ?? 0} pts`} sx={loyaltyChipSx} />
                      </Stack>
                      <Typography sx={{ mt: 1.25, color: 'rgba(255,255,255,0.78)' }}>
                        {loyaltySummary.body}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                            Progress to {loyaltySummary.nextTierLabel}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#fde68a', fontWeight: 700 }}>
                            {Math.round(loyaltySummary.progressToNext)}%
                          </Typography>
                        </Stack>
                        <LinearProgress variant="determinate" value={loyaltySummary.progressToNext} sx={{ height: 10, borderRadius: 999, bgcolor: 'rgba(255,255,255,0.15)', '& .MuiLinearProgress-bar': { borderRadius: 999, background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)' } }} />
                      </Box>
                    </Paper>

                    <MetricGrid items={[{ label: 'Completed visits', value: String(customerProfile?.totalVisits ?? 0) }, { label: 'Loyalty points', value: String(customerProfile?.loyaltyPoints ?? 0) }, { label: 'Last vehicle on profile', value: customerProfile?.lastVehicleRegistration ?? session.registrationNumber }, { label: 'Profile tip', value: savingsMessage }]} />
                    <Button variant="outlined" fullWidth startIcon={<OfferIcon />} onClick={handleRepeatBooking} sx={secondaryActionSx}>
                      Book this same wash again
                    </Button>
                  </Stack>
                </Paper>

                <Paper sx={panelSx}>
                  <Stack spacing={2.2}>
                    <SectionHeading icon={<HistoryIcon sx={{ color: '#a78bfa' }} />} title="Recent wash history" />
                    {recentSessions.length === 0 ? (
                      <Alert severity="info" sx={{ borderRadius: 3 }}>
                        This looks like an early visit on this phone number. Future completed sessions will appear here automatically.
                      </Alert>
                    ) : (
                      <Stack spacing={1.2}>
                        {recentSessions.map((item) => (
                          <HistoryCard key={item.sessionId} session={item} />
                        ))}
                      </Stack>
                    )}
                  </Stack>
                </Paper>

                <Paper sx={panelSx}>
                  <Stack spacing={2}>
                    <SectionHeading icon={<TaskAltIcon sx={{ color: '#fbbf24' }} />} title="Customer guidance" />
                    <GuidanceRow text="Keep this portal open for live tracking as the vehicle moves across the wash workflow." />
                    <GuidanceRow text="When the inspection phase starts, this page becomes the handoff point for approval." />
                    <GuidanceRow text="If payment is still pending after completion, use the portal action here instead of waiting on a separate page." />
                    <GuidanceRow text="Use the same phone number every time so your wash history and loyalty progress stay connected." />
                  </Stack>
                </Paper>
              </Stack>
            </Stack>
          </Stack>

          <AnimatePresence>
            {signing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2, 6, 23, 0.96)', zIndex: 9999, display: 'flex', flexDirection: 'column', padding: 20 }}>
                <Container maxWidth="md" sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 4, bgcolor: 'rgba(15,23,42,0.96)', color: 'white', border: '1px solid rgba(148,163,184,0.14)', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800 }} align="center">
                      Sign below to approve inspection
                    </Typography>
                    <Typography sx={{ color: 'rgba(226,232,240,0.66)', textAlign: 'center', mt: 1 }}>
                      Confirm the vehicle handoff once the inspection team has finished.
                    </Typography>

                    <Box sx={{ flex: 1, bgcolor: 'white', borderRadius: 4, my: 3, overflow: 'hidden', minHeight: 280 }}>
                      <SignaturePad ref={sigPad} canvasProps={{ style: { width: '100%', height: '100%' } }} />
                    </Box>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                      <Button fullWidth variant="outlined" color="inherit" onClick={() => sigPad.current?.clear()}>
                        Clear signature
                      </Button>
                      <Button fullWidth variant="outlined" color="inherit" onClick={() => setSigning(false)}>
                        Cancel
                      </Button>
                      <Button fullWidth variant="contained" onClick={handleSign} sx={primaryActionSx}>
                        Submit approval
                      </Button>
                    </Stack>
                  </Paper>
                </Container>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </Container>
    </Box>
  );
};

function SectionHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <Box display="flex" alignItems="center" gap={1.25}>
      {icon}
      <Typography variant="h6" sx={{ fontWeight: 800 }}>
        {title}
      </Typography>
    </Box>
  );
}

function GuidanceRow({ text }: { text: string }) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      <Box sx={{ mt: 0.15, width: 24, height: 24, borderRadius: 999, bgcolor: 'rgba(251,191,36,0.14)', display: 'grid', placeItems: 'center' }}>
        <TaskAltIcon sx={{ fontSize: 15, color: '#fbbf24' }} />
      </Box>
      <Typography sx={{ color: 'rgba(226,232,240,0.72)' }}>{text}</Typography>
    </Stack>
  );
}

function MetricGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, 1fr)' }} gap={2}>
      {items.map((item) => (
        <Paper key={item.label} sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(148,163,184,0.12)' }}>
          <Typography variant="caption" sx={{ color: 'rgba(226,232,240,0.5)' }}>
            {item.label}
          </Typography>
          <Typography variant="h6" sx={{ mt: 0.65, fontWeight: 800, wordBreak: 'break-word' }}>
            {item.value}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
}

function MessageCard({ title, body, time, tone }: { title: string; body: string; time: string; tone: 'success' | 'warning' | 'info' | 'muted' }) {
  const toneMap = {
    success: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.22)', badge: '#86efac' },
    warning: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.22)', badge: '#fcd34d' },
    info: { bg: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.22)', badge: '#67e8f9' },
    muted: { bg: 'rgba(255,255,255,0.04)', border: 'rgba(148,163,184,0.12)', badge: 'rgba(226,232,240,0.72)' },
  } as const;
  const colors = toneMap[tone];

  return (
    <Paper sx={{ p: 2, borderRadius: 3, bgcolor: colors.bg, border: `1px solid ${colors.border}` }}>
      <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="flex-start">
        <Box>
          <Typography sx={{ fontWeight: 800, color: 'white' }}>{title}</Typography>
          <Typography sx={{ mt: 0.65, color: 'rgba(226,232,240,0.7)' }}>{body}</Typography>
        </Box>
        <Chip label={new Date(time).toLocaleTimeString()} sx={{ color: colors.badge, borderColor: colors.border }} variant="outlined" />
      </Stack>
    </Paper>
  );
}

function HistoryCard({ session }: { session: NonNullable<VehicleSession['recentSessions']>[number] }) {
  return (
    <Paper sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(148,163,184,0.12)' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5}>
        <Box>
          <Typography sx={{ fontWeight: 800 }}>{session.registrationNumber}</Typography>
          <Typography sx={{ mt: 0.4, color: 'rgba(226,232,240,0.68)' }}>{session.servicePackage}</Typography>
          <Typography variant="caption" sx={{ color: 'rgba(226,232,240,0.46)' }}>
            {new Date(session.completedAt ?? session.createdAt).toLocaleString()}
          </Typography>
        </Box>
        <Stack spacing={1} alignItems={{ xs: 'flex-start', sm: 'flex-end' }}>
          <Chip label={session.status} sx={historyStatusChipSx(session.status)} />
          <Typography sx={{ fontWeight: 700 }}>${session.price?.toFixed(2) ?? '0.00'}</Typography>
          <Typography variant="caption" sx={{ color: session.paid ? '#86efac' : '#fcd34d' }}>
            {session.paid ? 'Paid' : 'Pending payment'}
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}

const heroPaperSx = {
  p: { xs: 3, md: 4.5 },
  borderRadius: 4,
  bgcolor: 'rgba(23,29,34,0.98)',
  border: '1px solid rgba(154,168,176,0.14)',
  boxShadow: '0 16px 34px rgba(0, 0, 0, 0.2)',
};

const panelSx = {
  p: { xs: 3, md: 3.5 },
  borderRadius: 4,
  bgcolor: 'rgba(23,29,34,0.98)',
  border: '1px solid rgba(154,168,176,0.14)',
};

const progressCardSx = {
  p: 2.25,
  borderRadius: 3,
  bgcolor: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(148,163,184,0.12)',
};

const progressOrbitSx = {
  position: 'relative',
  width: 240,
  height: 240,
  borderRadius: '50%',
  display: 'grid',
  placeItems: 'center',
  bgcolor: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(95,183,212,0.14)',
  boxShadow: 'inset 0 0 22px rgba(95,183,212,0.05), 0 16px 28px rgba(0,0,0,0.18)',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 18,
    borderRadius: '50%',
    border: '1px dashed rgba(95,183,212,0.18)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 42,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(95,183,212,0.12) 0%, rgba(23,29,34,0.12) 52%, transparent 72%)',
  },
};

const focusCardSx = {
  p: 2.4,
  borderRadius: 3,
  bgcolor: 'rgba(240,180,76,0.08)',
  border: '1px solid rgba(240,180,76,0.16)',
};

const loyaltyHeroSx = {
  p: 2.4,
  borderRadius: 3,
  background: 'linear-gradient(135deg, rgba(240,180,76,0.18), rgba(95,183,212,0.12))',
  border: '1px solid rgba(240,180,76,0.22)',
  boxShadow: 'none',
};

const portalChipSx = {
  bgcolor: 'rgba(240,180,76,0.12)',
  color: '#f0b44c',
  border: '1px solid rgba(240,180,76,0.22)',
  fontWeight: 700,
};

const featureChipSx = {
  bgcolor: 'rgba(255,255,255,0.05)',
  color: 'rgba(238,242,244,0.9)',
  border: '1px solid rgba(154,168,176,0.14)',
};

const loyaltyChipSx = {
  bgcolor: 'rgba(255,255,255,0.08)',
  color: '#fef3c7',
  border: '1px solid rgba(253,224,71,0.26)',
  fontWeight: 700,
};

const secondaryActionSx = {
  py: 1.5,
  borderRadius: 3,
  color: '#5fb7d4',
  borderColor: 'rgba(95,183,212,0.42)',
  fontWeight: 700,
  '&:hover': {
    borderColor: '#5fb7d4',
    bgcolor: 'rgba(95,183,212,0.06)',
  },
};

const primaryActionSx = {
  py: 1.7,
  borderRadius: 3,
  bgcolor: '#f0b44c',
  color: '#1b1f22',
  fontWeight: 800,
  boxShadow: 'none',
  '&:hover': { bgcolor: '#f5cb7f' },
};

const historyStatusChipSx = (status: SessionStatus) => ({
  bgcolor: status === 'COMPLETED' ? 'rgba(16,185,129,0.12)' : status === 'INSPECTION' ? 'rgba(245,158,11,0.12)' : 'rgba(56,189,248,0.12)',
  color: status === 'COMPLETED' ? '#86efac' : status === 'INSPECTION' ? '#fcd34d' : '#67e8f9',
  border: '1px solid rgba(148,163,184,0.16)',
  fontWeight: 700,
});

export default CustomerPortalPage;
