import { useEffect, useState } from 'react';
import {
    Box,
    Card,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Chip,
    Grid2,
    Switch,
    FormControlLabel
} from '@mui/material';
import { Add, Delete, Edit, Settings } from '@mui/icons-material';
import { servicesApi } from '../api/admin';
import { ServiceType, Pricing } from '../types';

interface Props {
    showSnackbar: (message: string, severity: 'success' | 'error') => void;
}

export function ServicesTab({ showSnackbar }: Props) {
    const [services, setServices] = useState<ServiceType[]>([]);
    const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
    const [pricing, setPricing] = useState<Pricing[]>([]);
    const [loading, setLoading] = useState(false);

    // Dialogs
    const [serviceDialog, setServiceDialog] = useState(false);
    const [pricingDialog, setPricingDialog] = useState(false);

    // Forms
    const [serviceForm, setServiceForm] = useState<Partial<ServiceType>>({
        serviceName: '',
        description: '',
        basePrice: 0,
        durationMinutes: 30,
        category: 'WASH',
        isFeatured: false
    });

    const [pricingForm, setPricingForm] = useState<Partial<Pricing>>({
        vehicleCategory: 'SUV',
        price: 0,
        discountPercentage: 0
    });

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            const data = await servicesApi.getAll(false);
            setServices(data);
        } catch (error) {
            showSnackbar('Failed to load services', 'error');
        }
    };

    const loadPricing = async (serviceId: number) => {
        try {
            const data = await servicesApi.getPricing(serviceId);
            setPricing(data);
        } catch (error) {
            showSnackbar('Failed to load pricing table', 'error');
        }
    };

    const handleSelectService = (service: ServiceType) => {
        setSelectedService(service);
        loadPricing(service.id);
    };

    const handleSaveService = async () => {
        if (!serviceForm.serviceName || serviceForm.basePrice === undefined) {
            showSnackbar('Please fill all required fields', 'error');
            return;
        }
        try {
            if (serviceForm.id) {
                await servicesApi.update(serviceForm.id, serviceForm);
                showSnackbar('Service updated', 'success');
            } else {
                await servicesApi.create(serviceForm);
                showSnackbar('Service created', 'success');
            }
            setServiceDialog(false);
            loadServices();
        } catch (error) {
            showSnackbar('Failed to save service', 'error');
        }
    };

    const handleDeleteService = async (id: number) => {
        if (!confirm('Are you sure you want to deactivate this service?')) return;
        try {
            await servicesApi.delete(id);
            showSnackbar('Service deactivated', 'success');
            loadServices();
            if (selectedService?.id === id) {
                setSelectedService(null);
                setPricing([]);
            }
        } catch (error) {
            showSnackbar('Failed to delete service', 'error');
        }
    };

    const handleSavePricing = async () => {
        if (!selectedService) return;
        try {
            if (pricingForm.id) {
                await servicesApi.updatePricing(pricingForm.id, pricingForm);
                showSnackbar('Pricing updated', 'success');
            } else {
                await servicesApi.createPricing({ ...pricingForm, serviceTypeId: selectedService.id });
                showSnackbar('Pricing created', 'success');
            }
            setPricingDialog(false);
            loadPricing(selectedService.id);
        } catch (error) {
            showSnackbar('Failed to save pricing', 'error');
        }
    };

    const handleDeletePricing = async (id: number) => {
        if (!confirm('Are you sure you want to deactivate this pricing rule?')) return;
        try {
            await servicesApi.deletePricing(id);
            showSnackbar('Pricing deactivated', 'success');
            if (selectedService) loadPricing(selectedService.id);
        } catch (error) {
            showSnackbar('Failed to delete pricing', 'error');
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Services & Pricing Matrix</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => {
                    setServiceForm({ serviceName: '', description: '', basePrice: 0, durationMinutes: 30, category: 'WASH', isFeatured: false });
                    setServiceDialog(true);
                }}>
                    New Service
                </Button>
            </Box>

            <Grid2 container spacing={3}>
                {/* Services List */}
                <Grid2 size={{ xs: 12, md: 5 }}>
                    <Card>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Service</TableCell>
                                        <TableCell align="right">Base Price</TableCell>
                                        <TableCell align="center">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {services.map((service) => (
                                        <TableRow 
                                            key={service.id} 
                                            hover 
                                            onClick={() => handleSelectService(service)}
                                            sx={{ 
                                                cursor: 'pointer',
                                                bgcolor: selectedService?.id === service.id ? 'action.selected' : 'inherit'
                                            }}
                                        >
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="bold">{service.serviceName}</Typography>
                                                <Typography variant="caption" color="text.secondary">{service.category}</Typography>
                                                {!service.active && <Chip size="small" label="Inactive" color="error" sx={{ ml: 1, height: 16, fontSize: '0.6rem' }} />}
                                            </TableCell>
                                            <TableCell align="right">${service.basePrice.toFixed(2)}</TableCell>
                                            <TableCell align="center">
                                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); setServiceForm(service); setServiceDialog(true); }}>
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDeleteService(service.id); }}>
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Card>
                </Grid2>

                {/* Pricing Matrix for Selected Service */}
                <Grid2 size={{ xs: 12, md: 7 }}>
                    {selectedService ? (
                        <Card>
                            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    {selectedService.serviceName} Pricing Matrix
                                </Typography>
                                <Button size="small" variant="outlined" startIcon={<Add />} onClick={() => {
                                    setPricingForm({ vehicleCategory: 'SUV', price: selectedService.basePrice, discountPercentage: 0 });
                                    setPricingDialog(true);
                                }}>
                                    Add Vehicle Price
                                </Button>
                            </Box>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Vehicle Type</TableCell>
                                            <TableCell align="right">Final Price</TableCell>
                                            <TableCell align="right">Discount (%)</TableCell>
                                            <TableCell align="center">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {pricing.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                                    No specific vehicle pricing configured. <br/> Will use Base Price (${selectedService.basePrice})
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            pricing.map((p) => (
                                                <TableRow key={p.id} sx={{ opacity: p.active ? 1 : 0.5 }}>
                                                    <TableCell>
                                                        <Chip label={p.vehicleCategory} size="small" />
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>${p.price.toFixed(2)}</TableCell>
                                                    <TableCell align="right">{p.discountPercentage || 0}%</TableCell>
                                                    <TableCell align="center">
                                                        <IconButton size="small" onClick={() => { setPricingForm(p); setPricingDialog(true); }}>
                                                            <Edit fontSize="small" />
                                                        </IconButton>
                                                        <IconButton size="small" onClick={() => handleDeletePricing(p.id)}>
                                                            <Delete fontSize="small" />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Card>
                    ) : (
                        <Card sx={{ height: '100%', minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography color="text.secondary">Select a service to manage its pricing matrix</Typography>
                        </Card>
                    )}
                </Grid2>
            </Grid2>

            {/* Service Dialog */}
            <Dialog open={serviceDialog} onClose={() => setServiceDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{serviceForm.id ? 'Edit Service' : 'New Service'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Service Name"
                            value={serviceForm.serviceName}
                            onChange={(e) => setServiceForm({ ...serviceForm, serviceName: e.target.value })}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Description"
                            value={serviceForm.description}
                            onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                            fullWidth
                            multiline
                            rows={2}
                        />
                        <Grid2 container spacing={2}>
                            <Grid2 size={{ xs: 6 }}>
                                <TextField
                                    label="Base Price (\$)"
                                    type="number"
                                    value={serviceForm.basePrice}
                                    onChange={(e) => setServiceForm({ ...serviceForm, basePrice: parseFloat(e.target.value) })}
                                    fullWidth
                                    required
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 6 }}>
                                <TextField
                                    label="Duration (mins)"
                                    type="number"
                                    value={serviceForm.durationMinutes}
                                    onChange={(e) => setServiceForm({ ...serviceForm, durationMinutes: parseInt(e.target.value, 10) })}
                                    fullWidth
                                />
                            </Grid2>
                        </Grid2>
                        <FormControl fullWidth>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={serviceForm.category || 'WASH'}
                                label="Category"
                                onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                            >
                                <MenuItem value="WASH">WASH</MenuItem>
                                <MenuItem value="INTERIOR">INTERIOR & DETAILING</MenuItem>
                                <MenuItem value="INSPECTION">INSPECTION</MenuItem>
                                <MenuItem value="ADDON">ADD-ON</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControlLabel
                            control={<Switch checked={serviceForm.isFeatured || false} onChange={(e) => setServiceForm({ ...serviceForm, isFeatured: e.target.checked })} />}
                            label="Featured Service (highlight in new session form)"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setServiceDialog(false)}>Cancel</Button>
                    <Button onClick={handleSaveService} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            {/* Pricing Dialog */}
            <Dialog open={pricingDialog} onClose={() => setPricingDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{pricingForm.id ? 'Edit Pricing' : 'Add Vehicle Pricing'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {!pricingForm.id && (
                            <FormControl fullWidth>
                                <InputLabel>Vehicle Type</InputLabel>
                                <Select
                                    value={pricingForm.vehicleCategory || 'SUV'}
                                    label="Vehicle Type"
                                    onChange={(e) => setPricingForm({ ...pricingForm, vehicleCategory: e.target.value })}
                                >
                                    <MenuItem value="SEDAN">SEDAN / HATCHBACK</MenuItem>
                                    <MenuItem value="SUV">SUV / CROSSOVER</MenuItem>
                                    <MenuItem value="TRUCK">TRUCK</MenuItem>
                                    <MenuItem value="VAN">VAN / MINIVAN</MenuItem>
                                </Select>
                            </FormControl>
                        )}
                        <TextField
                            label="Price (\$)"
                            type="number"
                            value={pricingForm.price}
                            onChange={(e) => setPricingForm({ ...pricingForm, price: parseFloat(e.target.value) })}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Discount Percentage (%)"
                            type="number"
                            value={pricingForm.discountPercentage}
                            onChange={(e) => setPricingForm({ ...pricingForm, discountPercentage: parseFloat(e.target.value) })}
                            fullWidth
                            helperText="Optional auto-discount for analytics"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPricingDialog(false)}>Cancel</Button>
                    <Button onClick={handleSavePricing} variant="contained">Save Pricing</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
