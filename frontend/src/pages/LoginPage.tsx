import { Alert, Box, Button, Paper, TextField, Typography, InputAdornment, IconButton, CircularProgress, Divider } from '@mui/material';
import { FormEvent, useState, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { authStore } from '../store/auth';
import { AuthResponse } from '../types';
import { Visibility, VisibilityOff, LocalCarWash, Email, Lock, AutoAwesome, Speed, Star, Logout } from '@mui/icons-material';

// Lazy load Spline for 3D graphics
const SplineLazy = lazy(() =>
  import("@splinetool/react-spline").then((module) => ({ default: module.default }))
);

export function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is already logged in
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
    const formData = new FormData(event.currentTarget);
    try {
      const response = await api.post<AuthResponse>('/auth/login', {
        username: formData.get('username'),
        password: formData.get('password'),
        role: formData.get('role')
      });
      authStore.set(response);
      navigate('/');
    } catch (err) {
      setError((err as Error).message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Floating particles data
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: 4 + Math.random() * 8,
    x: Math.random() * 100,
    duration: 15 + Math.random() * 10,
    delay: Math.random() * 5,
    color: ['#14b86a', '#0ea5e9', '#8b5cf6', '#f59e0b'][Math.floor(Math.random() * 4)]
  }));

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        position: 'relative',
        overflow: 'hidden',
        background: `
          radial-gradient(ellipse at 20% 20%, rgba(20, 184, 106, 0.12) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 50%, rgba(14, 165, 233, 0.08) 0%, transparent 70%),
          linear-gradient(180deg, #0a0f1a 0%, #0f172a 50%, #0a0f1a 100%)
        `
      }}
    >
      {/* Animated Grid Background */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(20, 184, 106, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(20, 184, 106, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'gridPulse 4s ease-in-out infinite',
          '@keyframes gridPulse': {
            '0%, 100%': { opacity: 0.5 },
            '50%': { opacity: 1 }
          }
        }}
      />

      {/* Floating Particles */}
      {particles.map((particle) => (
        <Box
          key={particle.id}
          component={motion.div}
          sx={{
            position: 'absolute',
            width: particle.size,
            height: particle.size,
            borderRadius: '50%',
            background: particle.color,
            left: `${particle.x}%`,
            bottom: -20,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            zIndex: 0
          }}
          animate={{
            y: [0, -window.innerHeight - 100],
            x: [0, Math.sin(particle.delay * Math.PI) * 80],
            opacity: [0, 0.8, 0.4, 0],
            scale: [0.5, 1.2, 0.8]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Animated Glow Orbs */}
      <Box
        component={motion.div}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        sx={{
          position: 'absolute',
          top: '-30%',
          right: '-15%',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(20, 184, 166, 0.15) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      <Box
        component={motion.div}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.35, 0.15],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        sx={{
          position: 'absolute',
          bottom: '-25%',
          left: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      {/* 3D Spline Background */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: { xs: '0%', md: '50%' },
          height: '100%',
          opacity: 0.6,
          zIndex: 0,
          display: { xs: 'none', md: 'block' }
        }}
      >
        <Suspense fallback={null}>
          <SplineLazy
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            style={{ width: '100%', height: '100%' }}
          />
        </Suspense>
      </Box>

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        style={{ width: '100%', maxWidth: 440, zIndex: 1 }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3.5, sm: 5 },
            background: 'rgba(10, 15, 26, 0.85)',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            borderRadius: 4,
            border: '1px solid rgba(20, 184, 106, 0.15)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Animated Border Gradient */}
          <Box
            component={motion.div}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: 'linear-gradient(90deg, #14b86a, #0ea5e9, #8b5cf6, #14b86a)',
              backgroundSize: '300% 100%',
            }}
          />

          {/* Logo and Title */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              component={motion.div}
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #14b86a 0%, #0d9488 50%, #0ea5e9 100%)',
                mb: 2.5,
                boxShadow: '0 15px 40px rgba(20, 184, 166, 0.35)',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  inset: -2,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #14b86a, #0ea5e9)',
                  zIndex: -1,
                  filter: 'blur(8px)',
                  opacity: 0.5
                }
              }}
            >
              <LocalCarWash sx={{ fontSize: 40, color: 'white' }} />
            </Box>

            <Typography
              variant="h3"
              component={motion.h3}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 50%, #94a3b8 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.5,
                fontSize: { xs: '1.75rem', sm: '2rem' }
              }}
            >
              RinseFlow
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.5
              }}
            >
              <AutoAwesome sx={{ fontSize: 14, color: '#14b86a' }} />
              Car Wash Management System
            </Typography>
          </Box>

          {/* Feature Pills */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3, flexWrap: 'wrap' }}>
            {[
              { icon: <Speed sx={{ fontSize: 14 }} />, text: 'Fast' },
              { icon: <AutoAwesome sx={{ fontSize: 14 }} />, text: 'Smart' },
              { icon: <Star sx={{ fontSize: 14 }} />, text: 'Reliable' }
            ].map((feature, i) => (
              <Box
                key={i}
                component={motion.div}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '20px',
                  background: 'rgba(20, 184, 106, 0.1)',
                  border: '1px solid rgba(20, 184, 106, 0.2)',
                  fontSize: '0.75rem',
                  color: 'rgba(255,255,255,0.7)'
                }}
              >
                {feature.icon}
                {feature.text}
              </Box>
            ))}
          </Box>

          {/* Already logged in message */}
          {isLoggedIn && (
            <Alert
              severity="info"
              sx={{
                mb: 3,
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                '& .MuiAlert-icon': { color: '#3b82f6' }
              }}
            >
              Currently logged in as: <strong>{currentAuth?.username}</strong> ({currentAuth?.role})
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  '& .MuiAlert-icon': { color: '#ef4444' }
                }}
              >
                {error}
              </Alert>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={submit}>
            <TextField
              fullWidth
              name="username"
              label="Username"
              placeholder="Enter your username"
              required
              defaultValue=""
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(30, 41, 59, 0.4)',
                  '& fieldset': {
                    borderColor: 'rgba(148, 163, 184, 0.15)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(20, 184, 166, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#14b86a',
                    borderWidth: 2,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'text.secondary',
                },
                '& .MuiInputBase-input': {
                  py: 1.5,
                },
              }}
            />

            <TextField
              fullWidth
              name="password"
              type={showPassword ? 'text' : 'password'}
              label="Password"
              placeholder="Enter your password"
              required
              defaultValue=""
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
                      sx={{ color: 'text.secondary' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(30, 41, 59, 0.4)',
                  '& fieldset': {
                    borderColor: 'rgba(148, 163, 184, 0.15)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(20, 184, 166, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#14b86a',
                    borderWidth: 2,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'text.secondary',
                },
                '& .MuiInputBase-input': {
                  py: 1.5,
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              component={motion.button}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              sx={{
                py: 1.75,
                fontSize: '1rem',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #14b86a 0%, #0d9488 50%, #0ea5e9 100%)',
                backgroundSize: '200% 100%',
                boxShadow: '0 10px 25px rgba(20, 184, 166, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0ea5a9 0%, #0d9488 50%, #0284c7 100%)',
                  boxShadow: '0 15px 35px rgba(20, 184, 166, 0.4)',
                },
                '&:disabled': {
                  background: 'rgba(148, 163, 184, 0.3)',
                  color: 'rgba(255, 255, 255, 0.5)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                isLoggedIn ? 'Switch User' : 'Sign In'
              )}
            </Button>
          </form>

          {/* Logout button if logged in */}
          {isLoggedIn && (
            <Box sx={{ mt: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleLogout}
                startIcon={<Logout />}
                sx={{
                  borderColor: 'rgba(239, 68, 68, 0.5)',
                  color: '#ef4444',
                  '&:hover': {
                    borderColor: '#ef4444',
                    background: 'rgba(239, 68, 68, 0.1)',
                  },
                }}
              >
                Logout First
              </Button>
            </Box>
          )}

          {/* Demo Credentials */}
          <Box sx={{ mt: 4, p: 2, background: 'rgba(30, 41, 59, 0.5)', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: '#14b86a', fontWeight: 600 }}>
              Demo Credentials
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontFamily: 'monospace' }}>
              admin / password (Admin)
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontFamily: 'monospace' }}>
              manager.accra / password
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontFamily: 'monospace' }}>
              cashier.accra / password
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontFamily: 'monospace' }}>
              lane.accra / password
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontFamily: 'monospace' }}>
              inspector.accra / password
            </Typography>
          </Box>

          {/* Footer */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Divider sx={{ mb: 3, borderColor: 'rgba(148, 163, 184, 0.1)' }}>
              <Typography variant="caption" color="text.secondary">
                Secure Access
              </Typography>
            </Divider>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: 'block',
                opacity: 0.6,
                fontSize: '0.75rem'
              }}
            >
              Powered by RinseFlow Technologies
            </Typography>
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
}
