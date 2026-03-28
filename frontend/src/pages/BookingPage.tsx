import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  AutoAwesome as SparkleIcon,
  Email as EmailIcon,
  ConfirmationNumber as RegIcon,
  DirectionsCar as CarIcon,
  LocalActivity as ServiceIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Schedule as ScheduleIcon,
  Security as SecurityIcon,
  Store as BranchIcon,
  TaskAlt as TaskAltIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Pricing, SelectOption, ServiceType } from '../types';
import { API_ORIGIN } from '../utils/constants';

const API_BASE = `${API_ORIGIN}/api/portal/sessions`;
const SLOT_DAYS = 5;
const SLOT_START_HOUR = 8;
const SLOT_END_HOUR = 18;
const SLOT_INTERVAL_MINUTES = 30;

const sanitizePhone = (value: string) => {
  const trimmed = value.replace(/[^\d+]/g, '');
  const digits = trimmed.replace(/\D/g, '').slice(0, 13);
  return trimmed.startsWith('+') ? `+${digits}` : digits;
};

const normalizePlate = (value: string) =>
  value.toUpperCase().replace(/[^A-Z0-9-\s]/g, '').replace(/\s+/g, ' ').trimStart();

function generateAppointmentSlots() {
  const slots: { value: string; label: string }[] = [];
  const now = new Date();
  const startBuffer = new Date(now.getTime() + 60 * 60 * 1000);

  for (let dayOffset = 0; dayOffset < SLOT_DAYS; dayOffset += 1) {
    const day = new Date(now);
    day.setDate(now.getDate() + dayOffset);

    for (let hour = SLOT_START_HOUR; hour <= SLOT_END_HOUR; hour += 1) {
      for (let minute = 0; minute < 60; minute += SLOT_INTERVAL_MINUTES) {
        const slot = new Date(day);
        slot.setHours(hour, minute, 0, 0);

        if (slot <= startBuffer) continue;

        slots.push({
          value: slot.toISOString(),
          label: slot.toLocaleString([], {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          }),
        });
      }
    }
  }

  return slots;
}

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [branches, setBranches] = useState<SelectOption[]>([]);
  const [services, setServices] = useState<ServiceType[]>([]);
  const [pricing, setPricing] = useState<Pricing[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    branchId: searchParams.get('branchId') ?? '',
    registrationNumber: normalizePlate(searchParams.get('reg') ?? ''),
    customerName: searchParams.get('name') ?? '',
    customerPhone: sanitizePhone(searchParams.get('phone') ?? ''),
    customerEmail: searchParams.get('email') ?? '',
    vehicleType: searchParams.get('vehicleType') ?? '',
    servicePackage: searchParams.get('servicePackage') ?? '',
    estimatedPrice: 0,
    appointmentAt: '',
  });

  const appointmentSlots = useMemo(() => generateAppointmentSlots(), []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [branchRes, serviceRes] = await Promise.all([
          fetch(`${API_BASE}/branches`),
          fetch(`${API_BASE}/services`),
        ]);

        if (!branchRes.ok || !serviceRes.ok) {
          throw new Error('Failed to load booking options.');
        }

        setBranches(await branchRes.json());
        setServices(await serviceRes.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load booking page.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const selected = services.find((service) => service.serviceName === formData.servicePackage);
    if (!selected || pricing.length > 0) return;

    const fetchPricing = async () => {
      try {
        const response = await fetch(`${API_BASE}/services/${selected.id}/pricing`);
        if (!response.ok) {
          throw new Error('Pricing could not be loaded for this service.');
        }
        const pricingData = await response.json();
        setPricing(pricingData);

        const preselectedPricing = pricingData.find((item: Pricing) => item.vehicleCategory === formData.vehicleType);
        if (preselectedPricing) {
          setFormData((prev) => ({
            ...prev,
            estimatedPrice: preselectedPricing.price,
          }));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load pricing.');
      }
    };

    fetchPricing();
  }, [formData.servicePackage, formData.vehicleType, pricing.length, services]);

  const selectedBranch = useMemo(
    () => branches.find((branch) => String(branch.id) === formData.branchId),
    [branches, formData.branchId],
  );

  const selectedService = useMemo(
    () => services.find((service) => service.serviceName === formData.servicePackage),
    [formData.servicePackage, services],
  );

  const selectedPricing = useMemo(
    () => pricing.find((item) => item.vehicleCategory === formData.vehicleType),
    [formData.vehicleType, pricing],
  );

  const bookingReady = Boolean(
    formData.branchId &&
      formData.servicePackage &&
      formData.vehicleType &&
      formData.registrationNumber.trim() &&
      formData.customerName.trim() &&
      formData.customerPhone.trim() &&
      formData.customerEmail.trim() &&
      formData.appointmentAt,
  );

  const appointmentText = formData.appointmentAt
    ? new Date(formData.appointmentAt).toLocaleString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : 'Choose an arrival slot';

  const handleServiceChange = async (serviceId: string) => {
    const service = services.find((item) => item.id === Number(serviceId));
    if (!service) return;

    setFormData((prev) => ({
      ...prev,
      servicePackage: service.serviceName,
      vehicleType: '',
      estimatedPrice: 0,
    }));
    setPricing([]);

    try {
      const response = await fetch(`${API_BASE}/services/${serviceId}/pricing`);
      if (!response.ok) {
        throw new Error('Pricing could not be loaded for this service.');
      }
      setPricing(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pricing.');
    }
  };

  const handlePricingChange = (pricingId: string) => {
    const item = pricing.find((entry) => entry.id === Number(pricingId));
    if (!item) return;

    setFormData((prev) => ({
      ...prev,
      vehicleType: item.vehicleCategory,
      estimatedPrice: item.price,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!bookingReady) {
      setError('Please complete all required fields before booking.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          branchId: Number(formData.branchId),
          registrationNumber: formData.registrationNumber.trim(),
          customerName: formData.customerName.trim(),
          customerPhone: formData.customerPhone.trim(),
          customerEmail: formData.customerEmail.trim().toLowerCase(),
          appointmentAt: formData.appointmentAt,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        if (response.status === 409) {
          throw new Error(
            'There is already an active wash session for this vehicle and phone number in the selected branch. Open the customer portal or wait for the current session to finish before booking again.',
          );
        }
        throw new Error(payload.message || 'Booking failed. Please try again.');
      }

      const session = await response.json();
      navigate(`/portal/confirmation/${session.portalToken}`, { state: { session } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '100vh', bgcolor: '#08111c' }}>
        <CircularProgress sx={{ color: '#f0b44c' }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        color: 'white',
        py: { xs: 4, md: 6 },
        background: 'linear-gradient(180deg, #101519 0%, #12181d 100%)',
      }}
    >
      <Container maxWidth="xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Stack direction={{ xs: 'column', xl: 'row' }} spacing={3} alignItems="stretch">
            <Paper sx={heroPanelSx}>
              <Stack spacing={3.5}>
                <Box>
                  <Chip label="Customer Booking" sx={heroChipSx} />
                  <Typography variant="h2" sx={{ mt: 2.5, fontWeight: 900, letterSpacing: -1.6, lineHeight: 1.02 }}>
                    Book a wash session through a clearer, more dependable reservation flow
                  </Typography>
                  <Typography sx={{ mt: 2, maxWidth: 720, color: 'rgba(154,168,176,0.82)', fontSize: '1.02rem' }}>
                    Choose the branch, select the service, reserve an arrival slot, and generate a live portal link for updates, payment, and handoff.
                  </Typography>
                </Box>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} useFlexGap flexWrap="wrap">
                  <Chip icon={<SparkleIcon />} label="Structured booking flow" sx={featureChipSx} />
                  <Chip icon={<SecurityIcon />} label="Portal access included" sx={featureChipSx} />
                  <Chip icon={<TaskAltIcon />} label="Live pricing and scheduling" sx={featureChipSx} />
                </Stack>

                <Paper sx={showcaseCardSx}>
                  <Stack spacing={2.5}>
                    <Typography variant="overline" sx={{ color: '#f0b44c', letterSpacing: 1.8 }}>
                      Booking Highlights
                    </Typography>
                    <Stack spacing={1.5}>
                      <ShowcaseRow title="Arrival planning" description="Choose from the next available half-hour slots over the next five days." />
                      <ShowcaseRow title="Transparent service pricing" description="Vehicle size pricing updates instantly as soon as you select the right category." />
                      <ShowcaseRow title="After-booking control" description="Every booking ends with a professional receipt, live portal link, and printable confirmation." />
                    </Stack>
                  </Stack>
                </Paper>

                <Paper sx={assuranceCardSx}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between">
                    <QuickInfo label="Estimated total" value={`$${formData.estimatedPrice.toFixed(2)}`} accent="#f0b44c" />
                    <QuickInfo label="Arrival slot" value={appointmentText} accent="#66c28a" />
                    <QuickInfo
                      label="Live portal"
                      value={selectedBranch ? `${selectedBranch.label} booking` : 'Included after booking'}
                      accent="#5fb7d4"
                    />
                  </Stack>
                </Paper>
              </Stack>
            </Paper>

            <Paper sx={formPanelSx}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="overline" sx={{ color: '#f0b44c', letterSpacing: 1.6 }}>
                    Booking Details
                  </Typography>
                  <Typography variant="h4" sx={{ mt: 1, fontWeight: 800 }}>
                    Complete the reservation
                  </Typography>
                  <Typography sx={{ mt: 1, color: 'rgba(154,168,176,0.82)' }}>
                    Every field here feeds the session board, receipt, and customer portal automatically.
                  </Typography>
                </Box>

                <form onSubmit={handleSubmit}>
                  <Stack spacing={2.5}>
                    {error && <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>}

                    <TextField
                      select
                      label="Choose branch"
                      required
                      fullWidth
                      value={formData.branchId}
                      onChange={(event) => setFormData((prev) => ({ ...prev, branchId: event.target.value }))}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BranchIcon sx={{ color: '#67e8f9' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={fieldSx}
                    >
                      {branches.map((branch) => (
                        <MenuItem key={branch.id} value={branch.id}>
                          {branch.label}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      select
                      label="Wash package"
                      required
                      fullWidth
                      value={selectedService?.id ?? ''}
                      onChange={(event) => handleServiceChange(event.target.value)}
                      helperText="Choose the service tier that matches the customer experience you want."
                      FormHelperTextProps={{ sx: helperTextSx }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <ServiceIcon sx={{ color: '#67e8f9' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={fieldSx}
                    >
                      {services.map((service) => (
                        <MenuItem key={service.id} value={service.id}>
                          {service.serviceName}
                        </MenuItem>
                      ))}
                    </TextField>

                    {pricing.length > 0 && (
                      <TextField
                        select
                        label="Vehicle category"
                        required
                        fullWidth
                        value={selectedPricing?.id ?? ''}
                        onChange={(event) => handlePricingChange(event.target.value)}
                        helperText="Pricing adapts to the vehicle size selected here."
                        FormHelperTextProps={{ sx: helperTextSx }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CarIcon sx={{ color: '#67e8f9' }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={fieldSx}
                      >
                        {pricing.map((item) => (
                          <MenuItem key={item.id} value={item.id}>
                            {item.vehicleCategory} - ${item.price.toFixed(2)}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}

                    <TextField
                      select
                      label="Arrival time slot"
                      required
                      fullWidth
                      value={formData.appointmentAt}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          appointmentAt: event.target.value,
                        }))
                      }
                      helperText="This is the target arrival window shown on the receipt and portal."
                      FormHelperTextProps={{ sx: helperTextSx }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <ScheduleIcon sx={{ color: '#67e8f9' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={fieldSx}
                    >
                      {appointmentSlots.map((slot) => (
                        <MenuItem key={slot.value} value={slot.value}>
                          {slot.label}
                        </MenuItem>
                      ))}
                    </TextField>

                    <Divider sx={{ borderColor: 'rgba(148,163,184,0.12)' }} />

                    <TextField
                      label="Plate number"
                      required
                      fullWidth
                      placeholder="e.g. GR-1234-23"
                      value={formData.registrationNumber}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          registrationNumber: normalizePlate(event.target.value),
                        }))
                      }
                      helperText="Letters, numbers, spaces, and dashes only."
                      FormHelperTextProps={{ sx: helperTextSx }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <RegIcon sx={{ color: '#67e8f9' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={fieldSx}
                    />

                    <TextField
                      label="Customer name"
                      required
                      fullWidth
                      value={formData.customerName}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          customerName: event.target.value,
                        }))
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon sx={{ color: '#67e8f9' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={fieldSx}
                    />

                    <TextField
                      label="Phone number"
                      required
                      fullWidth
                      value={formData.customerPhone}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          customerPhone: sanitizePhone(event.target.value),
                        }))
                      }
                      helperText="Numbers only, maximum 13 digits, with optional leading +."
                      FormHelperTextProps={{ sx: helperTextSx }}
                      inputProps={{ inputMode: 'tel', pattern: '[0-9+]*', maxLength: 14 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon sx={{ color: '#67e8f9' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={fieldSx}
                    />

                    <TextField
                      label="Email address"
                      type="email"
                      required
                      fullWidth
                      value={formData.customerEmail}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          customerEmail: event.target.value.trimStart(),
                        }))
                      }
                      helperText="Login codes and booking updates are sent to this email."
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
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={submitting || !bookingReady}
                      endIcon={submitting ? <CircularProgress size={20} /> : <ArrowForwardIcon />}
                      sx={primaryButtonSx}
                    >
                      {submitting ? 'Confirming booking...' : `Confirm booking${formData.estimatedPrice ? ` - $${formData.estimatedPrice.toFixed(2)}` : ''}`}
                    </Button>
                  </Stack>
                </form>
              </Stack>
            </Paper>

            <Paper sx={summaryPanelSx}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="overline" sx={{ color: '#f0b44c', letterSpacing: 1.6 }}>
                    Reservation Summary
                  </Typography>
                  <Typography variant="h5" sx={{ mt: 1, fontWeight: 800 }}>
                    Ready for receipt and portal
                  </Typography>
                </Box>

                <SummaryBlock title="Selected branch" value={selectedBranch?.label || 'Choose a branch'} />
                <SummaryBlock title="Wash package" value={selectedService?.serviceName || 'Choose a package'} />
                <SummaryBlock title="Vehicle" value={selectedPricing?.vehicleCategory || 'Choose a category'} />
                <SummaryBlock title="Arrival slot" value={appointmentText} />
                <SummaryBlock title="Plate" value={formData.registrationNumber || 'Add a plate number'} />
                <SummaryBlock title="Customer" value={formData.customerName || 'Add a customer name'} />
                <SummaryBlock title="Email access" value={formData.customerEmail || 'Add an email address'} />

                <Divider sx={{ borderColor: 'rgba(148,163,184,0.12)' }} />

                <Paper sx={priceCardSx}>
                  <Stack spacing={1.5}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography sx={{ color: 'rgba(154,168,176,0.82)' }}>Estimated total</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 900, color: '#f0b44c' }}>
                        ${formData.estimatedPrice.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography sx={{ color: 'rgba(154,168,176,0.82)' }}>Estimated duration</Typography>
                      <Chip
                        icon={<ScheduleIcon />}
                        label={selectedService ? `${selectedService.durationMinutes} min` : 'Select a package'}
                        sx={featureChipSx}
                      />
                    </Box>
                  </Stack>
                </Paper>

                <Alert severity={bookingReady ? 'success' : 'info'} sx={{ borderRadius: 3 }}>
                  {bookingReady
                    ? 'The booking is ready. After submission, the customer lands on a premium confirmation page with receipt actions and a live tracking portal.'
                    : 'Complete the branch, package, vehicle, arrival slot, and contact details to unlock booking.'}
                </Alert>
              </Stack>
            </Paper>
          </Stack>
        </motion.div>
      </Container>
    </Box>
  );
};

function ShowcaseRow({ title, description }: { title: string; description: string }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start">
      <Box sx={{ mt: 0.25, width: 26, height: 26, borderRadius: 999, bgcolor: 'rgba(103,232,249,0.14)', display: 'grid', placeItems: 'center' }}>
        <TaskAltIcon sx={{ color: '#67e8f9', fontSize: 16 }} />
      </Box>
      <Box>
        <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
        <Typography sx={{ color: 'rgba(226,232,240,0.66)' }}>{description}</Typography>
      </Box>
    </Stack>
  );
}

function QuickInfo({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" sx={{ color: 'rgba(154,168,176,0.76)', letterSpacing: 1, fontFamily: '"IBM Plex Mono", monospace' }}>
        {label}
      </Typography>
      <Typography sx={{ mt: 0.5, fontWeight: 800, color: accent }}>{value}</Typography>
    </Box>
  );
}

function SummaryBlock({ title, value }: { title: string; value: string }) {
  return (
    <Box display="flex" justifyContent="space-between" gap={2}>
      <Typography sx={{ color: 'rgba(148,163,184,0.82)' }}>{title}</Typography>
      <Typography sx={{ textAlign: 'right', fontWeight: 700 }}>{value}</Typography>
    </Box>
  );
}

const heroPanelSx = {
  flex: 1.25,
  p: { xs: 3, md: 4.5 },
  borderRadius: 4,
  bgcolor: 'rgba(23,29,34,0.98)',
  border: '1px solid rgba(154,168,176,0.14)',
  boxShadow: '0 16px 34px rgba(0, 0, 0, 0.2)',
};

const formPanelSx = {
  flex: 0.95,
  p: { xs: 3, md: 4 },
  borderRadius: 4,
  bgcolor: 'rgba(23,29,34,0.98)',
  border: '1px solid rgba(154,168,176,0.14)',
  boxShadow: '0 16px 34px rgba(0, 0, 0, 0.18)',
};

const summaryPanelSx = {
  flex: 0.8,
  p: { xs: 3, md: 4 },
  borderRadius: 4,
  bgcolor: 'rgba(20,25,30,0.98)',
  border: '1px solid rgba(154,168,176,0.12)',
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

const showcaseCardSx = {
  p: 3,
  borderRadius: 3,
  bgcolor: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(148,163,184,0.12)',
};

const assuranceCardSx = {
  p: 2.5,
  borderRadius: 3,
  bgcolor: 'rgba(18,24,29,0.96)',
  border: '1px solid rgba(154,168,176,0.12)',
};

const priceCardSx = {
  p: 2.5,
  borderRadius: 3,
  bgcolor: 'rgba(240,180,76,0.08)',
  border: '1px solid rgba(240,180,76,0.18)',
};

const helperTextSx = { color: 'rgba(154,168,176,0.76)' };

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2.5,
    color: '#eef2f4',
    bgcolor: '#13191e',
    '& fieldset': { borderColor: 'rgba(154,168,176,0.18)' },
    '&:hover fieldset': { borderColor: 'rgba(154,168,176,0.34)' },
    '&.Mui-focused fieldset': { borderColor: '#f0b44c' },
  },
  '& .MuiInputLabel-root': { color: 'rgba(154,168,176,0.78)' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#f0b44c' },
};

const primaryButtonSx = {
  py: 1.9,
  borderRadius: 2.5,
  bgcolor: '#f0b44c',
  color: '#1b1f22',
  fontWeight: 900,
  fontSize: '1rem',
  boxShadow: 'none',
  '&:hover': { bgcolor: '#f5cb7f' },
  '&.Mui-disabled': {
    bgcolor: 'rgba(240,180,76,0.28)',
    color: 'rgba(27,31,34,0.7)',
  },
};

export default BookingPage;
