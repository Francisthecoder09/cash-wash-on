import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Box, Container, Typography, Paper, Stepper, Step, StepLabel, 
  Button, CircularProgress, Divider, Stack, Chip, Alert
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  DirectionsCar as CarIcon,
  LocalActivity as ServiceIcon,
  Timer as ClockIcon,
  Payment as PaymentIcon,
  Draw as SignIcon
} from '@mui/icons-material';
import { VehicleSession, SessionStatus } from '../types';
import SignaturePad from 'react-signature-canvas';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8083') + '/api/portal/sessions';

const statusSteps: SessionStatus[] = ['REGISTERED', 'WASHING', 'INTERIOR', 'INSPECTION', 'COMPLETED'];

const CustomerPortalPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [session, setSession] = useState<VehicleSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const sigPad = useRef<SignaturePad>(null);

  const fetchSession = async () => {
    try {
      const response = await fetch(`${API_BASE}/${token}`);
      if (!response.ok) throw new Error('Session not found or invalid link');
      const data = await response.json();
      setSession(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
    // Poll for status updates every 10 seconds
    const interval = setInterval(fetchSession, 10000);
    return () => clearInterval(interval);
  }, [token]);

  const handleSign = async () => {
    if (sigPad.current?.isEmpty()) return;
    try {
      setLoading(true);
      const signatureData = sigPad.current?.getTrimmedCanvas().toDataURL('image/png');
      const response = await fetch(`${API_BASE}/${token}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signedBy: session?.customerName, signatureData })
      });
      if (response.ok) {
        setSigning(false);
        fetchSession();
      }
    } catch (err) {
      setError('Failed to save signature');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/${token}/pay`, { method: 'POST' });
      if (response.ok) {
        fetchSession();
      }
    } catch (err) {
      setError('Payment failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !session) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#0f172a' }}>
      <CircularProgress sx={{ color: '#38bdf8' }} />
    </Box>
  );

  if (error) return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
      <Button fullWidth onClick={() => window.location.reload()} sx={{ mt: 2 }}>Retry</Button>
    </Container>
  );

  if (!session) return null;

  const activeStep = statusSteps.indexOf(session.status);

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#0f172a', 
      color: 'white', 
      pb: 8,
      background: 'radial-gradient(circle at top right, #1e293b, #0f172a)'
    }}>
      {/* Header */}
      <Box sx={{ p: 3, textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: 1, color: '#38bdf8' }}>
          RisenFlow PORTAL
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
          Vehicle Wash Live Tracker
        </Typography>
      </Box>

      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Status Stepper */}
          <Paper sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: 4, 
            bgcolor: 'rgba(255,255,255,0.03)', 
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <Stepper activeStep={activeStep} alternativeLabel sx={{
              '& .MuiStepLabel-label': { color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' },
              '& .MuiStepLabel-label.Mui-active': { color: '#38bdf8', fontWeight: 'bold' },
              '& .MuiStepLabel-label.Mui-completed': { color: '#0ea5e9' },
              '& .MuiStepIcon-root': { color: 'rgba(255,255,255,0.1)' },
              '& .MuiStepIcon-root.Mui-active': { color: '#38bdf8' },
              '& .MuiStepIcon-root.Mui-completed': { color: '#0ea5e9' },
            }}>
              {statusSteps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>

          {/* Session Overview */}
          <Paper sx={{ 
            p: 4, 
            borderRadius: 4, 
            bgcolor: 'rgba(255,255,255,0.03)', 
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
          }}>
            <Stack spacing={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: 'white' }}>
                    {session.registrationNumber}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                    {session.customerName} • {session.vehicleType}
                  </Typography>
                </Box>
                <Chip 
                  label={session.status} 
                  color={session.status === 'COMPLETED' ? 'success' : 'primary'}
                  sx={{ fontWeight: 'bold', borderRadius: 1.5 }}
                />
              </Box>

              <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block' }}>Service</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{session.servicePackage}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block' }}>Branch</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{session.branchName}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block' }}>Price</Typography>
                  <Typography variant="h6" sx={{ color: '#38bdf8', fontWeight: 800 }}>${session.price?.toFixed(2)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block' }}>Status</Typography>
                  <Chip 
                    label={session.paid ? 'PAID' : 'UNPAID'} 
                    size="small"
                    color={session.paid ? 'success' : 'warning'}
                    variant={session.paid ? 'filled' : 'outlined'}
                  />
                </Box>
              </Box>

              {/* Action: Signature */}
              {session.status === 'INSPECTION' && !signing && (
                <Button 
                  variant="outlined" 
                  fullWidth 
                  startIcon={<SignIcon />}
                  onClick={() => setSigning(true)}
                  sx={{ color: '#38bdf8', borderColor: '#38bdf8', py: 1.5, borderRadius: 2 }}
                >
                  SIGN TO APPROVE
                </Button>
              )}

              {/* Action: Payment */}
              {session.status === 'COMPLETED' && !session.paid && (
                <Button 
                  variant="contained" 
                  fullWidth 
                  size="large"
                  startIcon={<PaymentIcon />}
                  onClick={handlePayment}
                  sx={{ 
                    bgcolor: '#38bdf8', 
                    color: '#0f172a', 
                    fontWeight: 800,
                    py: 2, 
                    borderRadius: 3,
                    '&:hover': { bgcolor: '#7dd3fc' }
                  }}
                >
                  PROCEED TO PAYMENT
                </Button>
              )}

              {session.paid && (
                <Alert severity="success" icon={<CheckCircleIcon />} sx={{ borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#0ea5e9' }}>
                  Your session is complete and paid. Thank you!
                </Alert>
              )}
            </Stack>
          </Paper>

          {/* Signature Overlay */}
          <AnimatePresence>
            {signing && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                style={{
                  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: 'rgba(15, 23, 42, 0.95)', zIndex: 9999,
                  display: 'flex', flexDirection: 'column', padding: 20
                }}
              >
                <Typography variant="h6" align="center" gutterBottom>Sign Below to Approve Inspection</Typography>
                <Box sx={{ flex: 1, bgcolor: 'white', borderRadius: 4, mb: 3, overflow: 'hidden' }}>
                  <SignaturePad 
                    ref={sigPad}
                    canvasProps={{ style: { width: '100%', height: '100%' } }}
                  />
                </Box>
                <Stack direction="row" spacing={2}>
                  <Button fullWidth variant="outlined" color="inherit" onClick={() => setSigning(false)}>Cancel</Button>
                  <Button fullWidth variant="contained" onClick={handleSign} sx={{ bgcolor: '#38bdf8', color: '#0f172a' }}>Submit</Button>
                </Stack>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </Container>
    </Box>
  );
};

export default CustomerPortalPage;
