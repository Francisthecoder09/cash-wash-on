import React, { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  DirectionsCar as CarIcon,
  EventAvailable as SlotIcon,
  Login as PortalIcon,
  Print as PrintIcon,
  ReceiptLong as ReceiptIcon,
  Share as ShareIcon,
  TaskAlt as TaskAltIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { VehicleSession } from '../types';
import { API_ORIGIN } from '../utils/constants';

const API_BASE = `${API_ORIGIN}/api/portal/sessions`;

type BookingConfirmationState = {
  session?: VehicleSession;
};

const BookingConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token = '' } = useParams<{ token: string }>();
  const routeState = location.state as BookingConfirmationState | null;

  const [session, setSession] = useState<VehicleSession | null>(routeState?.session ?? null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(!routeState?.session);

  useEffect(() => {
    if (routeState?.session || !token) return;

    const fetchSession = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/${token}`);
        if (!response.ok) {
          throw new Error('Booking confirmation could not be loaded.');
        }

        setSession(await response.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Booking confirmation could not be loaded.');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [routeState?.session, token]);

  const portalUrl = useMemo(() => `${window.location.origin}/portal/${token}`, [token]);
  const bookedAt = useMemo(
    () => new Date(session?.createdAt || session?.registeredAt || Date.now()),
    [session?.createdAt, session?.registeredAt],
  );
  const receiptNumber = useMemo(
    () => `RF-${String(session?.id ?? token).padStart(6, '0')}`,
    [session?.id, token],
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(portalUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Could not copy the portal link on this browser.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadReceipt = () => {
    if (!session) return;

    const receiptLines = [
      'RinseFlow Booking Receipt',
      '=========================',
      `Receipt: ${receiptNumber}`,
      `Booked At: ${bookedAt.toLocaleString()}`,
      `Appointment: ${session.appointmentAt ? new Date(session.appointmentAt).toLocaleString() : 'Immediate arrival'}`,
      `Vehicle: ${session.registrationNumber}`,
      `Customer: ${session.customerName}`,
      `Phone: ${session.customerPhone || 'Not available'}`,
      `Service: ${session.servicePackage}`,
      `Vehicle Type: ${session.vehicleType}`,
      `Branch: ${session.branchName}`,
      `Amount: $${session.price?.toFixed(2) ?? '0.00'}`,
      `Portal Link: ${portalUrl}`,
    ].join('\n');

    const blob = new Blob([receiptLines], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${receiptNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#08111d' }}>
        <Typography sx={{ color: 'rgba(154,168,176,0.82)' }}>Preparing booking confirmation...</Typography>
      </Box>
    );
  }

  if (error || !session) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper sx={fallbackPaperSx}>
          <Stack spacing={2.5}>
            <Alert severity="error" sx={{ borderRadius: 3 }}>
              {error || 'Booking confirmation is unavailable.'}
            </Alert>
            <Button variant="contained" onClick={() => navigate('/portal/book')} sx={primaryButtonSx}>
              Return to booking
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: { xs: 4, md: 6 },
        background: 'linear-gradient(180deg, #101519 0%, #12181d 100%)',
        '@media print': {
          bgcolor: '#ffffff',
          background: '#ffffff',
          color: '#111827',
          py: 0,
        },
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          '@media print': {
            maxWidth: '100%',
            px: 0,
          },
        }}
      >
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
          <Stack spacing={3}>
            <Paper sx={heroPaperSx}>
              <Stack spacing={3}>
                <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" spacing={3}>
                  <Box>
                    <Chip icon={<CheckCircleIcon />} label="Booking Confirmed" sx={successChipSx} />
                    <Typography variant="h2" sx={{ mt: 2.5, fontWeight: 900, letterSpacing: -1.4, lineHeight: 1.03 }}>
                      Everything is booked and ready for arrival
                    </Typography>
                    <Typography sx={{ mt: 2, color: 'rgba(154,168,176,0.82)', maxWidth: 760 }}>
                      Your appointment is locked in, a live customer portal has been created, and the session is ready to appear on the operations board for the selected branch.
                    </Typography>
                  </Box>

                  <Stack spacing={1.5} minWidth={{ lg: 260 }}>
                    <Button component={RouterLink} to={`/portal/${token}`} variant="contained" startIcon={<PortalIcon />} sx={primaryButtonSx}>
                      Open live portal
                    </Button>
                    <Button variant="outlined" startIcon={<CopyIcon />} onClick={handleCopy} sx={secondaryButtonSx}>
                      {copied ? 'Portal link copied' : 'Copy portal link'}
                    </Button>
                  </Stack>
                </Stack>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} useFlexGap flexWrap="wrap">
                  <Chip icon={<ReceiptIcon />} label={`Receipt ${receiptNumber}`} sx={featureChipSx} />
                  <Chip
                    icon={<SlotIcon />}
                    label={session.appointmentAt ? new Date(session.appointmentAt).toLocaleString() : 'Immediate arrival'}
                    sx={featureChipSx}
                  />
                  <Chip icon={<TaskAltIcon />} label={`${session.branchName} ready`} sx={featureChipSx} />
                </Stack>
              </Stack>
            </Paper>

            <Stack direction={{ xs: 'column', xl: 'row' }} spacing={3}>
              <Paper sx={receiptPanelSx}>
                <Stack spacing={2.5}>
                  <SectionHeading icon={<ReceiptIcon sx={{ color: '#86efac' }} />} title="Booking receipt" />

                  <ReceiptRow label="Vehicle" value={session.registrationNumber} />
                  <ReceiptRow label="Receipt" value={receiptNumber} />
                  <ReceiptRow label="Booked at" value={bookedAt.toLocaleString()} />
                  <ReceiptRow
                    label="Arrival slot"
                    value={session.appointmentAt ? new Date(session.appointmentAt).toLocaleString() : 'Immediate arrival'}
                  />
                  <ReceiptRow label="Customer" value={session.customerName} />
                  <ReceiptRow label="Phone" value={session.customerPhone || 'Not available'} />
                  <ReceiptRow label="Service" value={session.servicePackage} />
                  <ReceiptRow label="Vehicle type" value={session.vehicleType} />
                  <ReceiptRow label="Branch" value={session.branchName} />

                  <Divider sx={{ borderColor: 'rgba(148,163,184,0.12)' }} />

                  <ReceiptRow label="Amount" value={`$${session.price?.toFixed(2) ?? '0.00'}`} emphasize />
                </Stack>
              </Paper>

              <Stack flex={1} spacing={3}>
                <Paper sx={actionPanelSx}>
                  <Stack spacing={2.5}>
                    <SectionHeading icon={<ShareIcon sx={{ color: '#67e8f9' }} />} title="Next best actions" />
                    <Alert severity="success" sx={{ borderRadius: 3 }}>
                      The customer can now use the portal link for live updates, payment, and inspection approval.
                    </Alert>
                    <Paper sx={linkCardSx}>
                      <Typography variant="caption" sx={{ color: 'rgba(226,232,240,0.5)' }}>
                        Portal link
                      </Typography>
                      <Typography sx={{ mt: 1, color: 'white', wordBreak: 'break-all' }}>{portalUrl}</Typography>
                    </Paper>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                      <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint} sx={secondaryButtonSx}>
                        Print receipt
                      </Button>
                      <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownloadReceipt} sx={secondaryButtonSx}>
                        Download receipt
                      </Button>
                    </Stack>
                    <Button variant="text" component={RouterLink} to="/portal/book" sx={{ color: '#86efac', fontWeight: 700, width: 'fit-content' }}>
                      Book another session
                    </Button>
                  </Stack>
                </Paper>

                <Paper sx={checklistPanelSx}>
                  <Stack spacing={2}>
                    <SectionHeading icon={<CarIcon sx={{ color: '#fbbf24' }} />} title="Arrival checklist" />
                    <ChecklistItem text="Arrive close to the selected slot so the team can keep the lane schedule smooth." />
                    <ChecklistItem text="Keep the portal link for live updates and faster handoff during payment or inspection." />
                    <ChecklistItem text="Use the same phone number from the booking if you need to log back into the customer portal later." />
                  </Stack>
                </Paper>
              </Stack>
            </Stack>
          </Stack>
        </motion.div>
      </Container>
    </Box>
  );
};

function SectionHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <Box display="flex" alignItems="center" gap={1.25}>
      {icon}
      <Typography variant="h6" sx={{ fontWeight: 800, color: 'white', '@media print': { color: '#111827' } }}>
        {title}
      </Typography>
    </Box>
  );
}

function ChecklistItem({ text }: { text: string }) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      <Box sx={{ mt: 0.15, width: 24, height: 24, borderRadius: 999, bgcolor: 'rgba(251,191,36,0.14)', display: 'grid', placeItems: 'center' }}>
        <TaskAltIcon sx={{ fontSize: 15, color: '#fbbf24' }} />
      </Box>
      <Typography sx={{ color: 'rgba(226,232,240,0.72)', '@media print': { color: '#374151' } }}>{text}</Typography>
    </Stack>
  );
}

function ReceiptRow({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <Box display="flex" justifyContent="space-between" gap={2}>
      <Typography sx={{ color: 'rgba(226,232,240,0.6)', '@media print': { color: '#4b5563' } }}>{label}</Typography>
      <Typography
        sx={{
          color: 'white',
          fontWeight: emphasize ? 900 : 700,
          fontSize: emphasize ? '1.15rem' : '1rem',
          textAlign: 'right',
          '@media print': { color: '#111827' },
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

const heroPaperSx = {
  p: { xs: 3, md: 4.5 },
  borderRadius: 4,
  bgcolor: 'rgba(23,29,34,0.98)',
  border: '1px solid rgba(154,168,176,0.14)',
  boxShadow: '0 16px 34px rgba(0, 0, 0, 0.2)',
  '@media print': {
    bgcolor: '#ffffff',
    color: '#111827',
    border: '1px solid #d1d5db',
    boxShadow: 'none',
    backdropFilter: 'none',
    borderRadius: 0,
    p: 3,
  },
};

const receiptPanelSx = {
  flex: 0.95,
  p: { xs: 3, md: 3.5 },
  borderRadius: 4,
  bgcolor: 'rgba(23,29,34,0.98)',
  border: '1px solid rgba(154,168,176,0.14)',
  '@media print': {
    bgcolor: '#ffffff',
    color: '#111827',
    border: '1px solid #d1d5db',
    boxShadow: 'none',
    borderRadius: 0,
    p: 3,
    flex: 1,
  },
};

const actionPanelSx = {
  p: { xs: 3, md: 3.5 },
  borderRadius: 4,
  bgcolor: 'rgba(23,29,34,0.98)',
  border: '1px solid rgba(154,168,176,0.14)',
  '@media print': {
    display: 'none',
  },
};

const checklistPanelSx = {
  p: { xs: 3, md: 3.5 },
  borderRadius: 4,
  bgcolor: 'rgba(20,25,30,0.98)',
  border: '1px solid rgba(154,168,176,0.12)',
  '@media print': {
    bgcolor: '#ffffff',
    color: '#111827',
    border: '1px solid #d1d5db',
    boxShadow: 'none',
    borderRadius: 0,
    p: 3,
  },
};

const linkCardSx = {
  p: 2.2,
  borderRadius: 3,
  bgcolor: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(148,163,184,0.12)',
};

const successChipSx = {
  bgcolor: 'rgba(102,194,138,0.12)',
  color: '#66c28a',
  border: '1px solid rgba(102,194,138,0.2)',
  fontWeight: 800,
  '@media print': {
    bgcolor: '#ecfdf5',
    color: '#166534',
    border: '1px solid #bbf7d0',
  },
};

const featureChipSx = {
  bgcolor: 'rgba(255,255,255,0.05)',
  color: 'rgba(238,242,244,0.9)',
  border: '1px solid rgba(154,168,176,0.14)',
  '@media print': {
    bgcolor: '#f8fafc',
    color: '#111827',
    border: '1px solid #d1d5db',
  },
};

const primaryButtonSx = {
  py: 1.55,
  px: 2.6,
  borderRadius: 3,
  bgcolor: '#f0b44c',
  color: '#1b1f22',
  fontWeight: 800,
  boxShadow: 'none',
  '&:hover': { bgcolor: '#f5cb7f' },
};

const secondaryButtonSx = {
  py: 1.35,
  borderRadius: 3,
  color: '#5fb7d4',
  borderColor: 'rgba(95,183,212,0.38)',
  fontWeight: 700,
  '&:hover': {
    borderColor: '#5fb7d4',
    bgcolor: 'rgba(95,183,212,0.06)',
  },
};

const fallbackPaperSx = {
  p: 3,
  borderRadius: 4,
  bgcolor: 'rgba(23,29,34,0.98)',
  border: '1px solid rgba(154,168,176,0.14)',
};

export default BookingConfirmationPage;
