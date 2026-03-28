import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
    Chip,
    TextField,
    InputAdornment
} from '@mui/material';
import { Search as SearchIcon, Person as PersonIcon, Star as StarIcon } from '@mui/icons-material';
import { Customer } from '../types';
import { customerApi } from '../api/admin';

const CustomersTab: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const data = await customerApi.getAll();
            setCustomers(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch customers');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const filteredCustomers = customers.filter(c => 
        c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.phone.includes(searchQuery)
    );

    if (loading) return <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>;

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight="bold">Customer CRM & Loyalty</Typography>
                <TextField
                    size="small"
                    placeholder="Search by name or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ width: 300 }}
                />
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                        <TableRow>
                            <TableCell>Customer</TableCell>
                            <TableCell>Contact</TableCell>
                            <TableCell align="center">Total Visits</TableCell>
                            <TableCell align="center">Loyalty Points</TableCell>
                            <TableCell>Last Vehicle</TableCell>
                            <TableCell>Customer Since</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredCustomers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                                    <Typography color="text.secondary">No customers found</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCustomers.map((customer) => (
                                <TableRow key={customer.id} hover>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={1.5}>
                                            <Box
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    bgcolor: 'primary.light',
                                                    color: 'white'
                                                }}
                                            >
                                                <PersonIcon />
                                            </Box>
                                            <Typography fontWeight="500">{customer.fullName}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{customer.phone}</Typography>
                                        {customer.email && <Typography variant="caption" color="text.secondary">{customer.email}</Typography>}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip label={customer.totalVisits} size="small" variant="outlined" />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box display="flex" alignItems="center" justifyContent="center" gap={0.5} color="warning.main">
                                            <StarIcon fontSize="small" />
                                            <Typography variant="body2" fontWeight="bold">{customer.loyaltyPoints}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                            {customer.lastVehicleRegistration || 'N/A'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(customer.createdAt).toLocaleDateString()}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default CustomersTab;
