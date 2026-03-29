import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  DirectionsCar,
  EventAvailable,
  Logout,
  NotificationsActive,
  Paid,
  Stars,
  TrackChanges,
} from '@mui/icons-material';
import { CustomerDashboard } from '../types';
import { customerAccountStore } from '../store/customerAccount';
import { CustomerSessionTimeoutGuard } from '../components/customer/CustomerSessionTimeoutGuard';
import { CustomerContactStrip } from '../components/customer/CustomerContactStrip';
import { formatCurrency } from '../utils/currency';
import { API_ORIGIN } from '../utils/constants';

const API_BASE = `${API_ORIGIN}/api/portal/sessions`;
const heroImage = '/spencer-davis-DFnCCRExDdc-unsplash.jpg';

const CustomerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const account = customerAccountStore.get();
  const [dashboard, setDashboard] = useState<CustomerDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!account?.username || !account?.email) {
      navigate('/portal/login', { replace: true });
      return;
    }

    const loadDashboard = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          username: account.username,
          email: account.email,
        });
        const response = await fetch(`${API_BASE}/customers/dashboard?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Customer dashboard could not be loaded.');
        }
        setDashboard(await response.json());
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Customer dashboard could not be loaded.');
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, [account?.email, account?.username, navigate]);

  const handleSignOut = () => {
    customerAccountStore.clear();
    navigate('/portal/login');
  };

  const handleBookNow = () => {
    if (!account) return;
    const params = new URLSearchParams({
      name: account.fullName,
      phone: account.phone ?? '',
      email: account.email ?? '',
      username: account.username,
    });
    navigate(`/portal/book?${params.toString()}`);
  };

  const loyaltyProgress = useMemo(() => {
    if (!dashboard) return 0;
    const points = dashboard.loyaltyPoints ?? 0;
    const threshold = dashboard.loyaltyTier === 'Starter' ? 30 : dashboard.loyaltyTier === 'Silver' ? 60 : dashboard.loyaltyTier === 'Gold' ? 120 : points || 120;
    return threshold ? Math.min(100, Math.round((points / threshold) * 100)) : 100;
  }, [dashboard]);

  const hasAnyActivity = Boolean(
    dashboard?.activeSession ||
      dashboard?.upcomingSession ||
      dashboard?.savedVehicles.length ||
      dashboard?.recentSessions.length,
  );

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: 'background.default' }}>
        <Typography sx={{ color: 'text.secondary' }}>Loading your dashboard...</Typography>
      </Box>
    );
  }

  if (error || !dashboard) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper sx={{ p: 3.5, borderRadius: 4 }}>
          <Stack spacing={2}>
            <Alert severity="error" sx={{ borderRadius: 3 }}>
              {error || 'Customer dashboard is unavailable.'}
            </Alert>
            <Button variant="contained" onClick={() => navigate('/portal/login')} sx={ctaButtonSx}>
              Return to sign in
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
          minHeight: { xs: 480, md: 540 },
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#14110f',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(90deg, rgba(20,17,15,0.26) 0%, rgba(20,17,15,0.16) 42%, rgba(20,17,15,0.05) 100%), url("${heroImage}")`,
            backgroundSize: 'cover',
            backgroundPosition: { xs: 'center 42%', md: 'center 38%' },
            filter: 'saturate(1.03) contrast(1.04)',
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
                  <Typography sx={{ color: '#fff8f1', fontWeight: 700, fontSize: '1.1rem' }}>Spark Wash Dashboard</Typography>
                  <Typography sx={{ color: 'rgba(255,244,233,0.7)', fontSize: '0.92rem' }}>Signed in as {dashboard.username}</Typography>
                </Box>
              </Stack>
              <Button variant="outlined" startIcon={<Logout />} onClick={handleSignOut} sx={heroGhostButtonSx}>
                Sign out
              </Button>
            </Stack>

            <Grid2 container spacing={4} alignItems="center">
              <Grid2 size={{ xs: 12, lg: 7 }}>
                <Stack spacing={2.4}>
                  <Chip label="Customer Home" sx={heroTagSx} />
                  <Typography variant="h1" sx={{ color: '#fff8f1', maxWidth: 760, lineHeight: 0.95, fontSize: { xs: '2.7rem', md: undefined } }}>
                    Welcome back, {dashboard.fullName}
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,244,233,0.84)', maxWidth: 620, fontSize: { xs: '1rem', md: '1.04rem' }, lineHeight: 1.7 }}>
                    Keep track of your active wash, upcoming booking, loyalty progress, saved vehicles, and recent service history from one customer home.
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                    {dashboard.activeSession?.portalToken ? (
                      <Button variant="contained" startIcon={<TrackChanges />} onClick={() => navigate(`/portal/${dashboard.activeSession?.portalToken}`)} sx={ctaButtonSx}>
                        Open active session
                      </Button>
                    ) : (
                      <Button variant="contained" startIcon={<EventAvailable />} onClick={handleBookNow} sx={ctaButtonSx}>
                        Book a wash
                      </Button>
                    )}
                    <Button variant="outlined" startIcon={<DirectionsCar />} onClick={handleBookNow} sx={heroGhostButtonSx}>
                      New booking
                    </Button>
                  </Stack>
                  {!hasAnyActivity && (
                    <Paper sx={welcomeCardSx}>
                      <Stack spacing={1}>
                        <Typography sx={{ fontWeight: 700, color: '#fff8f1' }}>
                          Your account is ready
                        </Typography>
                        <Typography sx={{ color: 'rgba(255,244,233,0.76)', lineHeight: 1.6 }}>
                          You have successfully signed in, but you have not created a wash session yet. Start your first booking and this dashboard will begin showing live tracking, saved vehicles, and wash history here.
                        </Typography>
                      </Stack>
                    </Paper>
                  )}
                </Stack>
              </Grid2>

              <Grid2 size={{ xs: 12, lg: 5 }}>
                <Paper sx={summaryCardSx}>
                  <Stack spacing={1.8}>
                    <Typography sx={{ fontWeight: 700, fontSize: '1.12rem' }}>Account snapshot</Typography>
                    <SummaryRow label="Visits" value={String(dashboard.totalVisits)} />
                    <SummaryRow label="Loyalty tier" value={dashboard.loyaltyTier} />
                    <SummaryRow label="Points" value={String(dashboard.loyaltyPoints)} />
                    <SummaryRow label="Saved vehicles" value={String(dashboard.savedVehicles.length)} />
                  </Stack>
                </Paper>
              </Grid2>
            </Grid2>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: { xs: 5, md: 7 } }}>
        <Grid2 container spacing={3}>
          <Grid2 size={{ xs: 12, lg: 8 }}>
            <Stack spacing={3}>
              <Paper sx={sectionCardSx}>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1.2} alignItems="center">
                    <TrackChanges sx={{ color: '#e36b2c' }} />
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>Active and upcoming</Typography>
                  </Stack>
                  <Grid2 container spacing={2}>
                    <Grid2 size={{ xs: 12, md: 6 }}>
                      <Paper sx={innerCardSx}>
                        <Typography sx={{ fontWeight: 700, mb: 1 }}>Active session</Typography>
                        {dashboard.activeSession ? (
                          <Stack spacing={0.8}>
                            <Typography>{dashboard.activeSession.registrationNumber}</Typography>
                            <Typography sx={{ color: 'text.secondary' }}>{dashboard.activeSession.servicePackage}</Typography>
                            <Typography sx={{ color: 'text.secondary' }}>{dashboard.activeSession.branchName}</Typography>
                            <Typography sx={{ fontWeight: 700 }}>{formatCurrency(dashboard.activeSession.price)}</Typography>
                            <Button variant="contained" onClick={() => navigate(`/portal/${dashboard.activeSession?.portalToken}`)} sx={compactButtonSx}>
                              Track now
                            </Button>
                          </Stack>
                        ) : (
                          <Stack spacing={1}>
                            <Typography sx={{ color: 'text.secondary' }}>No live session right now.</Typography>
                            <Button variant="outlined" onClick={handleBookNow} sx={secondaryButtonSx}>
                              Start a new booking
                            </Button>
                          </Stack>
                        )}
                      </Paper>
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 6 }}>
                      <Paper sx={innerCardSx}>
                        <Typography sx={{ fontWeight: 700, mb: 1 }}>Upcoming booking</Typography>
                        {dashboard.upcomingSession ? (
                          <Stack spacing={0.8}>
                            <Typography>{dashboard.upcomingSession.registrationNumber}</Typography>
                            <Typography sx={{ color: 'text.secondary' }}>{dashboard.upcomingSession.servicePackage}</Typography>
                            <Typography sx={{ color: 'text.secondary' }}>
                              {dashboard.upcomingSession.appointmentAt ? new Date(dashboard.upcomingSession.appointmentAt).toLocaleString() : 'Scheduled'}
                            </Typography>
                            <Typography sx={{ fontWeight: 700 }}>{formatCurrency(dashboard.upcomingSession.price)}</Typography>
                          </Stack>
                        ) : (
                          <Typography sx={{ color: 'text.secondary' }}>No upcoming booking saved.</Typography>
                        )}
                      </Paper>
                    </Grid2>
                  </Grid2>
                </Stack>
              </Paper>

              <Paper sx={sectionCardSx}>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1.2} alignItems="center">
                    <DirectionsCar sx={{ color: '#e36b2c' }} />
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>Saved vehicles</Typography>
                  </Stack>
                  <Grid2 container spacing={2}>
                    {dashboard.savedVehicles.length ? dashboard.savedVehicles.map((vehicle) => (
                      <Grid2 key={vehicle.registrationNumber} size={{ xs: 12, md: 6 }}>
                        <Paper sx={innerCardSx}>
                          <Stack spacing={0.8}>
                            <Typography sx={{ fontWeight: 700 }}>{vehicle.registrationNumber}</Typography>
                            <Typography sx={{ color: 'text.secondary' }}>{vehicle.vehicleType || 'Vehicle'}</Typography>
                            <Typography sx={{ color: 'text.secondary' }}>{vehicle.preferredServicePackage || 'No preferred package yet'}</Typography>
                            <Typography sx={{ color: 'text.secondary' }}>
                              {vehicle.preferredAddOnServices?.length ? vehicle.preferredAddOnServices.join(', ') : 'No saved add-ons'}
                            </Typography>
                            <Button
                              variant="outlined"
                              onClick={() => {
                                const params = new URLSearchParams({
                                  name: dashboard.fullName,
                                  phone: dashboard.phone ?? '',
                                  email: dashboard.email ?? '',
                                  username: dashboard.username,
                                  reg: vehicle.registrationNumber,
                                  vehicleType: vehicle.vehicleType ?? '',
                                  servicePackage: vehicle.preferredServicePackage ?? '',
                                });
                                (vehicle.preferredAddOnServices ?? []).forEach((item) => params.append('addOn', item));
                                navigate(`/portal/book?${params.toString()}`);
                              }}
                              sx={secondaryButtonSx}
                            >
                              Rebook this car
                            </Button>
                          </Stack>
                        </Paper>
                      </Grid2>
                    )) : (
                      <Grid2 size={{ xs: 12 }}>
                        <Paper sx={emptyStateCardSx}>
                          <Stack spacing={1}>
                            <Typography sx={{ fontWeight: 700 }}>No saved vehicles yet</Typography>
                            <Typography sx={{ color: 'text.secondary' }}>
                              Once you book or complete a wash, your vehicles will be remembered here for faster repeat booking.
                            </Typography>
                          </Stack>
                        </Paper>
                      </Grid2>
                    )}
                  </Grid2>
                </Stack>
              </Paper>

              <Paper sx={sectionCardSx}>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1.2} alignItems="center">
                    <Paid sx={{ color: '#e36b2c' }} />
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>Recent washes</Typography>
                  </Stack>
                  <Stack spacing={1.3}>
                    {dashboard.recentSessions.length ? dashboard.recentSessions.map((item) => (
                      <Paper key={item.sessionId} sx={historyCardSx}>
                        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.2}>
                          <Box>
                            <Typography sx={{ fontWeight: 700 }}>{item.registrationNumber} • {item.servicePackage}</Typography>
                            <Typography sx={{ color: 'text.secondary' }}>
                              {item.branchName} • {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Recent'}
                            </Typography>
                          </Box>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip label={item.status.replace('_', ' ')} sx={statusChipSx} />
                            <Typography sx={{ fontWeight: 700 }}>{formatCurrency(item.price)}</Typography>
                          </Stack>
                        </Stack>
                      </Paper>
                    )) : (
                      <Paper sx={emptyStateCardSx}>
                        <Stack spacing={1}>
                          <Typography sx={{ fontWeight: 700 }}>No wash history yet</Typography>
                          <Typography sx={{ color: 'text.secondary' }}>
                            Your completed and recent bookings will appear here once you start using the service.
                          </Typography>
                        </Stack>
                      </Paper>
                    )}
                  </Stack>
                </Stack>
              </Paper>
            </Stack>
          </Grid2>

          <Grid2 size={{ xs: 12, lg: 4 }}>
            <Stack spacing={3}>
              <Paper sx={sectionCardSx}>
                <Stack spacing={1.8}>
                  <Stack direction="row" spacing={1.2} alignItems="center">
                    <Stars sx={{ color: '#e36b2c' }} />
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>Loyalty</Typography>
                  </Stack>
                  <Typography sx={{ color: 'text.secondary' }}>
                    {dashboard.loyaltyTier} tier • {dashboard.loyaltyPoints} points
                  </Typography>
                  <Box sx={{ height: 10, borderRadius: 999, bgcolor: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                    <Box sx={{ width: `${Math.max(loyaltyProgress, 8)}%`, height: '100%', bgcolor: '#e36b2c', borderRadius: 999 }} />
                  </Box>
                </Stack>
              </Paper>

              <Paper sx={sectionCardSx}>
                <Stack spacing={1.8}>
                  <Stack direction="row" spacing={1.2} alignItems="center">
                    <NotificationsActive sx={{ color: '#e36b2c' }} />
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>Notifications</Typography>
                  </Stack>
                  <Stack spacing={1.2}>
                    {dashboard.notifications.length ? dashboard.notifications.map((item, index) => (
                      <Paper key={`${item.title}-${index}`} sx={notificationCardSx}>
                        <Typography sx={{ fontWeight: 700 }}>{item.title}</Typography>
                        <Typography sx={{ color: 'text.secondary', mt: 0.7 }}>{item.body}</Typography>
                        <Typography sx={{ color: 'text.secondary', mt: 0.7, fontSize: '0.82rem' }}>
                          {item.occurredAt ? new Date(item.occurredAt).toLocaleString() : 'Live'}
                        </Typography>
                      </Paper>
                    )) : (
                      <Paper sx={emptyStateCardSx}>
                        <Typography sx={{ color: 'text.secondary' }}>
                          Account notifications will appear here after your first booking or active wash update.
                        </Typography>
                      </Paper>
                    )}
                  </Stack>
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

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <Box display="flex" justifyContent="space-between" gap={2}>
      <Typography sx={{ color: 'text.secondary' }}>{label}</Typography>
      <Typography sx={{ fontWeight: 700, color: 'text.primary', textAlign: 'right' }}>{value}</Typography>
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

const heroGhostButtonSx = {
  color: '#fff8f1',
  borderColor: 'rgba(255,248,241,0.26)',
  px: 3,
  py: 1.2,
  borderRadius: 999,
  '&:hover': {
    borderColor: 'rgba(255,248,241,0.46)',
    bgcolor: 'rgba(255,248,241,0.06)',
  },
};

const summaryCardSx = {
  p: 3,
  borderRadius: 5,
  bgcolor: 'rgba(255,247,240,0.08)',
  border: '1px solid rgba(255,248,241,0.18)',
  boxShadow: '0 20px 40px rgba(8, 6, 5, 0.12)',
  backdropFilter: 'blur(11px)',
};

const welcomeCardSx = {
  p: 2.2,
  borderRadius: 4,
  bgcolor: 'rgba(255,248,241,0.08)',
  border: '1px solid rgba(255,248,241,0.18)',
  boxShadow: '0 16px 34px rgba(8, 6, 5, 0.11)',
  backdropFilter: 'blur(11px)',
};

const sectionCardSx = {
  p: 3,
  borderRadius: 4,
  bgcolor: 'rgba(255,247,240,0.05)',
};

const innerCardSx = {
  p: 2,
  borderRadius: 3.2,
  bgcolor: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.06)',
  boxShadow: 'none',
  height: '100%',
};

const historyCardSx = {
  p: 1.6,
  borderRadius: 3,
  bgcolor: 'rgba(255,255,255,0.025)',
  border: '1px solid rgba(255,255,255,0.06)',
  boxShadow: 'none',
};

const notificationCardSx = {
  p: 1.5,
  borderRadius: 3,
  bgcolor: 'rgba(255,255,255,0.025)',
  border: '1px solid rgba(255,255,255,0.06)',
  boxShadow: 'none',
};

const emptyStateCardSx = {
  p: 1.8,
  borderRadius: 3,
  bgcolor: 'rgba(255,255,255,0.025)',
  border: '1px solid rgba(255,255,255,0.06)',
  boxShadow: 'none',
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

const compactButtonSx = {
  ...ctaButtonSx,
  width: 'fit-content',
  px: 2,
  py: 1,
};

const secondaryButtonSx = {
  color: '#f5ede5',
  borderColor: 'rgba(255,243,232,0.14)',
  borderRadius: 999,
  py: 1,
  '&:hover': {
    borderColor: 'rgba(255,243,232,0.24)',
    bgcolor: 'rgba(255,247,240,0.05)',
  },
};

const statusChipSx = {
  bgcolor: 'rgba(227,107,44,0.12)',
  color: '#efb393',
  fontWeight: 700,
};

export default CustomerDashboardPage;
