import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Container, Typography, Paper, TextField, Button, 
  CircularProgress, Alert, Stack, InputAdornment, Divider
} from '@mui/material';
import { 
  DirectionsCar as CarIcon, 
  Phone as PhoneIcon, 
  ArrowForward as ArrowIcon,
  LocalActivity as ServiceIcon,
  LockOutlined as LockIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8083') + '/api/portal/sessions';

const CustomerLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [reg, setReg] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reg || !phone) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`\${API_BASE}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      if (!response.ok) {
        throw new Error('Failed to send login code. Please check your network.');
      }
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`\${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: otp, reg })
      });
      if (!response.ok) {
        if (response.status === 401) throw new Error('Invalid or expired code.');
        if (response.status === 404) throw new Error('No active wash session found for this vehicle.');
        throw new Error('Verification failed.');
      }
      const data = await response.json();
      if (data.portalToken) {
        navigate(`/portal/\${data.portalToken}`);
      } else {
        throw new Error('Session found but portal access is unavailable.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#0f172a', 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center',
      background: 'radial-gradient(circle at top right, #1e293b, #0f172a)'
    }}>
      <Container maxWidth="xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#38bdf8', mb: 1 }}>
              RinseFlow
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              Secure Customer Portal
            </Typography>
          </Box>

          <Paper sx={{ 
            p: 4, 
            borderRadius: 4, 
            bgcolor: 'rgba(255,255,255,0.03)', 
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
          }}>
            {step === 1 ? (
              <form onSubmit={handleSendOtp}>
                <Stack spacing={3}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
                    Enter your details to receive a secure login code.
                  </Typography>

                  {error && (
                    <Alert severity="error" sx={{ borderRadius: 2, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>
                      {error}
                    </Alert>
                  )}

                  <TextField
                    fullWidth
                    label="Registration Number"
                    placeholder="e.g. ABC-1234"
                    value={reg}
                    onChange={(e) => setReg(e.target.value.toUpperCase())}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CarIcon sx={{ color: 'rgba(255,255,255,0.3)' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                        '&:hover fieldset': { borderColor: '#38bdf8' },
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' }
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Phone Number"
                    placeholder="Enter phone used at registry"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon sx={{ color: 'rgba(255,255,255,0.3)' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                        '&:hover fieldset': { borderColor: '#38bdf8' },
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' }
                    }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loading}
                    endIcon={loading ? <CircularProgress size={20} /> : <ArrowIcon />}
                    sx={{ 
                      py: 1.5, 
                      borderRadius: 2, 
                      bgcolor: '#38bdf8', 
                      color: '#0f172a',
                      fontWeight: 800,
                      '&:hover': { bgcolor: '#7dd3fc' }
                    }}
                  >
                    SEND LOGIN CODE
                  </Button>
                </Stack>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                <Stack spacing={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                      Code sent via SMS to <strong>{phone}</strong>
                    </Typography>
                  </Box>

                  {error && (
                    <Alert severity="error" sx={{ borderRadius: 2, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>
                      {error}
                    </Alert>
                  )}

                  <TextField
                    fullWidth
                    label="4-Digit Code"
                    placeholder="e.g. 1234"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    required
                    autoFocus
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: 'rgba(255,255,255,0.3)' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        fontSize: '1.2rem',
                        letterSpacing: '0.2em',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                        '&:hover fieldset': { borderColor: '#38bdf8' },
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' }
                    }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loading || otp.length < 4}
                    endIcon={loading ? <CircularProgress size={20} /> : <ArrowIcon />}
                    sx={{ 
                      py: 1.5, 
                      borderRadius: 2, 
                      bgcolor: '#38bdf8', 
                      color: '#0f172a',
                      fontWeight: 800,
                      '&:hover': { bgcolor: '#7dd3fc' }
                    }}
                  >
                    VERIFY & LOGIN
                  </Button>

                  <Button 
                    variant="text" 
                    onClick={() => setStep(1)}
                    sx={{ color: 'rgba(255,255,255,0.5)' }}
                  >
                    Back to edit details
                  </Button>
                </Stack>
              </form>
            )}
            
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mb: 3 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>OR</Typography>
              </Divider>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/portal/book')}
                startIcon={<ServiceIcon />}
                sx={{ 
                  py: 1.5, 
                  borderRadius: 2, 
                  color: '#38bdf8',
                  borderColor: 'rgba(56, 189, 248, 0.5)',
                  fontWeight: 700,
                  '&:hover': { borderColor: '#38bdf8', bgcolor: 'rgba(56, 189, 248, 0.05)' }
                }}
              >
                BOOK A NEW SESSION
              </Button>
            </Box>
          </Paper>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>
              © 2026 RinseFlow Car Wash Operations
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default CustomerLoginPage;
