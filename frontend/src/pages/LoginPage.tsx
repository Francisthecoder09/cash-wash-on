import {
  Alert, Box, Button, IconButton, InputAdornment, InputLabel,
  Stack, TextField, Typography, CircularProgress, FormControl, Select, MenuItem,
} from '@mui/material';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';
import { authStore } from '../store/auth';
import { AuthResponse } from '../types';
import {
  Visibility, VisibilityOff, Lock, Person, ShieldOutlined, ArrowForward,
} from '@mui/icons-material';

// ─── Main Login Page ─────────────────────────────────────────────────────────
export function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const currentAuth = authStore.get();
  const isLoggedIn = !!currentAuth;

  const handleLogout = () => { authStore.clear(); window.location.reload(); };

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

  // Sky blue color palette
  const skyBlue = {
    primary: '#0ea5e9',
    light: '#38bdf8',
    dark: '#0284c7',
    glow: 'rgba(14, 165, 233, 0.5)',
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: 'linear-gradient(135deg, #020617 0%, #0c1929 50%, #031d33 100%)',
      }}
    >
      {/* Left Panel - Brand & Info */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          px: 8,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles - sky blue */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '20%',
            right: '20%',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 70%)',
            filter: 'blur(30px)',
          }}
        />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 6 }}>
            <Box
              component="img"
              src="/logo-icon.png"
              alt="RinseFlow Logo"
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2.5,
                boxShadow: `0 0 32px ${skyBlue.glow}`,
              }}
            />
            <Box>
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  color: '#fff',
                  lineHeight: 1.1,
                }}
              >
                RinseFlow
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'rgba(148,163,184,0.7)', letterSpacing: '0.12em', fontSize: '0.68rem' }}
              >
                OPERATIONS PLATFORM
              </Typography>
            </Box>
          </Box>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          <Typography
            variant="h2"
            fontWeight={800}
            lineHeight={1.2}
            sx={{
              fontFamily: '"Space Grotesk", sans-serif',
              color: '#fff',
              mb: 2,
            }}
          >
            Car Wash
            <br />
            Management
            <br />
            <Box component="span" sx={{ color: skyBlue.primary }}>Simplified</Box>
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ mb: 4, fontSize: '1.1rem', lineHeight: 1.7, maxWidth: 400 }}
          >
            Streamline your operations with real-time session tracking,
            comprehensive analytics, and intuitive lane management.
          </Typography>
        </motion.div>

        {/* Feature pills - sky blue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Stack direction="row" spacing={2} flexWrap="wrap" gap={2} mb={6}>
            {[
              { label: 'Real-Time Tracking' },
              { label: 'Secure Login' },
              { label: 'Role-Based Access' },
            ].map((item) => (
              <Box
                key={item.label}
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  background: 'rgba(14,165,233,0.1)',
                  border: '1px solid rgba(14,165,233,0.2)',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: skyBlue.light,
                  }}
                >
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Stack>
        </motion.div>

        {/* Stats - sky blue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Stack direction="row" spacing={5}>
            {[
              { value: '99.9%', label: 'Uptime' },
              { value: '< 1s', label: 'Response' },
              { value: '6', label: 'Roles' },
            ].map((s) => (
              <Box key={s.label}>
                <Typography
                  sx={{
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    color: skyBlue.primary,
                    fontFamily: '"Space Grotesk", sans-serif',
                  }}
                >
                  {s.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {s.label}
                </Typography>
              </Box>
            ))}
          </Stack>
        </motion.div>
      </Box>

      {/* Right Panel - Login Form */}
      <Box
        sx={{
          width: { xs: '100%', md: 520 },
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, sm: 5 },
          background: 'rgba(3,29,51,0.95)',
          borderLeft: { md: '1px solid rgba(148,163,184,0.07)' },
        }}
      >
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: 420 }}
        >
          {/* Mobile logo */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 4 }}>
            <Box
              component="img"
              src="/logo-icon.png"
              alt="RinseFlow Logo"
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                boxShadow: `0 0 16px ${skyBlue.glow}`,
              }}
            />
            <Typography
              variant="h5"
              fontWeight={800}
              sx={{ fontFamily: '"Space Grotesk", sans-serif', color: skyBlue.primary }}
            >
              RinseFlow
            </Typography>
          </Box>

          {/* Form Header */}
          <Box mb={4}>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{ fontFamily: '"Space Grotesk", sans-serif', mb: 0.5, color: '#fff' }}
            >
              Welcome back
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Sign in to access your dashboard
            </Typography>
          </Box>

          {/* Already logged in alert */}
          {isLoggedIn && (
            <Alert
              severity="info"
              sx={{
                mb: 2.5,
                bgcolor: 'rgba(59,130,246,0.08)',
                border: '1px solid rgba(59,130,246,0.25)',
              }}
            >
              Logged in as <strong>{currentAuth?.email}</strong> ({currentAuth?.role})
            </Alert>
          )}

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden', marginBottom: 16 }}
              >
                <Alert
                  severity="error"
                  sx={{
                    bgcolor: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.25)',
                  }}
                >
                  {error}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <Box component="form" onSubmit={submit}>
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                name="email"
                label="Email Address"
                placeholder="Enter your work email"
                required
                autoFocus
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    bgcolor: 'rgba(255,255,255,0.03)',
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(14,165,233,0.3)' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: skyBlue.primary, borderWidth: 2 },
                  },
                  '& .MuiInputLabel-root.Mui-focused': { color: skyBlue.primary },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                name="pin"
                label="Security PIN"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your 6-digit PIN"
                required
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 6 }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    bgcolor: 'rgba(255,255,255,0.03)',
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(14,165,233,0.3)' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: skyBlue.primary, borderWidth: 2 },
                  },
                  '& .MuiInputLabel-root.Mui-focused': { color: skyBlue.primary },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                        sx={{ color: 'text.secondary', '&:hover': { color: skyBlue.primary } }}
                      >
                        {showPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <FormControl fullWidth>
                <InputLabel sx={{ '&.Mui-focused': { color: skyBlue.primary } }}>Select Role</InputLabel>
                <Select
                  name="role"
                  label="Select Role"
                  defaultValue=""
                  sx={{
                    borderRadius: 1.5,
                    bgcolor: 'rgba(255,255,255,0.03)',
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(14,165,233,0.3)' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: skyBlue.primary, borderWidth: 2 },
                  }}
                >
                  <MenuItem value="ADMIN">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ef4444' }} />
                      <Typography fontWeight={600}>Administrator</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="BRANCH_MANAGER">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                      <Typography fontWeight={600}>Branch Manager</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="CASHIER">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#3b82f6' }} />
                      <Typography fontWeight={600}>Cashier</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="LANE_OPERATOR">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: skyBlue.primary }} />
                      <Typography fontWeight={600}>Lane Operator</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="INSPECTOR">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#a78bfa' }} />
                      <Typography fontWeight={600}>Inspector</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="AUDITOR">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#06b6d4' }} />
                      <Typography fontWeight={600}>Auditor</Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    id="remember"
                    style={{ accentColor: skyBlue.primary, marginRight: 8, cursor: 'pointer' }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', cursor: 'pointer' }}
                    component="label"
                    htmlFor="remember"
                  >
                    Remember me
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{ color: skyBlue.primary, cursor: 'pointer', fontWeight: 600 }}
                >
                  Forgot PIN?
                </Typography>
              </Box>
            </Stack>

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                size="large"
                sx={{
                  mt: 3,
                  py: 1.75,
                  fontSize: '1rem',
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${skyBlue.primary} 0%, ${skyBlue.dark} 100%)`,
                  boxShadow: `0 8px 24px ${skyBlue.glow}`,
                  borderRadius: 1.5,
                  '&:hover': {
                    boxShadow: `0 12px 32px ${skyBlue.glow}`,
                    background: `linear-gradient(135deg, ${skyBlue.light} 0%, ${skyBlue.primary} 100%)`,
                  },
                }}
              >
                {isLoading ? (
                  <CircularProgress size={22} sx={{ color: 'white' }} />
                ) : isLoggedIn ? (
                  'Switch User'
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <span>Sign In</span>
                    <ArrowForward sx={{ fontSize: 18 }} />
                  </Box>
                )}
              </Button>
            </motion.div>
          </Box>

          {isLoggedIn && (
            <Button
              fullWidth
              variant="outlined"
              onClick={handleLogout}
              sx={{
                mt: 1.5,
                borderColor: 'rgba(239,68,68,0.4)',
                color: '#ef4444',
                borderRadius: 1.5,
                '&:hover': { borderColor: '#ef4444', bgcolor: 'rgba(239,68,68,0.08)' },
              }}
            >
              Logout First
            </Button>
          )}

          {/* Customer Portal */}
          <Box
            sx={{
              mt: 4,
              p: 2,
              bgcolor: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(148,163,184,0.08)',
              borderRadius: 2,
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              Customer Portal
            </Typography>
            <Button
              onClick={() => navigate('/portal/login')}
              variant="outlined"
              size="small"
              sx={{
                color: skyBlue.primary,
                borderColor: 'rgba(14,165,233,0.3)',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  borderColor: skyBlue.primary,
                  bgcolor: 'rgba(14,165,233,0.08)',
                },
              }}
            >
              Track Your Vehicle →
            </Button>
          </Box>

          {/* Security Footer */}
          <Box
            sx={{
              mt: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <ShieldOutlined sx={{ color: 'text.secondary', fontSize: 16 }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Secure Access • © 2025 RinseFlow Technologies
            </Typography>
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
}
