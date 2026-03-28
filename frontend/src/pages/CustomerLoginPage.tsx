import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  ArrowForward as ArrowIcon,
  DirectionsCar as CarIcon,
  Email as EmailIcon,
  LocalActivity as ServiceIcon,
  LockOutlined as LockIcon,
  ShieldOutlined as ShieldIcon,
  MarkEmailRead as EmailOtpIcon,
  TaskAlt as TaskAltIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { API_ORIGIN } from '../utils/constants';

const API_BASE = `${API_ORIGIN}/api/portal/sessions`;

const normalizePlate = (value: string) =>
  value.toUpperCase().replace(/[^A-Z0-9-\s]/g, '').replace(/\s+/g, ' ').trimStart();

const CustomerLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [reg, setReg] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const canRequestCode = Boolean(reg.trim() && email.trim());
  const canVerifyCode = otp.length === 4;
  const isLocalPreview = useMemo(() => window.location.hostname === 'localhost', []);

  const requestOtp = async () => {
    const response = await fetch(`${API_BASE}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error('Failed to send login code. Please check your network and try again.');
    }

    setStep(2);
    setInfo(
      isLocalPreview
        ? 'A code was generated. In local mode, the mock email code is written to backend/startup_local_host.log.'
        : `A login code was sent to ${email}.`,
    );
  };

  const handleDirectAccess = async () => {
    if (!canRequestCode) return;

    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      const response = await fetch(
        `${API_BASE}/find?reg=${encodeURIComponent(reg.trim())}&email=${encodeURIComponent(email.trim())}`,
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('No active wash session was found for that vehicle and email address.');
        }
        throw new Error('Direct access failed. Please request a code instead.');
      }

      const data = await response.json();
      if (!data.portalToken) {
        throw new Error('Session found, but portal access is unavailable.');
      }

      navigate(`/portal/${data.portalToken}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Direct access failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canRequestCode) return;

    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      await requestOtp();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send a login code right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canVerifyCode) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp, reg }),
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error('Invalid or expired code.');
        if (response.status === 404) throw new Error('No active wash session was found for that vehicle and email address.');
        throw new Error('Verification failed. Please try again.');
      }

      const data = await response.json();
      if (!data.portalToken) {
        throw new Error('Session found, but portal access is unavailable.');
      }

      navigate(`/portal/${data.portalToken}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError(null);

    try {
      await requestOtp();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to resend the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: { xs: 4, md: 6 },
        background: 'linear-gradient(180deg, #101519 0%, #12181d 100%)',
      }}
    >
      <Container maxWidth="lg">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} alignItems="stretch">
            <Paper sx={leftPanelSx}>
              <Stack spacing={3.5}>
                <Box>
                  <Chip label="Customer Portal Access" sx={heroChipSx} />
                  <Typography variant="h2" sx={{ mt: 2.5, fontWeight: 900, letterSpacing: -1.4, lineHeight: 1.02 }}>
                    Re-enter the wash journey with a secure one-time code
                  </Typography>
                  <Typography sx={{ mt: 2, color: 'rgba(154,168,176,0.82)', maxWidth: 640 }}>
                    Use the same registration number and email address from the booking to unlock live tracking, payment, and inspection approval in one place.
                  </Typography>
                </Box>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} useFlexGap flexWrap="wrap">
                  <Chip icon={<ShieldIcon />} label="One-time secure access" sx={featureChipSx} />
                  <Chip icon={<TaskAltIcon />} label="No password required" sx={featureChipSx} />
                  <Chip icon={<EmailOtpIcon />} label="Fast email code login flow" sx={featureChipSx} />
                </Stack>

                <Paper sx={featurePanelSx}>
                  <Stack spacing={2}>
                    <Typography variant="overline" sx={{ color: '#f0b44c', letterSpacing: 1.8 }}>
                      What the portal unlocks
                    </Typography>
                    <PortalBenefit title="Live wash status" description="Watch the session move from registered to washing, inspection, and completion." />
                    <PortalBenefit title="Arrival-linked session details" description="See the booked branch, selected service, scheduled slot, and payment status." />
                    <PortalBenefit title="Customer handoff actions" description="Approve inspection, complete payment, and keep a direct link for later." />
                  </Stack>
                </Paper>
              </Stack>
            </Paper>

            <Paper sx={rightPanelSx}>
              <Stack spacing={3}>
                <Box textAlign="center">
                  <Typography variant="overline" sx={{ color: '#f0b44c', letterSpacing: 1.6 }}>
                    Secure Entry
                  </Typography>
                  <Typography variant="h4" sx={{ mt: 1, fontWeight: 800 }}>
                    Customer portal sign in
                  </Typography>
                  <Typography sx={{ mt: 1, color: 'rgba(154,168,176,0.82)' }}>
                    Complete the two-step flow below to resume an active wash session.
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1} justifyContent="center">
                  <Chip label="1. Identify session" sx={stepChipSx(step === 1)} />
                  <Chip label="2. Verify code" sx={stepChipSx(step === 2)} />
                </Stack>

                {step === 1 ? (
                  <form onSubmit={handleSendOtp}>
                    <Stack spacing={2.5}>
                      {error && <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>}
                      {info && <Alert severity="info" sx={{ borderRadius: 3 }}>{info}</Alert>}

                      <TextField
                        fullWidth
                        label="Registration number"
                        placeholder="e.g. GR-1234-23"
                        value={reg}
                        onChange={(event) => setReg(normalizePlate(event.target.value))}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CarIcon sx={{ color: '#67e8f9' }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={fieldSx}
                      />

                      <TextField
                        fullWidth
                        label="Email address"
                        type="email"
                        placeholder="Use the email provided at booking"
                        value={email}
                        onChange={(event) => setEmail(event.target.value.trimStart().toLowerCase())}
                        required
                        helperText="Use the same email address that was captured during booking."
                        FormHelperTextProps={{ sx: helperTextSx }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon sx={{ color: '#67e8f9' }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={fieldSx}
                      />

                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={loading || !canRequestCode}
                        endIcon={loading ? <CircularProgress size={20} /> : <EmailOtpIcon />}
                        sx={primaryButtonSx}
                      >
                        {loading ? 'Sending code...' : 'Send login code to email'}
                      </Button>

                      <Button
                        type="button"
                        variant="outlined"
                        fullWidth
                        disabled={loading || !canRequestCode}
                        onClick={handleDirectAccess}
                        endIcon={loading ? <CircularProgress size={20} /> : <ArrowIcon />}
                        sx={secondaryButtonSx}
                      >
                        Open active session directly
                      </Button>

                      <Alert severity="info" sx={{ borderRadius: 3 }}>
                        If the wash is already active, direct access will open it immediately using the same plate number and email address.
                      </Alert>
                    </Stack>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp}>
                    <Stack spacing={2.5}>
                      {error && <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>}
                      {info && <Alert severity="info" sx={{ borderRadius: 3 }}>{info}</Alert>}

                      <Paper sx={verifyPanelSx}>
                        <Typography sx={{ color: 'white', fontWeight: 700 }}>
                          Verification destination
                        </Typography>
                        <Typography sx={{ mt: 0.75, color: 'rgba(226,232,240,0.68)' }}>
                          Enter the 4-digit code sent to {email}.
                        </Typography>
                      </Paper>

                      <TextField
                        fullWidth
                        label="4-digit code"
                        placeholder="e.g. 1234"
                        value={otp}
                        onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 4))}
                        required
                        autoFocus
                        inputProps={{ inputMode: 'numeric', maxLength: 4 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon sx={{ color: '#67e8f9' }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          ...fieldSx,
                          '& .MuiOutlinedInput-input': {
                            letterSpacing: '0.36em',
                            fontSize: '1.12rem',
                            fontWeight: 800,
                          },
                        }}
                      />

                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={loading || !canVerifyCode}
                        endIcon={loading ? <CircularProgress size={20} /> : <ArrowIcon />}
                        sx={primaryButtonSx}
                      >
                        {loading ? 'Verifying...' : 'Open live portal'}
                      </Button>

                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                        <Button fullWidth variant="outlined" onClick={() => setStep(1)} sx={secondaryButtonSx}>
                          Edit details
                        </Button>
                        <Button fullWidth variant="outlined" onClick={handleResend} disabled={loading} sx={secondaryButtonSx}>
                          Resend code
                        </Button>
                      </Stack>
                    </Stack>
                  </form>
                )}

                <Divider sx={{ borderColor: 'rgba(148,163,184,0.12)' }} />

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/portal/book')}
                  startIcon={<ServiceIcon />}
                  sx={secondaryButtonSx}
                >
                  Book a new wash session
                </Button>
              </Stack>
            </Paper>
          </Stack>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'rgba(226,232,240,0.34)' }}>
              © 2026 RinseFlow Car Wash Operations
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

function PortalBenefit({ title, description }: { title: string; description: string }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start">
      <Box sx={{ mt: 0.2, width: 26, height: 26, borderRadius: 999, bgcolor: 'rgba(240,180,76,0.14)', display: 'grid', placeItems: 'center' }}>
        <TaskAltIcon sx={{ color: '#f0b44c', fontSize: 16 }} />
      </Box>
      <Box>
        <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
        <Typography sx={{ color: 'rgba(154,168,176,0.82)' }}>{description}</Typography>
      </Box>
    </Stack>
  );
}

const leftPanelSx = {
  flex: 1.05,
  p: { xs: 3, md: 4.5 },
  borderRadius: 4,
  bgcolor: 'rgba(23,29,34,0.98)',
  border: '1px solid rgba(154,168,176,0.14)',
  boxShadow: '0 16px 34px rgba(0, 0, 0, 0.2)',
};

const rightPanelSx = {
  flex: 0.95,
  p: { xs: 3, md: 4 },
  borderRadius: 4,
  bgcolor: 'rgba(23,29,34,0.98)',
  border: '1px solid rgba(154,168,176,0.14)',
};

const heroChipSx = {
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

const featurePanelSx = {
  p: 3,
  borderRadius: 3,
  bgcolor: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(148,163,184,0.12)',
};

const verifyPanelSx = {
  p: 2.25,
  borderRadius: 4,
  bgcolor: 'rgba(240,180,76,0.08)',
  border: '1px solid rgba(240,180,76,0.16)',
};

const stepChipSx = (active: boolean) => ({
  bgcolor: active ? 'rgba(240,180,76,0.14)' : 'rgba(255,255,255,0.03)',
  color: active ? '#f0b44c' : 'rgba(154,168,176,0.76)',
  border: active ? '1px solid rgba(240,180,76,0.22)' : '1px solid rgba(154,168,176,0.12)',
  fontWeight: 700,
});

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    color: '#eef2f4',
    borderRadius: 2.5,
    bgcolor: '#13191e',
    '& fieldset': { borderColor: 'rgba(154,168,176,0.18)' },
    '&:hover fieldset': { borderColor: 'rgba(154,168,176,0.34)' },
    '&.Mui-focused fieldset': { borderColor: '#f0b44c' },
  },
  '& .MuiInputLabel-root': { color: 'rgba(154,168,176,0.76)' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#f0b44c' },
};

const helperTextSx = { color: 'rgba(154,168,176,0.74)' };

const primaryButtonSx = {
  py: 1.6,
  borderRadius: 3,
  bgcolor: '#f0b44c',
  color: '#1b1f22',
  fontWeight: 800,
  boxShadow: 'none',
  '&:hover': { bgcolor: '#f5cb7f' },
};

const secondaryButtonSx = {
  py: 1.4,
  borderRadius: 3,
  color: '#5fb7d4',
  borderColor: 'rgba(95,183,212,0.4)',
  fontWeight: 700,
  '&:hover': {
    borderColor: '#5fb7d4',
    bgcolor: 'rgba(95,183,212,0.06)',
  },
};

export default CustomerLoginPage;
