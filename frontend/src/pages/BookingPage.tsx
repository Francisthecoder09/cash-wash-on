import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert,
  alpha,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  FormControlLabel,
  Grid2,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  CalendarMonth,
  AutoAwesome,
  DirectionsCar,
  Email,
  LocalOffer,
  Person,
  PhoneIphone,
  Store,
  TaskAlt,
} from '@mui/icons-material';
import { Pricing, SelectOption, ServiceType } from '../types';
import { CustomerSessionTimeoutGuard } from '../components/customer/CustomerSessionTimeoutGuard';
import { CustomerContactStrip } from '../components/customer/CustomerContactStrip';
import { calculateAddOnTotal, getRecommendedAddOnNames, isKnownAddOn } from '../utils/addOns';
import { formatCurrency } from '../utils/currency';
import { customerSelectMenuProps } from '../utils/customerUi';
import { resizeVehicleImage } from '../utils/imageUpload';
import { API_ORIGIN } from '../utils/constants';
import { getBookingRecommendations, getRecommendationToneColor } from '../utils/recommendations';

const API_BASE = `${API_ORIGIN}/api/portal/sessions`;
const heroImage = '/olav-tvedt-6lSBynPRaAQ-unsplash.jpg';
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
  const [addOnOptions, setAddOnOptions] = useState<ServiceType[]>([]);
  const [pricing, setPricing] = useState<Pricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    branchId: string;
    registrationNumber: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    vehicleType: string;
    vehicleImageUrl: string;
    servicePackage: string;
    addOnServices: string[];
    estimatedPrice: number;
    appointmentAt: string;
  }>({
    branchId: searchParams.get('branchId') ?? '',
    registrationNumber: normalizePlate(searchParams.get('reg') ?? ''),
    customerName: searchParams.get('name') ?? '',
    customerPhone: sanitizePhone(searchParams.get('phone') ?? ''),
    customerEmail: searchParams.get('email') ?? '',
    vehicleType: searchParams.get('vehicleType') ?? '',
    vehicleImageUrl: '',
    servicePackage: searchParams.get('servicePackage') ?? '',
    addOnServices: [],
    estimatedPrice: 45,
    appointmentAt: '',
  });

  const appointmentSlots = useMemo(() => generateAppointmentSlots(), []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const branchIdParam = searchParams.get('branchId');
        const addOnUrl = branchIdParam ? `${API_BASE}/add-ons?branchId=${branchIdParam}` : `${API_BASE}/add-ons`;
        const [branchRes, serviceRes, addOnRes] = await Promise.all([
          fetch(`${API_BASE}/branches`),
          fetch(`${API_BASE}/services`),
          fetch(addOnUrl),
        ]);

        if (!branchRes.ok || !serviceRes.ok || !addOnRes.ok) {
          throw new Error('Failed to load booking options.');
        }

        setBranches(await branchRes.json());
        setServices(await serviceRes.json());
        const addOns: ServiceType[] = await addOnRes.json();
        setAddOnOptions(addOns);
        setFormData((prev) => ({
          ...prev,
          addOnServices: searchParams.getAll('addOn').filter((addOn) => isKnownAddOn(addOn, addOns)),
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load booking page.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  useEffect(() => {
    if (!formData.branchId) {
      return;
    }

    fetch(`${API_BASE}/add-ons?branchId=${formData.branchId}`)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Failed to load add-ons for this branch.')))
      .then((data: ServiceType[]) => {
        setAddOnOptions(data);
        setFormData((prev) => ({
          ...prev,
          addOnServices: prev.addOnServices.filter((addOn) => isKnownAddOn(addOn, data)),
        }));
      })
      .catch((err: Error) => setError(err.message));
  }, [formData.branchId]);

  useEffect(() => {
    const selected = services.find((service) => service.serviceName === formData.servicePackage);
    if (!selected || pricing.length > 0) return;

    fetch(`${API_BASE}/services/${selected.id}/pricing`)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Pricing could not be loaded for this service.')))
      .then((data: Pricing[]) => {
        setPricing(data);
        if (data.length === 0) {
          setFormData((prev) => ({
            ...prev,
            estimatedPrice: selected.basePrice,
          }));
          return;
        }
        const preselected = data.find((item) => item.vehicleCategory === formData.vehicleType);
        if (preselected) {
          setFormData((prev) => ({ ...prev, estimatedPrice: preselected.price }));
        }
      })
      .catch((err: Error) => setError(err.message));
  }, [formData.servicePackage, formData.vehicleType, pricing.length, services]);

  const selectedBranch = branches.find((branch) => String(branch.id) === formData.branchId);
  const selectedService = services.find((service) => service.serviceName === formData.servicePackage);
  const selectedPricing = pricing.find((item) => item.vehicleCategory === formData.vehicleType);
  const addOnTotal = useMemo(() => calculateAddOnTotal(formData.addOnServices, addOnOptions), [addOnOptions, formData.addOnServices]);
  const grandTotal = formData.estimatedPrice + addOnTotal;
  const recommendedAddOnNames = useMemo(
    () => getRecommendedAddOnNames(formData.vehicleType, formData.servicePackage, addOnOptions),
    [addOnOptions, formData.servicePackage, formData.vehicleType],
  );
  const bookingRecommendations = useMemo(
    () =>
      getBookingRecommendations({
        branchLabel: selectedBranch?.label,
        servicePackage: formData.servicePackage,
        vehicleType: formData.vehicleType,
        appointmentAt: formData.appointmentAt,
        recommendedAddOnNames,
        selectedAddOnServices: formData.addOnServices,
      }),
    [
      formData.addOnServices,
      formData.appointmentAt,
      formData.servicePackage,
      formData.vehicleType,
      recommendedAddOnNames,
      selectedBranch?.label,
    ],
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

  const handleServiceChange = async (serviceId: string) => {
    const service = services.find((item) => item.id === Number(serviceId));
    if (!service) return;

    setFormData((prev) => ({
      ...prev,
      servicePackage: service.serviceName,
      vehicleType: '',
      estimatedPrice: service.basePrice,
    }));
    setPricing([]);

    try {
      const response = await fetch(`${API_BASE}/services/${serviceId}/pricing`);
      if (!response.ok) throw new Error('Pricing could not be loaded for this service.');
      const data: Pricing[] = await response.json();
      setPricing(data);
      if (data.length === 0) {
        setFormData((prev) => ({
          ...prev,
          estimatedPrice: service.basePrice,
        }));
      }
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

  const handleVehiclePhotoChange = async (file: File | null) => {
    if (!file) {
      setFormData((prev) => ({ ...prev, vehicleImageUrl: '' }));
      return;
    }

    try {
      const image = await resizeVehicleImage(file);
      setFormData((prev) => ({ ...prev, vehicleImageUrl: image }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not prepare vehicle image.');
    }
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
          addOnServices: formData.addOnServices,
          branchId: Number(formData.branchId),
          registrationNumber: formData.registrationNumber.trim(),
          customerName: formData.customerName.trim(),
          customerPhone: formData.customerPhone.trim(),
          customerEmail: formData.customerEmail.trim().toLowerCase(),
          vehicleImageUrl: formData.vehicleImageUrl || null,
          estimatedPrice: grandTotal,
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
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: 'background.default' }}>
        <CircularProgress sx={{ color: '#e36b2c' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      <CustomerSessionTimeoutGuard />
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
            backgroundImage: `linear-gradient(90deg, rgba(20,17,15,0.28) 0%, rgba(20,17,15,0.18) 42%, rgba(20,17,15,0.05) 100%), url("${heroImage}")`,
            backgroundSize: 'cover',
            backgroundPosition: { xs: 'center 34%', md: 'center 30%' },
            filter: 'saturate(1.03) contrast(1.03)',
          }}
        />
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: { xs: 4, md: 6 } }}>
          <Stack spacing={5}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <Box sx={{ width: 42, height: 42, borderRadius: '50%', bgcolor: '#e36b2c', display: 'grid', placeItems: 'center', color: 'white', fontWeight: 800 }}>
                  S
                </Box>
                <Box>
                  <Typography sx={{ color: '#fff8f1', fontWeight: 700, fontSize: '1.1rem' }}>Spark Wash Booking</Typography>
                  <Typography sx={{ color: 'rgba(255,244,233,0.7)', fontSize: '0.92rem' }}>Customer reservation page</Typography>
                </Box>
              </Stack>
              <Chip label="Book your wash" sx={heroChipSx} />
            </Stack>

            <Grid2 container spacing={4} alignItems="center">
              <Grid2 size={{ xs: 12, lg: 7 }}>
                <Stack spacing={2.5}>
                  <Chip label="Car Wash Delivery" sx={heroTagSx} />
                  <Typography variant="h1" sx={{ color: '#fff8f1', maxWidth: 760, lineHeight: 0.95, fontSize: { xs: '2.75rem', md: undefined } }}>
                    Premium car wash booking, styled like the site your customer expects
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,244,233,0.84)', maxWidth: 620, fontSize: { xs: '1rem', md: '1.04rem' }, lineHeight: 1.7 }}>
                    Pick the branch, choose the service, lock in an arrival slot, and generate a live customer portal link for the rest of the journey.
                  </Typography>
                  <Grid2 container spacing={2}>
                    {[
                      { title: 'Sedan', price: 'GHS 45', note: 'Starting price' },
                      { title: 'SUV', price: 'GHS 45', note: 'Starting price' },
                      { title: 'Truck / Van', price: 'GHS 45', note: 'Starting price' },
                    ].map((card) => (
                      <Grid2 key={card.title} size={{ xs: 12, sm: 4 }}>
                        <Paper sx={heroPriceCardSx}>
                          <Typography sx={{ color: '#fff8f1', fontWeight: 700 }}>{card.title}</Typography>
                          <Typography sx={{ mt: 1, color: '#fff8f1', fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>
                            {card.price}
                          </Typography>
                          <Typography sx={{ mt: 0.8, color: 'rgba(255,244,233,0.68)' }}>{card.note}</Typography>
                        </Paper>
                      </Grid2>
                    ))}
                  </Grid2>
                </Stack>
              </Grid2>

              <Grid2 size={{ xs: 12, lg: 5 }}>
                <Stack spacing={2}>
                  <Paper sx={summaryCardSx}>
                    <Stack spacing={2}>
                      <Typography sx={{ fontWeight: 700, fontSize: '1.12rem' }}>Booking summary</Typography>
                      <SummaryRow label="Branch" value={selectedBranch?.label || 'Choose a branch'} />
                      <SummaryRow label="Service" value={formData.servicePackage || 'Choose a package'} />
                      <SummaryRow label="Vehicle" value={formData.vehicleType || 'Choose a size'} />
                      <SummaryRow label="Arrival" value={formData.appointmentAt ? new Date(formData.appointmentAt).toLocaleString() : 'Choose a slot'} />
                      <SummaryRow label="Add-ons" value={formData.addOnServices.length ? `${formData.addOnServices.length} selected` : 'None selected'} />
                      <SummaryRow label="Estimated total" value={formatCurrency(grandTotal)} emphasize />
                    </Stack>
                  </Paper>
                  {!!bookingRecommendations.length && (
                    <Paper sx={summaryCardSx}>
                      <Stack spacing={1.4}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <AutoAwesome sx={{ color: '#f3b45c', fontSize: 19 }} />
                          <Typography sx={{ fontWeight: 700, fontSize: '1.02rem' }}>Booking recommendations</Typography>
                        </Stack>
                        {bookingRecommendations.map((item) => {
                          const tone = getRecommendationToneColor(item.tone);
                          return (
                            <Box
                              key={item.title}
                              sx={{
                                p: 1.5,
                                borderRadius: 3,
                                border: `1px solid ${tone.border}`,
                                bgcolor: tone.bg,
                              }}
                            >
                              <Typography sx={{ fontWeight: 700, color: tone.text, mb: 0.5 }}>
                                {item.title}
                              </Typography>
                              <Typography sx={{ color: tone.body, lineHeight: 1.6, fontSize: '0.92rem' }}>
                                {item.body}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Stack>
                    </Paper>
                  )}
                </Stack>
              </Grid2>
            </Grid2>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: { xs: 5, md: 7 } }}>
        <Grid2 container spacing={4}>
          <Grid2 size={{ xs: 12, lg: 7 }}>
            <Paper sx={sectionCardSx}>
              <form onSubmit={handleSubmit}>
                <Stack spacing={2.5}>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    Complete your reservation
                  </Typography>
                  <Typography sx={{ color: 'text.secondary' }}>
                    Every detail here feeds the staff session board, the customer portal, and the booking receipt automatically.
                  </Typography>

                  {error && <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>}

                  <TextField
                    select
                    label="Choose branch"
                    value={formData.branchId}
                    onChange={(event) => setFormData((prev) => ({ ...prev, branchId: event.target.value }))}
                    SelectProps={{ MenuProps: customerSelectMenuProps }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Store sx={{ color: '#e36b2c' }} /></InputAdornment> }}
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
                    value={selectedService?.id ?? ''}
                    onChange={(event) => handleServiceChange(event.target.value)}
                    SelectProps={{ MenuProps: customerSelectMenuProps }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><LocalOffer sx={{ color: '#e36b2c' }} /></InputAdornment> }}
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
                      value={selectedPricing?.id ?? ''}
                      onChange={(event) => handlePricingChange(event.target.value)}
                      SelectProps={{ MenuProps: customerSelectMenuProps }}
                      InputProps={{ startAdornment: <InputAdornment position="start"><DirectionsCar sx={{ color: '#e36b2c' }} /></InputAdornment> }}
                      sx={fieldSx}
                    >
                      {pricing.map((item) => (
                        <MenuItem key={item.id} value={item.id}>
                          {item.vehicleCategory} - {formatCurrency(item.price)}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}

                  <TextField
                    select
                    label="Arrival time slot"
                    value={formData.appointmentAt}
                    onChange={(event) => setFormData((prev) => ({ ...prev, appointmentAt: event.target.value }))}
                    SelectProps={{ MenuProps: customerSelectMenuProps }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><CalendarMonth sx={{ color: '#e36b2c' }} /></InputAdornment> }}
                    sx={fieldSx}
                  >
                    {appointmentSlots.map((slot) => (
                      <MenuItem key={slot.value} value={slot.value}>
                        {slot.label}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    label="Plate number"
                    value={formData.registrationNumber}
                    onChange={(event) => setFormData((prev) => ({ ...prev, registrationNumber: normalizePlate(event.target.value) }))}
                    InputProps={{ startAdornment: <InputAdornment position="start"><DirectionsCar sx={{ color: '#e36b2c' }} /></InputAdornment> }}
                    sx={fieldSx}
                  />

                  <Grid2 container spacing={2}>
                    <Grid2 size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Customer name"
                        value={formData.customerName}
                        onChange={(event) => setFormData((prev) => ({ ...prev, customerName: event.target.value.trimStart() }))}
                        InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ color: '#e36b2c' }} /></InputAdornment> }}
                        sx={fieldSx}
                      />
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Phone number"
                        value={formData.customerPhone}
                        onChange={(event) => setFormData((prev) => ({ ...prev, customerPhone: sanitizePhone(event.target.value) }))}
                        inputProps={{ inputMode: 'tel', pattern: '[0-9+]*', maxLength: 14 }}
                        InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIphone sx={{ color: '#e36b2c' }} /></InputAdornment> }}
                        sx={fieldSx}
                      />
                    </Grid2>
                  </Grid2>

                  <TextField
                    label="Email address"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(event) => setFormData((prev) => ({ ...prev, customerEmail: event.target.value.trimStart() }))}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: '#e36b2c' }} /></InputAdornment> }}
                    sx={fieldSx}
                  />

                  <Button component="label" variant="outlined" sx={secondaryButtonSx}>
                    {formData.vehicleImageUrl ? 'Replace vehicle photo' : 'Add vehicle photo'}
                    <input hidden type="file" accept="image/*" capture="environment" onChange={(event) => void handleVehiclePhotoChange(event.target.files?.[0] ?? null)} />
                  </Button>

                  {formData.vehicleImageUrl && (
                    <Box
                      component="img"
                      src={formData.vehicleImageUrl}
                      alt="Vehicle preview"
                      sx={{ width: '100%', maxWidth: 340, borderRadius: 4, border: '1px solid rgba(88,66,50,0.12)' }}
                    />
                  )}

                  <Button type="submit" variant="contained" disabled={submitting || !bookingReady} endIcon={submitting ? <CircularProgress size={18} /> : <TaskAlt />} sx={ctaButtonSx}>
                    {submitting ? 'Booking...' : 'Confirm booking'}
                  </Button>
                </Stack>
              </form>
            </Paper>
          </Grid2>

          <Grid2 size={{ xs: 12, lg: 5 }}>
            <Stack spacing={3}>
              <Paper sx={sectionCardSx}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  What happens next
                </Typography>
                <Stack spacing={1.5}>
                  {[
                    'The booking appears on the session board for the selected branch.',
                    'A live customer portal link is created automatically.',
                    'The customer can later sign in, track progress, and complete payment.',
                  ].map((item) => (
                    <Stack key={item} direction="row" spacing={1.25} alignItems="flex-start">
                      <Box sx={{ mt: 0.2, width: 28, height: 28, borderRadius: '50%', bgcolor: 'rgba(227,107,44,0.1)', display: 'grid', placeItems: 'center' }}>
                        <TaskAlt sx={{ color: '#e36b2c', fontSize: 18 }} />
                      </Box>
                      <Typography sx={{ color: 'text.primary' }}>{item}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Paper>

              <Paper sx={sectionCardSx}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  Add-on services
                </Typography>
                <Stack spacing={1.5}>
                  <Grid2 container spacing={1.5}>
                    {addOnOptions.map((item) => (
                      <Grid2 key={item.id} size={{ xs: 12, sm: 6 }}>
                        <Paper sx={extraCardSx}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={formData.addOnServices.includes(item.serviceName)}
                                onChange={(event) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    addOnServices: event.target.checked
                                      ? [...prev.addOnServices, item.serviceName]
                                      : prev.addOnServices.filter((entry) => entry !== item.serviceName),
                                  }))
                                }
                                sx={{ color: '#e36b2c', '&.Mui-checked': { color: '#e36b2c' } }}
                              />
                            }
                            label={
                              <Box>
                                <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                                  <Typography sx={{ fontWeight: 700 }}>
                                    {item.serviceName} - {formatCurrency(item.basePrice)}
                                  </Typography>
                                  {recommendedAddOnNames.includes(item.serviceName) && (
                                    <Chip
                                      icon={<AutoAwesome sx={{ fontSize: 14 }} />}
                                      label="Recommended"
                                      size="small"
                                      sx={{ bgcolor: 'rgba(227,107,44,0.1)', color: '#e36b2c', fontWeight: 700 }}
                                    />
                                  )}
                                </Stack>
                                <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                                  {item.description || 'Optional extra service for this wash.'}
                                </Typography>
                                <Typography sx={{ color: 'text.secondary', fontSize: '0.82rem', mt: 0.5 }}>
                                  Duration: {item.durationMinutes} mins
                                </Typography>
                              </Box>
                            }
                            sx={{ m: 0, alignItems: 'flex-start' }}
                          />
                        </Paper>
                      </Grid2>
                    ))}
                  </Grid2>
                  {addOnOptions.length === 0 && (
                    <Typography sx={{ color: 'text.secondary' }}>
                      No admin add-on services are active yet. Add services with category `ADDON` in admin to show them here.
                    </Typography>
                  )}
                  <SummaryRow label="Add-on total" value={formatCurrency(addOnTotal)} emphasize={addOnTotal > 0} />
                </Stack>
              </Paper>
            </Stack>
          </Grid2>
        </Grid2>
      </Container>

      <CustomerContactStrip />
    </Box>
  );
};

