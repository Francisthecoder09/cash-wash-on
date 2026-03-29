import React, { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Grid2,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  CheckCircle,
  ContentCopy,
  Download,
  EventAvailable,
  Login,
  Print,
  ReceiptLong,
  Share,
  TaskAlt,
} from '@mui/icons-material';
import { VehicleSession } from '../types';
import { CustomerSessionTimeoutGuard } from '../components/customer/CustomerSessionTimeoutGuard';
import { CustomerContactStrip } from '../components/customer/CustomerContactStrip';
import { formatCurrency } from '../utils/currency';
import { API_ORIGIN } from '../utils/constants';

const API_BASE = `${API_ORIGIN}/api/portal/sessions`;
const heroImage = '/abdulla-al-rokhaimi-pRlbr85Jvqw-unsplash.jpg';

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
  const bookedAt = useMemo(() => new Date(session?.createdAt || session?.registeredAt || Date.now()), [session?.createdAt, session?.registeredAt]);
  const receiptNumber = useMemo(() => `RF-${String(session?.id ?? token).padStart(6, '0')}`, [session?.id, token]);

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
      'Spark Wash Booking Receipt',
      '==========================',
      `Receipt: ${receiptNumber}`,
      `Booked At: ${bookedAt.toLocaleString()}`,
      `Arrival: ${session.appointmentAt ? new Date(session.appointmentAt).toLocaleString() : 'Immediate arrival'}`,
      `Vehicle: ${session.registrationNumber}`,
      `Customer: ${session.customerName}`,
      `Phone: ${session.customerPhone || 'Not available'}`,
      `Service: ${session.servicePackage}`,
      `Add-ons: ${session.addOnServices?.length ? session.addOnServices.join(', ') : 'None selected'}`,
      `Vehicle Type: ${session.vehicleType}`,
      `Branch: ${session.branchName}`,
      `Amount: ${formatCurrency(session.price)}`,
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
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: 'background.default' }}>
        <Typography sx={{ color: 'text.secondary' }}>Preparing booking confirmation...</Typography>
      </Box>
    );
  }

  if (error || !session) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper sx={{ p: 3.5, borderRadius: 4 }}>
          <Stack spacing={2}>
            <Alert severity="error" sx={{ borderRadius: 3 }}>
              {error || 'Booking confirmation is unavailable.'}
            </Alert>
            <Button variant="contained" onClick={() => navigate('/portal/book')} sx={ctaButtonSx}>
              Return to booking
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      <CustomerSessionTimeoutGuard />
      <Box
        sx={{
          minHeight: { xs: 460, md: 520 },
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#14110f',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(90deg, rgba(20,17,15,0.76) 0%, rgba(20,17,15,0.54) 42%, rgba(20,17,15,0.16) 100%), url("${heroImage}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 42%',
          }}
        />
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: { xs: 4, md: 6 } }}>
          <Stack spacing={4}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <Box sx={{ width: 42, height: 42, borderRadius: '50%', bgcolor: '#e36b2c', display: 'grid', placeItems: 'center', color: 'white', fontWeight: 800 }}>
                  S
                </Box>
                <Box>
                  <Typography sx={{ color: '#fff8f1', fontWeight: 700, fontSize: '1.1rem' }}>Spark Wash Receipt</Typography>
                  <Typography sx={{ color: 'rgba(255,244,233,0.7)', fontSize: '0.92rem' }}>Booking confirmed</Typography>
                </Box>
              </Stack>
              <Chip label="Booking confirmed" sx={heroChipSx} />
            </Stack>

            <Grid2 container spacing={4} alignItems="center">
              <Grid2 size={{ xs: 12, lg: 7 }}>
                <Stack spacing={2.5}>
                  <Chip label="Car Wash Delivery" sx={heroTagSx} />
                  <Typography variant="h1" sx={{ color: '#fff8f1', maxWidth: 760, lineHeight: 0.95 }}>
                    Your appointment is booked and your customer portal is ready
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,244,233,0.78)', maxWidth: 620, fontSize: '1.04rem', lineHeight: 1.7 }}>
                    The booking is now live for the selected branch, and the customer portal link is ready for tracking, signature approval, and payment.
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                    <Button component={RouterLink} to={`/portal/${token}`} variant="contained" startIcon={<Login />} sx={heroButtonSx}>
                      Open live portal
                    </Button>
                    <Button component={RouterLink} to={`/portal/${token}`} variant="outlined" startIcon={<TaskAlt />} sx={heroGhostButtonSx}>
                      Open portal to pay
                    </Button>
                    <Button variant="outlined" startIcon={<ContentCopy />} onClick={handleCopy} sx={heroGhostButtonSx}>
                      {copied ? 'Link copied' : 'Copy portal link'}
                    </Button>
                  </Stack>
                </Stack>
              </Grid2>

              <Grid2 size={{ xs: 12, lg: 5 }}>
                <Paper sx={summaryCardSx}>
                  <Stack spacing={2}>
                    <Typography sx={{ fontWeight: 700, fontSize: '1.12rem' }}>Receipt snapshot</Typography>
                    <SummaryRow label="Receipt" value={receiptNumber} />
                    <SummaryRow label="Vehicle" value={session.registrationNumber} />
                    <SummaryRow label="Arrival" value={session.appointmentAt ? new Date(session.appointmentAt).toLocaleString() : 'Immediate arrival'} />
                    <SummaryRow label="Branch" value={session.branchName} />
                    <SummaryRow label="Add-ons" value={session.addOnServices?.length ? `${session.addOnServices.length} selected` : 'None selected'} />
                    <SummaryRow label="Amount" value={formatCurrency(session.price)} emphasize />
                  </Stack>
                </Paper>
              </Grid2>
            </Grid2>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: { xs: 5, md: 7 } }}>
        <Grid2 container spacing={4}>
          <Grid2 size={{ xs: 12, lg: 7 }}>
            <Paper sx={sectionCardSx}>
              <Stack spacing={2.25}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  Booking receipt
                </Typography>
                <ReceiptRow label="Vehicle" value={session.registrationNumber} />
                <ReceiptRow label="Receipt" value={receiptNumber} />
                <ReceiptRow label="Booked at" value={bookedAt.toLocaleString()} />
                <ReceiptRow label="Arrival slot" value={session.appointmentAt ? new Date(session.appointmentAt).toLocaleString() : 'Immediate arrival'} />
                <ReceiptRow label="Customer" value={session.customerName} />
                <ReceiptRow label="Phone" value={session.customerPhone || 'Not available'} />
                <ReceiptRow label="Service" value={session.servicePackage} />
                <ReceiptRow label="Add-ons" value={session.addOnServices?.length ? session.addOnServices.join(', ') : 'None selected'} />
                <ReceiptRow label="Vehicle type" value={session.vehicleType} />
                <ReceiptRow label="Branch" value={session.branchName} />
                <ReceiptRow label="Amount" value={formatCurrency(session.price)} emphasize />
              </Stack>
            </Paper>
          </Grid2>

          <Grid2 size={{ xs: 12, lg: 5 }}>
            <Stack spacing={3}>
              <Paper sx={sectionCardSx}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  Next actions
                </Typography>
                <Stack spacing={1.5}>
                  <Button variant="contained" startIcon={<Login />} component={RouterLink} to={`/portal/${token}`} sx={ctaButtonSx}>
                    Open live portal
                  </Button>
                  {!session.paid && (
                    <Button variant="outlined" startIcon={<TaskAlt />} component={RouterLink} to={`/portal/${token}`} sx={secondaryButtonSx}>
                      Go to payment
                    </Button>
                  )}
                  <Button variant="outlined" startIcon={<Print />} onClick={handlePrint} sx={secondaryButtonSx}>
                    Print receipt
                  </Button>
                  <Button variant="outlined" startIcon={<Download />} onClick={handleDownloadReceipt} sx={secondaryButtonSx}>
                    Download receipt
                  </Button>
                  <Button variant="outlined" startIcon={<Share />} onClick={handleCopy} sx={secondaryButtonSx}>
                    {copied ? 'Portal link copied' : 'Copy portal link'}
                  </Button>
                </Stack>
              </Paper>

              <Paper sx={sectionCardSx}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  Arrival checklist
                </Typography>
                <Stack spacing={1.5}>
                  {[
                    'Arrive close to your selected time slot for the smoothest handoff.',
                    'Keep the portal link for live updates and payment.',
                    'If you do not show up, the booking expires 24 hours after your selected arrival time.',
                    'Use the same booking details later if you want to access the session again.',
                  ].map((item) => (
                    <Stack key={item} direction="row" spacing={1.25} alignItems="flex-start">
                      <Box sx={{ mt: 0.2, width: 28, height: 28, borderRadius: '50%', bgcolor: 'rgba(227,107,44,0.1)', display: 'grid', placeItems: 'center' }}>
                        <TaskAlt sx={{ color: '#e36b2c', fontSize: 18 }} />
                      </Box>
                      <Typography sx={{ color: 'text.primary' }}>{item}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Paper>
            </Stack>
          </Grid2>
        </Grid2>
      </Container>

      <CustomerContactStrip />
    </Box>
  );
};

function SummaryRow({ label, value, emphasize = false }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <Box display="flex" justifyContent="space-between" gap={2}>
      <Typography sx={{ color: 'text.secondary' }}>{label}</Typography>
      <Typography sx={{ fontWeight: emphasize ? 800 : 700, color: 'text.primary', textAlign: 'right' }}>{value}</Typography>
    </Box>
  );
}

function ReceiptRow({ label, value, emphasize = false }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <Box display="flex" justifyContent="space-between" gap={2}>
      <Typography sx={{ color: 'text.secondary' }}>{label}</Typography>
      <Typography sx={{ fontWeight: emphasize ? 800 : 700, color: 'text.primary', textAlign: 'right' }}>{value}</Typography>
    </Box>
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

const summaryCardSx = {
  p: 3,
  borderRadius: 5,
  bgcolor: 'rgba(255,247,240,0.05)',
};

const sectionCardSx = {
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

export default BookingConfirmationPage;
