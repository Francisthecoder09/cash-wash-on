import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  Divider,
} from '@mui/material';
import { FormEvent, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { authStore } from '../store/auth';
import { AuthResponse } from '../types';
import { ArrowForward, DirectionsCar, Lock, Logout, MailOutline, PersonOutline, Visibility, VisibilityOff } from '@mui/icons-material';

const glassFieldSx = {
  '& .MuiOutlinedInput-root': {
    color: '#fffaf6',
    borderRadius: 3,
    bgcolor: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(26px) saturate(145%)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.16)' },
    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.28)' },
    '&.Mui-focused fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
  },
  '& .MuiInputLabel-root': { color: 'rgba(255,245,236,0.78)' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#ffffff' },
};

export function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const currentAuth = authStore.get();
  const isLoggedIn = !!currentAuth;

  const handleLogout = () => {
    authStore.clear();
    window.location.reload();
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    const fd = new FormData(event.currentTarget);
    try {
      const response = await api.post<AuthResponse>('/auth/login', {
        email: fd.get('email'),
        pin: fd.get('pin'),
        role: fd.get('role'),
      });
      authStore.set(response);
      navigate('/');
    } catch (err) {
      setError((err as Error).message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        py: 4,
        background:
          'linear-gradient(180deg, #07090d 0%, #0c1015 100%)',
      }}
    >
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '52px 52px',
          maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.7), rgba(0,0,0,0.25))',
          opacity: 0.08,
          pointerEvents: 'none',
        }}
      />

      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          backgroundImage:
            'linear-gradient(135deg, rgba(5,7,10,0.14), rgba(5,7,10,0.36)), linear-gradient(180deg, rgba(0,0,0,0.04), rgba(0,0,0,0.34)), url("/dhiva-krishna-X16zXcbxU4U-unsplash.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center 60%',
          filter: 'saturate(1.08) contrast(1.05) brightness(1)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          background:
            'radial-gradient(circle at 50% 24%, rgba(255,255,255,0.1), transparent 18%), radial-gradient(circle at 50% 82%, rgba(0,0,0,0.2), transparent 32%)',
          pointerEvents: 'none',
        }}
      />

      <Paper
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 430,
          p: { xs: 3, md: 4 },
          borderRadius: 5,
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.08) 28%, rgba(255,255,255,0.05) 100%)',
          border: '1px solid rgba(255,255,255,0.16)',
          boxShadow: '0 32px 90px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
          backdropFilter: 'blur(34px) saturate(150%)',
          outline: '1px solid rgba(255,255,255,0.06)',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.02) 26%, rgba(255,255,255,0.01) 100%)',
            pointerEvents: 'none',
          }}
        />
        <Stack spacing={3}>
          <Box textAlign="center">
            <Box
              component="img"
              src="/logo-icon.png"
              alt="RinseFlow Logo"
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2.5,
                mx: 'auto',
                mb: 2,
                boxShadow: '0 12px 30px rgba(0,0,0,0.32)',
              }}
            />
            <Typography variant="h4" sx={{ color: '#ffffff', fontWeight: 700, textShadow: '0 4px 20px rgba(0,0,0,0.24)' }}>
              Sign in
            </Typography>
            <Typography sx={{ mt: 0.8, color: 'rgba(255,245,236,0.72)', fontSize: '0.95rem' }}>
              RinseFlow operations access
            </Typography>
          </Box>

          <Paper
            sx={{
              p: 1.5,
              borderRadius: 4,
              bgcolor: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
              backdropFilter: 'blur(18px)',
            }}
          >
            <Stack spacing={1.2}>
              <Typography sx={{ color: '#fffaf6', fontWeight: 800, fontSize: '0.98rem' }}>
                Are you a customer?
              </Typography>
              <Typography sx={{ color: 'rgba(255,245,236,0.72)', fontSize: '0.86rem', lineHeight: 1.55 }}>
                Customers should not use the staff login below. Open the customer page to sign in, register, book, and track your wash.
              </Typography>
              <Button
                component={RouterLink}
                to="/portal/login"
                variant="contained"
                fullWidth
                startIcon={<DirectionsCar />}
                sx={{
                  borderRadius: 999,
                  color: '#1d140f',
                  bgcolor: '#f0b67e',
                  fontWeight: 900,
                  py: 1.35,
                  animation: 'customerPulse 1.5s ease-in-out infinite',
                  boxShadow: '0 16px 28px rgba(240,182,126,0.2)',
                  '@keyframes customerPulse': {
                    '0%': {
                      transform: 'scale(1)',
                      boxShadow: '0 0 0 0 rgba(240,182,126,0.22)',
                    },
                    '50%': {
                      transform: 'scale(1.015)',
                      boxShadow: '0 0 0 10px rgba(240,182,126,0.02)',
                    },
                    '100%': {
                      transform: 'scale(1)',
                      boxShadow: '0 0 0 0 rgba(240,182,126,0)',
                    },
                  },
                  '&:hover': {
                    bgcolor: '#f4c594',
                  },
                }}
              >
                Open customer login
              </Button>
            </Stack>
          </Paper>

          {isLoggedIn && (
            <Alert severity="info" sx={{ borderRadius: 2.5 }}>
              Logged in as <strong>{currentAuth?.email}</strong> ({currentAuth?.role})
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ borderRadius: 2.5 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={submit}>
            <Stack spacing={2.5}>
              <Stack spacing={0.65}>
                <Typography sx={{ color: '#fffaf6', fontWeight: 800 }}>
                  Staff sign in
                </Typography>
                <Typography sx={{ color: 'rgba(255,245,236,0.66)', fontSize: '0.84rem' }}>
                  This form is for staff, managers, inspectors, cashiers, and auditors only.
                </Typography>
              </Stack>

              <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

              <TextField
                fullWidth
                name="email"
                label="Email"
                required
                autoFocus
                sx={glassFieldSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutline sx={{ color: '#ffffff' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                name="pin"
                type={showPin ? 'text' : 'password'}
                label="PIN"
                required
                inputProps={{ inputMode: 'numeric', maxLength: 6 }}
                sx={glassFieldSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#ffffff' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPin((prev) => !prev)} edge="end" sx={{ color: '#ffffff' }}>
                        {showPin ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <FormControl fullWidth sx={glassFieldSx}>
                <InputLabel>Role</InputLabel>
                <Select name="role" label="Role" defaultValue="ADMIN">
                  <MenuItem value="ADMIN">ADMIN</MenuItem>
                  <MenuItem value="BRANCH_MANAGER">BRANCH_MANAGER</MenuItem>
                  <MenuItem value="CASHIER">CASHIER</MenuItem>
                  <MenuItem value="LANE_OPERATOR">LANE_OPERATOR</MenuItem>
                  <MenuItem value="INSPECTOR">INSPECTOR</MenuItem>
                  <MenuItem value="AUDITOR">AUDITOR</MenuItem>
                </Select>
              </FormControl>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                endIcon={isLoading ? <CircularProgress size={18} /> : <ArrowForward />}
                sx={{
                  py: 1.55,
                  borderRadius: 999,
                  fontWeight: 700,
                  bgcolor: 'rgba(255,255,255,0.18)',
                  color: '#fffaf6',
                  border: '1px solid rgba(255,255,255,0.22)',
                  backdropFilter: 'blur(18px)',
                  boxShadow: '0 12px 28px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.12)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.22)',
                  },
                }}
              >
                {isLoading ? 'Signing in...' : 'Login'}
              </Button>

              {isLoggedIn && (
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleLogout}
                  startIcon={<Logout />}
                  sx={{
                    borderRadius: 999,
                    color: '#ffffff',
                    borderColor: 'rgba(255,255,255,0.18)',
                    bgcolor: 'rgba(255,255,255,0.03)',
                    '&:hover': {
                      borderColor: 'rgba(255,255,255,0.3)',
                      bgcolor: 'rgba(255,255,255,0.07)',
                    },
                  }}
                >
                  Sign out current user
                </Button>
              )}

            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
