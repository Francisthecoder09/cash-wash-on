import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Container, Typography, Paper, TextField, 
  Button, CircularProgress, Stack, MenuItem, 
  Alert, InputAdornment, Divider
} from '@mui/material';
import { 
  DirectionsCar as CarIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Store as BranchIcon,
  LocalActivity as ServiceIcon,
  ConfirmationNumber as RegIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { SelectOption, ServiceType, Pricing } from '../types';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8083') + '/api/portal/sessions';

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState<SelectOption[]>([]);
  const [services, setServices] = useState<ServiceType[]>([]);
  const [pricing, setPricing] = useState<Pricing[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    branchId: '',
    registrationNumber: '',
    customerName: '',
    customerPhone: '',
    vehicleType: '',
    servicePackage: '',
    estimatedPrice: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [branchRes, serviceRes] = await Promise.all([
          fetch(`\${API_BASE}/branches`),
          fetch(`\${API_BASE}/services`)
        ]);
        
        if (branchRes.ok && serviceRes.ok) {
          setBranches(await branchRes.json());
          setServices(await serviceRes.json());
        } else {
          throw new Error('Failed to load initial data');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleServiceChange = async (serviceId: string) => {
    const service = services.find(s => s.id === Number(serviceId));
    if (!service) return;

    setFormData(prev => ({ 
      ...prev, 
      servicePackage: service.serviceName,
      vehicleType: '',
      estimatedPrice: 0
    }));

    try {
      const res = await fetch(`\${API_BASE}/services/\${serviceId}/pricing`);
      if (res.ok) {
        setPricing(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch pricing', err);
    }
  };

  const handlePricingChange = (pricingId: string) => {
    const p = pricing.find(item => item.id === Number(pricingId));
    if (p) {
      setFormData(prev => ({ 
        ...prev, 
        vehicleType: p.vehicleCategory, 
        estimatedPrice: p.price 
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`\${API_BASE}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          branchId: Number(formData.branchId)
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Booking failed');
      }

      const session = await response.json();
      navigate(`/portal/\${session.portalToken}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#0f172a' }}>
      <CircularProgress sx={{ color: '#38bdf8' }} />
    </Box>
  );

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#0f172a', 
      color: 'white', 
      py: 6,
      background: 'radial-gradient(circle at top right, #1e293b, #0f172a)'
    }}>
      <Container maxWidth="sm">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, color: '#38bdf8' }}>
              Book Your Wash
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.6)' }}>
              Quick, premium, and professional car care.
            </Typography>
          </Box>

          <Paper sx={{ 
            p: 4, 
            borderRadius: 6, 
            bgcolor: 'rgba(255,255,255,0.03)', 
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
          }}>
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

                <TextField
                  select
                  label="Select Branch"
                  required
                  fullWidth
                  value={formData.branchId}
                  onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><BranchIcon sx={{ color: '#38bdf8' }} /></InputAdornment>,
                  }}
                  sx={formStyles}
                >
                  {branches.map(b => <MenuItem key={b.id} value={b.id}>{b.label}</MenuItem>)}
                </TextField>

                <TextField
                  select
                  label="Wash Service"
                  required
                  fullWidth
                  onChange={(e) => handleServiceChange(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><ServiceIcon sx={{ color: '#38bdf8' }} /></InputAdornment>,
                  }}
                  sx={formStyles}
                >
                  {services.map(s => <MenuItem key={s.id} value={s.id}>{s.serviceName}</MenuItem>)}
                </TextField>

                {pricing.length > 0 && (
                  <TextField
                    select
                    label="Vehicle Category"
                    required
                    fullWidth
                    value={pricing.find(p => p.vehicleCategory === formData.vehicleType)?.id || ''}
                    onChange={(e) => handlePricingChange(e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><CarIcon sx={{ color: '#38bdf8' }} /></InputAdornment>,
                    }}
                    sx={formStyles}
                  >
                    {pricing.map(p => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.vehicleCategory} - \${p.price.toFixed(2)}
                      </MenuItem>
                    ))}
                  </TextField>
                )}

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />

                <TextField
                  label="Plate Number"
                  required
                  fullWidth
                  placeholder="e.g. GR-1234-23"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value.toUpperCase() })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><RegIcon sx={{ color: '#38bdf8' }} /></InputAdornment>,
                  }}
                  sx={formStyles}
                />

                <TextField
                  label="Your Name"
                  required
                  fullWidth
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: '#38bdf8' }} /></InputAdornment>,
                  }}
                  sx={formStyles}
                />

                <TextField
                  label="Phone Number"
                  required
                  fullWidth
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ color: '#38bdf8' }} /></InputAdornment>,
                  }}
                  sx={formStyles}
                />

                <Box sx={{ pt: 2 }}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={submitting}
                    endIcon={submitting ? <CircularProgress size={20} /> : <ArrowForwardIcon />}
                    sx={{ 
                      py: 2, 
                      borderRadius: 3, 
                      bgcolor: '#38bdf8', 
                      color: '#0f172a',
                      fontWeight: 900,
                      fontSize: '1.1rem',
                      '&:hover': { bgcolor: '#7dd3fc' },
                      '&.Mui-disabled': { bgcolor: 'rgba(56, 189, 248, 0.3)' }
                    }}
                  >
                    {submitting ? 'BOOKING...' : `BOOK NOW - \$\${formData.estimatedPrice.toFixed(2)}`}
                  </Button>
                </Box>
              </Stack>
            </form>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

const formStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 3,
    color: 'white',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
    '&.Mui-focused fieldset': { borderColor: '#38bdf8' },
    bgcolor: 'rgba(255,255,255,0.02)',
  },
  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#38bdf8' },
};

export default BookingPage;