function SummaryRow({ label, value, emphasize = false }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <Box display="flex" justifyContent="space-between" gap={2}>
      <Typography sx={{ color: 'text.secondary' }}>{label}</Typography>
      <Typography sx={{ fontWeight: emphasize ? 800 : 700, color: 'text.primary', textAlign: 'right' }}>{value}</Typography>
    </Box>
  );
}

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

const heroPriceCardSx = {
  p: 2,
  borderRadius: 4,
  bgcolor: 'rgba(255,248,241,0.08)',
  border: '1px solid rgba(255,248,241,0.18)',
  boxShadow: '0 16px 30px rgba(8, 6, 5, 0.1)',
  backdropFilter: 'blur(10px)',
};

const summaryCardSx = {
  p: 3,
  borderRadius: 5,
  bgcolor: 'rgba(255,247,240,0.08)',
  border: '1px solid rgba(255,248,241,0.18)',
  boxShadow: '0 20px 40px rgba(8, 6, 5, 0.12)',
  backdropFilter: 'blur(11px)',
};

const sectionCardSx = {
  p: 3,
  borderRadius: 4,
  bgcolor: 'rgba(255,247,240,0.05)',
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

const extraCardSx = {
  p: 1.5,
  borderRadius: 3,
  bgcolor: 'rgba(227,107,44,0.06)',
  border: '1px solid rgba(255,243,232,0.08)',
  boxShadow: 'none',
};

export default BookingPage;
