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
} from '@mui/material';
import { FormEvent, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { authStore } from '../store/auth';
import { AuthResponse } from '../types';
import { ArrowForward, Lock, Logout, MailOutline, PersonOutline, Visibility, VisibilityOff } from '@mui/icons-material';

const glassFieldSx = {
  '& .MuiOutlinedInput-root': {
    color: '#eef2f4',
    borderRadius: 2.5,
    bgcolor: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(22px)',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.24)' },
    '&.Mui-focused fieldset': { borderColor: 'rgba(255,255,255,0.44)' },
  },
  '& .MuiInputLabel-root': { color: 'rgba(230,238,245,0.74)' },
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
            'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '52px 52px',
          maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.7), rgba(0,0,0,0.25))',
          opacity: 0.1,
          pointerEvents: 'none',
        }}
      />

      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.48)), url("/login-car-hero.svg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          filter: 'saturate(1.02) contrast(1.02)',
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
          borderRadius: 4,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.08) 100%)',
          border: '1px solid rgba(255,255,255,0.18)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.18)',
          backdropFilter: 'blur(28px)',
        }}
      >
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
            <Typography variant="h4" sx={{ color: '#ffffff', fontWeight: 700, textShadow: '0 4px 20px rgba(0,0,0,0.35)' }}>
              Sign in
            </Typography>
          </Box>

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
                  borderRadius: 2.5,
                  fontWeight: 700,
                  bgcolor: 'rgba(255,255,255,0.88)',
                  color: '#0f1217',
                  boxShadow: '0 12px 28px rgba(0,0,0,0.24)',
                  '&:hover': {
                    bgcolor: '#ffffff',
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
                    borderRadius: 2.5,
                    color: '#ffffff',
                    borderColor: 'rgba(255,255,255,0.24)',
                    '&:hover': {
                      borderColor: 'rgba(255,255,255,0.4)',
                      bgcolor: 'rgba(255,255,255,0.08)',
                    },
                  }}
                >
                  Sign out current user
                </Button>
              )}

              <Button
                component={RouterLink}
                to="/portal/login"
                variant="outlined"
                fullWidth
                startIcon={<PersonOutline />}
                sx={{
                  borderRadius: 2.5,
                  color: '#ffffff',
                  borderColor: 'rgba(255,255,255,0.24)',
                  fontWeight: 700,
                  '&:hover': {
                    borderColor: 'rgba(255,255,255,0.4)',
                    bgcolor: 'rgba(255,255,255,0.08)',
                  },
                }}
              >
                Customer login
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
