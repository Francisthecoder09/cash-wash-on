import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  alpha,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Grid2,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  ArrowForward,
  Email,
  LocalOffer,
  Lock,
  Person,
  PersonAddAlt1,
  PhoneIphone,
  AlternateEmail,
} from '@mui/icons-material';
import { API_ORIGIN } from '../utils/constants';
import { customerAccountStore } from '../store/customerAccount';
import { CustomerContactStrip } from '../components/customer/CustomerContactStrip';

const API_BASE = `${API_ORIGIN}/api/portal/sessions`;
const heroImage = '/joshua-koblin-eqW1MPinEV4-unsplash.jpg';

const sanitizePhone = (value: string) => {
  const trimmed = value.replace(/[^\d+]/g, '');
  const digits = trimmed.replace(/\D/g, '').slice(0, 13);
  return trimmed.startsWith('+') ? `+${digits}` : digits;
};

const normalizeUsername = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9._-]/g, '').slice(0, 60);

const serviceCards = [
  { title: 'Account Sign In', body: 'Use your username, email address, and personal PIN to get back into your customer area.' },
  { title: 'Active Session Ready', body: 'If you already have a wash in progress, we will send you straight to the live tracking page.' },
  { title: 'Register Yourself', body: 'Create your own customer profile with a username and PIN before starting a booking.' },
];

const CustomerLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPin, setRegisterPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const canSignIn = Boolean(username.trim() && email.trim() && pin.trim().length >= 4);
  const canRegister = Boolean(fullName.trim() && registerUsername.trim() && email.trim() && phone.trim() && registerPin.trim().length >= 4);

  const handleAccountLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSignIn) return;

    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      const response = await fetch(`${API_BASE}/customers/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim().toLowerCase(),
          email: email.trim().toLowerCase(),
          pin: pin.trim(),
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid username, email, or PIN.');
        }
        throw new Error('Customer sign-in failed. Please try again.');
      }

      const data = await response.json();
      customerAccountStore.set(data);
      if (data.activePortalToken) {
        navigate(`/portal/${data.activePortalToken}`);
        return;
      }

      if ((data.totalVisits ?? 0) === 0) {
        const params = new URLSearchParams({
          name: data.fullName,
          phone: data.phone ?? '',
          email: data.email ?? '',
          username: data.username,
        });
        navigate(`/portal/book?${params.toString()}`);
        return;
      }

      navigate('/portal/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Customer sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canRegister) return;

    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      const response = await fetch(`${API_BASE}/customers/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          username: registerUsername.trim().toLowerCase(),
          phone: phone.trim(),
          email: email.trim().toLowerCase(),
          pin: registerPin.trim(),
        }),
      });

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('That username, email, or phone is already registered. Please sign in instead.');
        }
        throw new Error('Customer registration failed. Please try again.');
      }

      const data = await response.json();
      customerAccountStore.set({
        id: data.id,
        fullName: data.fullName,
        username: data.username,
        phone: data.phone,
        email: data.email,
        totalVisits: data.totalVisits,
        loyaltyPoints: data.loyaltyPoints,
        activePortalToken: null,
      });

      const params = new URLSearchParams({
        name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        username: registerUsername.trim().toLowerCase(),
      });
      navigate(`/portal/book?${params.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Customer registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      <Box
        sx={{
          minHeight: { xs: 500, md: 580 },
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#14110f',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(90deg, rgba(20,17,15,0.76) 0%, rgba(20,17,15,0.54) 42%, rgba(20,17,15,0.18) 100%), url("${heroImage}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 34%',
          }}
        />
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: { xs: 4, md: 6 } }}>
          <Stack spacing={5}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <Box
                  component="img"
                  src="/logo-icon.png"
                  alt="RinseFlow Logo"
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: 2.2,
                    boxShadow: '0 12px 26px rgba(0,0,0,0.24)',
                  }}
                />
                <Box>
                  <Typography sx={{ color: '#fff8f1', fontWeight: 700, fontSize: '1.1rem' }}>RinseFlow Access</Typography>
                  <Typography sx={{ color: 'rgba(255,244,233,0.7)', fontSize: '0.92rem' }}>Customer sign in and registration</Typography>
                </Box>
              </Stack>
              <Chip label={mode === 'signin' ? 'Customer sign in' : 'Customer registration'} sx={heroChipSx} />
            </Stack>

            <Grid2 container spacing={4} alignItems="center">
              <Grid2 size={{ xs: 12, lg: 7 }}>
                <Stack spacing={2.5}>
                  <Chip label="Car Wash Delivery" sx={heroTagSx} />
                  <Typography variant="h1" sx={{ color: '#fff8f1', maxWidth: 760, lineHeight: 0.95 }}>
                    {mode === 'signin' ? 'Sign in with your customer account' : 'Register yourself before booking'}
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,244,233,0.78)', maxWidth: 620, fontSize: '1.04rem', lineHeight: 1.7 }}>
                    {mode === 'signin'
                      ? 'Use your username, email address, and personal PIN to sign back in. If you already have an active wash, we will open it immediately.'
                      : 'Create your own customer profile with your name, username, email, phone number, and a personal PIN, then move straight into booking.'}
                  </Typography>
                  <Grid2 container spacing={2}>
                    {serviceCards.map((card) => (
                      <Grid2 key={card.title} size={{ xs: 12, sm: 4 }}>
                        <Paper sx={heroInfoCardSx}>
                          <Typography sx={{ fontWeight: 700 }}>{card.title}</Typography>
                          <Typography sx={{ mt: 1, color: 'rgba(255,244,233,0.74)', fontSize: '0.94rem', lineHeight: 1.55 }}>
                            {card.body}
                          </Typography>
                        </Paper>
                      </Grid2>
                    ))}
                  </Grid2>
                </Stack>
              </Grid2>

              <Grid2 size={{ xs: 12, lg: 5 }}>
                <Paper sx={formShellSx}>
                  <Stack spacing={2.5}>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                      <Button variant={mode === 'signin' ? 'contained' : 'outlined'} onClick={() => { setMode('signin'); setError(null); setInfo(null); }} sx={mode === 'signin' ? primaryModeButtonSx : secondaryModeButtonSx}>
                        Sign in
                      </Button>
                      <Button variant={mode === 'register' ? 'contained' : 'outlined'} onClick={() => { setMode('register'); setError(null); setInfo(null); }} sx={mode === 'register' ? primaryModeButtonSx : secondaryModeButtonSx}>
                        Register
                      </Button>
                    </Stack>

                    {mode === 'signin' ? (
                      <form onSubmit={handleAccountLogin}>
                        <Stack spacing={2}>
                          {error && <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>}
                          {info && <Alert severity="info" sx={{ borderRadius: 3 }}>{info}</Alert>}
                          <TextField
                            fullWidth
                            label="Username"
                            value={username}
                            onChange={(event) => setUsername(normalizeUsername(event.target.value))}
                            placeholder="Choose your username"
                            InputProps={{ startAdornment: <InputAdornment position="start"><AlternateEmail sx={{ color: '#e36b2c' }} /></InputAdornment> }}
                            sx={fieldSx}
                          />
                          <TextField
                            fullWidth
                            label="Email address"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value.trimStart().toLowerCase())}
                            placeholder="Use the email from booking"
                            InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: '#e36b2c' }} /></InputAdornment> }}
                            sx={fieldSx}
                          />
                          <TextField
                            fullWidth
                            label="PIN"
                            type="password"
                            value={pin}
                            onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 12))}
                            inputProps={{ inputMode: 'numeric', maxLength: 12 }}
                            InputProps={{ startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#e36b2c' }} /></InputAdornment> }}
                            sx={fieldSx}
                          />
                          <Button type="submit" variant="contained" disabled={loading || !canSignIn} endIcon={loading ? <CircularProgress size={18} /> : <ArrowForward />} sx={ctaButtonSx}>
                            {loading ? 'Signing in...' : 'Sign in and continue'}
                          </Button>
                        </Stack>
                      </form>
                    ) : (
                      <form onSubmit={handleRegister}>
                        <Stack spacing={2}>
                          {error && <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>}
                          {info && <Alert severity="info" sx={{ borderRadius: 3 }}>{info}</Alert>}
                          <TextField
                            fullWidth
                            label="Full name"
                            value={fullName}
                            onChange={(event) => setFullName(event.target.value.trimStart())}
                            InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ color: '#e36b2c' }} /></InputAdornment> }}
                            sx={fieldSx}
                          />
                          <TextField
                            fullWidth
                            label="Username"
                            value={registerUsername}
                            onChange={(event) => setRegisterUsername(normalizeUsername(event.target.value))}
                            placeholder="Create your username"
                            InputProps={{ startAdornment: <InputAdornment position="start"><AlternateEmail sx={{ color: '#e36b2c' }} /></InputAdornment> }}
                            sx={fieldSx}
                          />
                          <TextField
                            fullWidth
                            label="Phone number"
                            value={phone}
                            onChange={(event) => setPhone(sanitizePhone(event.target.value))}
                            inputProps={{ inputMode: 'tel', pattern: '[0-9+]*', maxLength: 14 }}
                            InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIphone sx={{ color: '#e36b2c' }} /></InputAdornment> }}
                            sx={fieldSx}
                          />
                          <TextField
                            fullWidth
                            label="Email address"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value.trimStart().toLowerCase())}
                            InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: '#e36b2c' }} /></InputAdornment> }}
                            sx={fieldSx}
                          />
                          <TextField
                            fullWidth
                            label="Create PIN"
                            type="password"
                            value={registerPin}
                            onChange={(event) => setRegisterPin(event.target.value.replace(/\D/g, '').slice(0, 12))}
                            inputProps={{ inputMode: 'numeric', maxLength: 12 }}
                            InputProps={{ startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#e36b2c' }} /></InputAdornment> }}
                            sx={fieldSx}
                          />
                          <Button type="submit" variant="contained" disabled={loading || !canRegister} endIcon={loading ? <CircularProgress size={18} /> : <PersonAddAlt1 />} sx={ctaButtonSx}>
                            {loading ? 'Registering...' : 'Register and continue'}
                          </Button>
                        </Stack>
                      </form>
                    )}
                  </Stack>
                </Paper>
              </Grid2>
            </Grid2>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: { xs: 5, md: 7 } }}>
        <Grid2 container spacing={3}>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <Paper sx={infoCardSx}>
              <LocalOffer sx={{ color: 'primary.main' }} />
              <Typography sx={{ mt: 1.5, fontWeight: 700 }}>Same premium journey</Typography>
              <Typography sx={{ mt: 1, color: 'text.secondary' }}>
                The customer account flow now matches the booking and portal look, instead of feeling like a separate app.
              </Typography>
            </Paper>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <Paper sx={infoCardSx}>
              <AlternateEmail sx={{ color: 'primary.main' }} />
              <Typography sx={{ mt: 1.5, fontWeight: 700 }}>Username sign-in</Typography>
              <Typography sx={{ mt: 1, color: 'text.secondary' }}>
                Returning customers can sign back in with username, email, and PIN instead of re-entering vehicle details.
              </Typography>
            </Paper>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <Paper sx={infoCardSx}>
              <Lock sx={{ color: 'primary.main' }} />
              <Typography sx={{ mt: 1.5, fontWeight: 700 }}>Personal PIN</Typography>
              <Typography sx={{ mt: 1, color: 'text.secondary' }}>
                Every customer can create a personal PIN during registration and use it for future sign-ins.
              </Typography>
            </Paper>
          </Grid2>
        </Grid2>
      </Container>

      <CustomerContactStrip />
    </Box>
  );
};

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

const heroInfoCardSx = {
  p: 2,
  borderRadius: 4,
  bgcolor: 'rgba(255,248,241,0.08)',
  border: '1px solid rgba(255,248,241,0.12)',
  boxShadow: 'none',
};

const formShellSx = {
  p: 3,
  borderRadius: 5,
  bgcolor: 'rgba(255,247,240,0.05)',
};

const primaryModeButtonSx = {
  bgcolor: '#e36b2c',
  color: '#fffaf5',
  borderRadius: 999,
  px: 2.4,
  '&:hover': {
    bgcolor: '#cf5d21',
  },
};

const secondaryModeButtonSx = {
  color: '#f5ede5',
  borderColor: 'rgba(255,243,232,0.14)',
  borderRadius: 999,
  px: 2.4,
};

const fieldSx = {
  '& .MuiOutlinedInput-root': (theme: any) => ({
    bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.04) : '#fff',
  }),
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

const infoCardSx = {
  p: 3,
  borderRadius: 4,
  height: '100%',
  bgcolor: 'rgba(255,247,240,0.05)',
};

export default CustomerLoginPage;
