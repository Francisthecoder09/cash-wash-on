import { useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Tabs,
    Tab,
    TextField,
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
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Snackbar,
    Alert,
    Chip,
    SelectChangeEvent,
    Grid2,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { Add, Delete, Edit, Store, DirectionsCar, People, Speed } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Branch, Lane, User, Staff, Role, AdminDashboard, CreateBranchRequest, CreateLaneRequest, CreateUserRequest, CreateStaffRequest } from '../types';
import { branchApi, laneApi, userApi, staffApi, dashboardApi } from '../api/admin';
import { ServicesTab } from './ServicesTab';
import CustomersTab from './CustomersTab';
import { PremiumScene } from '../components/layout/PremiumScene';
import { formatCurrency } from '../utils/currency';
import { getAdminRecommendations, getRecommendationToneColor } from '../utils/recommendations';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ p: { xs: 1.5, md: 3 } }}>{children}</Box>}
        </div>
    );
}

const ROLES: Role[] = ['ADMIN', 'BRANCH_MANAGER', 'CASHIER', 'LANE_OPERATOR', 'INSPECTOR', 'AUDITOR'];

export function AdminPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [tab, setTab] = useState(0);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [lanes, setLanes] = useState<Lane[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
    const [loading, setLoading] = useState(false);
    
    // Branch Level Metrics
    const [selectedDashboardBranch, setSelectedDashboardBranch] = useState<number>(0);
    const [branchMetrics, setBranchMetrics] = useState<{
        todayRevenue: number;
        activeSessions: number;
        statusBreakdown: Record<string, number>;
        servicesBreakdown: Record<string, number>;
    } | null>(null);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

    // Dialog states
    const [branchDialog, setBranchDialog] = useState<{ open: boolean; branch?: Branch }>({ open: false });
    const [laneDialog, setLaneDialog] = useState<{ open: boolean; lane?: Lane }>({ open: false });
    const [userDialog, setUserDialog] = useState<{ open: boolean; user?: User }>({ open: false });
    const [staffDialog, setStaffDialog] = useState<{ open: boolean; branchId?: number }>({ open: false });

    // Form states
    const [branchForm, setBranchForm] = useState<CreateBranchRequest>({ name: '', location: '', timezone: 'Africa/Accra' });
    const [laneForm, setLaneForm] = useState<CreateLaneRequest>({ laneName: '', branchId: 0, displayOrder: 1 });
    const [userForm, setUserForm] = useState<CreateUserRequest>({ username: '', email: '', password: '', role: 'CASHIER', branchId: 0, staffId: 0 });
    const [staffForm, setStaffForm] = useState<CreateStaffRequest>({ fullName: '', employeeCode: '', phone: '', branchId: 0 });
    const selectedDashboardBranchName = branches.find((branch) => branch.id === selectedDashboardBranch)?.name;
    const adminRecommendations = dashboard
        ? getAdminRecommendations({
            dashboard,
            selectedBranchName: selectedDashboardBranchName,
            branchMetrics,
        })
        : [];

    useEffect(() => {
        loadData();
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            console.log('Loading admin dashboard...');
            const data = await dashboardApi.getAdminDashboard();
            console.log('Dashboard data:', data);
            setDashboard(data);
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        }
    };

    const loadBranchMetrics = async (branchId: number) => {
        if (!branchId) return;
        try {
            const [rev, active, status, services] = await Promise.all([
                dashboardApi.getTodayRevenue(branchId),
                dashboardApi.getActiveSessionsCount(branchId),
                dashboardApi.getSessionStatusBreakdown(branchId),
                dashboardApi.getPopularServicesBreakdown(branchId)
            ]);
            setBranchMetrics({
                todayRevenue: rev,
                activeSessions: active,
                statusBreakdown: status,
                servicesBreakdown: services
            });
        } catch (error) {
            console.error('Failed to load branch metrics:', error);
            showSnackbar('Failed to load branch metrics', 'error');
        }
    };

    useEffect(() => {
        if (selectedDashboardBranch > 0) {
            loadBranchMetrics(selectedDashboardBranch);
        }
    }, [selectedDashboardBranch]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [branchesResult, lanesResult, usersResult] = await Promise.allSettled([
                branchApi.getAll(),
                laneApi.getAll(),
                userApi.getAll()
            ]);

            const branchesData = branchesResult.status === 'fulfilled' ? branchesResult.value : [];
            const lanesData = lanesResult.status === 'fulfilled' ? lanesResult.value : [];
            const usersData = usersResult.status === 'fulfilled' ? usersResult.value : [];

            setBranches(branchesData);
            setLanes(lanesData);
            setUsers(usersData);

            const failedSections: string[] = [];
            if (branchesResult.status === 'rejected') failedSections.push('branches');
            if (lanesResult.status === 'rejected') failedSections.push('lanes');
            if (usersResult.status === 'rejected') failedSections.push('users');
            if (failedSections.length > 0) {
                showSnackbar(`Failed to load ${failedSections.join(', ')}`, 'error');
            }

            // Set default branch IDs if branches exist
            if (branchesData.length > 0) {
                setLaneForm(prev => ({ ...prev, branchId: branchesData[0].id }));
                setUserForm(prev => ({ ...prev, branchId: branchesData[0].id }));
                setStaffForm(prev => ({ ...prev, branchId: branchesData[0].id }));
                setSelectedDashboardBranch(branchesData[0].id);
            }
        } catch (error) {
            showSnackbar('Failed to load data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadStaff = async (branchId: number) => {
        // Validate branchId
        if (!branchId || branchId <= 0) {
            console.log('loadStaff: invalid branchId:', branchId);
            setStaff([]);
            return;
        }
        try {
            console.log('Loading staff for branch:', branchId);
            const staffData = await staffApi.getByBranch(branchId);
            console.log('Staff data loaded:', staffData);
            setStaff(staffData);
            if (staffData.length === 0) {
                showSnackbar('No staff found for this branch. Please add staff first.', 'error');
            }
        } catch (error) {
            console.error('Failed to load staff:', error);
            showSnackbar('Failed to load staff: ' + (error as Error).message, 'error');
        }
    };

    const showSnackbar = (message: string, severity: 'success' | 'error') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    // Branch handlers
    const handleSaveBranch = async () => {
        console.log('Saving branch:', branchForm);
        if (!branchForm.name || !branchForm.location) {
            showSnackbar('Please fill in all required fields', 'error');
            return;
        }
        try {
            if (branchDialog.branch) {
                await branchApi.update(branchDialog.branch.id, branchForm);
                showSnackbar('Branch updated successfully', 'success');
            } else {
                await branchApi.create(branchForm);
                showSnackbar('Branch created successfully', 'success');
            }
            setBranchDialog({ open: false });
            loadData();
        } catch (error) {
            console.error('Failed to save branch:', error);
            showSnackbar('Failed to save branch: ' + (error as Error).message, 'error');
        }
    };

    const handleDeleteBranch = async (id: number) => {
        if (!confirm('Are you sure you want to deactivate this branch?')) return;
        try {
            await branchApi.delete(id);
            showSnackbar('Branch deactivated successfully', 'success');
            loadData();
        } catch (error) {
            showSnackbar('Failed to deactivate branch', 'error');
        }
    };

    // Lane handlers
    const handleSaveLane = async () => {
        try {
            if (laneDialog.lane) {
                await laneApi.update(laneDialog.lane.id, laneForm);
                showSnackbar('Lane updated successfully', 'success');
            } else {
                await laneApi.create(laneForm);
                showSnackbar('Lane created successfully', 'success');
            }
            setLaneDialog({ open: false });
            loadData();
        } catch (error) {
            showSnackbar('Failed to save lane', 'error');
        }
    };

    const handleDeleteLane = async (id: number) => {
        if (!confirm('Are you sure you want to deactivate this lane?')) return;
        try {
            await laneApi.delete(id);
            showSnackbar('Lane deactivated successfully', 'success');
            loadData();
        } catch (error) {
            showSnackbar('Failed to deactivate lane', 'error');
        }
    };

    // User handlers
    const handleSaveUser = async () => {
        // Validate required fields - ensure staffId is not 0 (not selected)
        if (!userForm.username || !userForm.email || !userForm.password || !userForm.branchId || !userForm.role || userForm.staffId === 0) {
            showSnackbar('Please fill in all required fields (including email and staff member)', 'error');
            return;
        }
        try {
            await userApi.create(userForm);
            showSnackbar('User created successfully', 'success');
            setUserDialog({ open: false });
            loadData();
        } catch (error) {
            showSnackbar('Failed to create user: ' + (error as Error).message, 'error');
        }
    };

    const handleDeactivateUser = async (id: number) => {
        if (!confirm('Are you sure you want to deactivate this user?')) return;
        try {
            await userApi.deactivate(id);
            showSnackbar('User deactivated successfully', 'success');
            loadData();
        } catch (error) {
            showSnackbar('Failed to deactivate user', 'error');
        }
    };

    // Staff handlers
    const handleSaveStaff = async () => {
        if (!staffForm.fullName || !staffForm.employeeCode || !staffForm.branchId) {
            showSnackbar('Please fill in all required fields', 'error');
            return;
        }
        try {
            await staffApi.create(staffForm);
            showSnackbar('Staff created successfully', 'success');
            setStaffDialog({ open: false });
            loadStaff(staffForm.branchId);
        } catch (error) {
            showSnackbar('Failed to create staff: ' + (error as Error).message, 'error');
        }
    };

    const openBranchDialog = (branch?: Branch) => {
        setBranchForm(branch ? { name: branch.name, location: branch.location, timezone: branch.timezone } : { name: '', location: '', timezone: 'Africa/Accra' });
        setBranchDialog({ open: true, branch });
    };

    const openLaneDialog = (lane?: Lane) => {
        const defaultBranchId = branches.length > 0 ? branches[0].id : 0;
        setLaneForm(lane ? { laneName: lane.laneName, branchId: lane.branchId || defaultBranchId, displayOrder: lane.displayOrder } : { laneName: '', branchId: defaultBranchId, displayOrder: 1 });
        setLaneDialog({ open: true, lane });
    };

    const openUserDialog = () => {
        const branchList = branches.filter(b => b && b.id);
        const defaultBranchId = branchList.length > 0 ? branchList[0].id : 0;
        console.log('openUserDialog - branches:', branches, 'defaultBranchId:', defaultBranchId);
        setUserForm({ username: '', email: '', password: '', role: 'CASHIER', branchId: defaultBranchId, staffId: 0 });
        if (defaultBranchId > 0) {
            loadStaff(defaultBranchId);
        } else {
            console.log('No valid branch ID found, branches:', branches);
            showSnackbar('No branches available. Please create a branch first.', 'error');
            return;
        }
        setUserDialog({ open: true });
    };

    const openStaffDialog = (branchId: number) => {
        setStaffForm({ fullName: '', employeeCode: '', phone: '', branchId });
        setStaffDialog({ open: true, branchId });
    };

    const handleBranchChange = (event: SelectChangeEvent<number>) => {
        const branchId = event.target.value as number;
        if (!branchId || branchId <= 0) {
            setUserForm({ ...userForm, branchId: 0, staffId: 0 });
            setStaff([]);
            return;
        }
        setUserForm({ ...userForm, branchId, staffId: 0 });
        loadStaff(branchId);
    };

    const adminTableContainerSx = {
        overflowX: 'auto',
        '& .MuiTable-root': {
            minWidth: isMobile ? 720 : '100%',
        },
        '& .MuiTableCell-root': {
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            verticalAlign: 'top',
            px: isMobile ? 1.2 : 2,
        },
    };

    return (
        <Box sx={{ width: '100%', p: { xs: 0, md: 1 } }}>
            <Grid2 container spacing={3} sx={{ mb: 3 }}>
                <Grid2 size={{ xs: 12, xl: 7 }}>
                    <Paper sx={{ p: { xs: 3, md: 4 }, minHeight: '100%', overflow: 'hidden', position: 'relative', background: 'linear-gradient(180deg, rgba(31,24,20,0.97), rgba(24,18,15,0.94))', backdropFilter: 'blur(18px)' }}>
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                            <Chip label="Administrative Control" sx={{ mb: 2, bgcolor: 'rgba(240,180,76,0.12)', color: '#f5cb7f' }} />
                            <Typography variant="h2" sx={{ mb: 1.5, maxWidth: 760, color: '#eef2f4', lineHeight: 1.02 }}>
                                Branch management simplified into a cleaner operational back office
                            </Typography>
                            <Typography sx={{ maxWidth: 620, color: 'rgba(154,168,176,0.86)', mb: 2.5 }}>
                                Manage branches, services, lanes, users, and operating insights from a more disciplined layout with less visual noise and faster scanning.
                            </Typography>
                            <Grid2 container spacing={1.5}>
                                <Grid2 size={{ xs: 12, sm: 4 }}>
                                    <Paper sx={{ p: 2.25, bgcolor: 'rgba(24,18,16,0.94)', border: '1px solid rgba(95,183,212,0.2)' }}>
                                        <Typography variant="caption" sx={{ color: 'rgba(154,168,176,0.74)', fontFamily: '"IBM Plex Mono", monospace' }}>
                                            Branches
                                        </Typography>
                                        <Typography variant="h4" sx={{ mt: 0.5, color: '#eef2f4' }}>{branches.length}</Typography>
                                    </Paper>
                                </Grid2>
                                <Grid2 size={{ xs: 12, sm: 4 }}>
                                    <Paper sx={{ p: 2.25, bgcolor: 'rgba(24,18,16,0.94)', border: '1px solid rgba(102,194,138,0.2)' }}>
                                        <Typography variant="caption" sx={{ color: 'rgba(154,168,176,0.74)', fontFamily: '"IBM Plex Mono", monospace' }}>
                                            Users
                                        </Typography>
                                        <Typography variant="h4" sx={{ mt: 0.5, color: '#eef2f4' }}>{users.length}</Typography>
                                    </Paper>
                                </Grid2>
                                <Grid2 size={{ xs: 12, sm: 4 }}>
                                    <Paper sx={{ p: 2.25, bgcolor: 'rgba(24,18,16,0.94)', border: '1px solid rgba(240,180,76,0.2)' }}>
                                        <Typography variant="caption" sx={{ color: 'rgba(154,168,176,0.74)', fontFamily: '"IBM Plex Mono", monospace' }}>
                                            Lanes
                                        </Typography>
                                        <Typography variant="h4" sx={{ mt: 0.5, color: '#eef2f4' }}>{lanes.length}</Typography>
                                    </Paper>
                                </Grid2>
                            </Grid2>
                        </Box>
                    </Paper>
                </Grid2>
                <Grid2 size={{ xs: 12, xl: 5 }}>
                    <PremiumScene
                        height="100%"
                        sx={{
                            minHeight: 280,
                            '& .premium-scene-grid': {
                                opacity: 0.28,
                            },
                        }}
                    />
                </Grid2>
            </Grid2>

            <Card sx={{ overflow: 'hidden', background: 'linear-gradient(180deg, rgba(31,24,20,0.97), rgba(24,18,15,0.94))', border: '1px solid rgba(255,243,232,0.12)', backdropFilter: 'blur(18px)' }}>
                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    variant={isMobile ? 'scrollable' : 'standard'}
                    scrollButtons={isMobile ? 'auto' : false}
                    allowScrollButtonsMobile
                    sx={{ borderBottom: 1, borderColor: 'divider', '& .MuiTab-root': { minWidth: isMobile ? 120 : 90 } }}
                >
                    <Tab label="Overview" />
                    <Tab label="Branches" />
                    <Tab label="Lanes" />
                    <Tab label="Users" />
                    <Tab label="Services" />
                    <Tab label="Customers" />
                </Tabs>

                {/* Overview Tab */}
                <TabPanel value={tab} index={0}>
                    {dashboard ? (
                        <Box>
                            {/* Summary Cards */}
                            <Grid2 container spacing={3} sx={{ mb: 4 }}>
                                <Grid2 size={{ xs: 12, md: 3 }}>
                                    <Card sx={{ background: 'linear-gradient(135deg, rgba(102,126,234,0.85) 0%, rgba(118,75,162,0.78) 100%)', color: 'white', border: '1px solid rgba(255,255,255,0.08)' }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Store sx={{ fontSize: 40 }} />
                                                <Box>
                                                    <Typography variant="h4">{dashboard.totalBranches}</Typography>
                                                    <Typography variant="body2">Total Branches</Typography>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid2>
                                <Grid2 size={{ xs: 12, md: 3 }}>
                                    <Card sx={{ background: 'linear-gradient(135deg, rgba(240,147,251,0.85) 0%, rgba(245,87,108,0.78) 100%)', color: 'white', border: '1px solid rgba(255,255,255,0.08)' }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <DirectionsCar sx={{ fontSize: 40 }} />
                                                <Box>
                                                    <Typography variant="h4">{dashboard.vehiclesToday}</Typography>
                                                    <Typography variant="body2">Vehicles Today</Typography>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid2>
                                <Grid2 size={{ xs: 12, md: 3 }}>
                                    <Card sx={{ background: 'linear-gradient(135deg, rgba(79,172,254,0.85) 0%, rgba(0,242,254,0.78) 100%)', color: 'white', border: '1px solid rgba(255,255,255,0.08)' }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <People sx={{ fontSize: 40 }} />
                                                <Box>
                                                    <Typography variant="h4">{dashboard.totalUsers}</Typography>
                                                    <Typography variant="body2">Total Users</Typography>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid2>
                                <Grid2 size={{ xs: 12, md: 3 }}>
                                    <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Speed sx={{ fontSize: 40 }} />
                                                <Box>
                                                    <Typography variant="h4">{dashboard.activeLanes}</Typography>
                                                    <Typography variant="body2">Active Lanes</Typography>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid2>
                            </Grid2>

                            {!!adminRecommendations.length && (
                                <Paper sx={{ p: 3, mb: 4, background: 'rgba(24,18,16,0.72)', border: '1px solid rgba(255,243,232,0.1)', backdropFilter: 'blur(14px)' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <Speed sx={{ color: '#f5cb7f' }} />
                                        <Typography variant="h6">Operational recommendations</Typography>
                                    </Box>
                                    <Grid2 container spacing={2}>
                                        {adminRecommendations.map((item) => {
                                            const tone = getRecommendationToneColor(item.tone);
                                            return (
                                                <Grid2 key={item.title} size={{ xs: 12, md: 4 }}>
                                                    <Paper
                                                        sx={{
                                                            p: 2,
                                                            height: '100%',
                                                            borderRadius: 3,
                                                            border: `1px solid ${tone.border}`,
                                                            bgcolor: tone.bg,
                                                            boxShadow: 'none',
                                                        }}
                                                    >
                                                        <Typography sx={{ fontWeight: 700, color: tone.text, mb: 0.8 }}>
                                                            {item.title}
                                                        </Typography>
                                                        <Typography sx={{ color: tone.body, lineHeight: 1.65, fontSize: '0.93rem' }}>
                                                            {item.body}
                                                        </Typography>
                                                    </Paper>
                                                </Grid2>
                                            );
                                        })}
                                    </Grid2>
                                </Paper>
                            )}

                            {/* Branch Metrics Selector and Display */}
                            <Grid2 container spacing={3} sx={{ mb: 4 }}>
                                <Grid2 size={{ xs: 12 }}>
                                    <Paper sx={{ p: 3, display: 'flex', alignItems: isMobile ? 'stretch' : 'center', flexDirection: isMobile ? 'column' : 'row', gap: 2, justifyContent: 'space-between' }}>
                                        <Typography variant="h6">Branch Level Analytics</Typography>
                                        <FormControl sx={{ minWidth: 200, width: isMobile ? '100%' : 'auto' }}>
                                            <InputLabel>Select Branch</InputLabel>
                                            <Select
                                                value={selectedDashboardBranch || ''}
                                                label="Select Branch"
                                                onChange={(e) => setSelectedDashboardBranch(e.target.value as number)}
                                            >
                                                {branches.map(branch => (
                                                    <MenuItem key={branch.id} value={branch.id}>{branch.name}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Paper>
                                </Grid2>

                                {branchMetrics && (
                                    <>
                                        <Grid2 size={{ xs: 12, md: 6 }}>
                                            <Paper sx={{ p: 3, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                <Typography variant="h6" color="textSecondary" gutterBottom>Today's Revenue</Typography>
                                                <Typography variant="h3" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                                                    {formatCurrency(branchMetrics.todayRevenue)}
                                                </Typography>
                                            </Paper>
                                        </Grid2>
                                        <Grid2 size={{ xs: 12, md: 6 }}>
                                            <Paper sx={{ p: 3, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                <Typography variant="h6" color="textSecondary" gutterBottom>Active Operations</Typography>
                                                <Typography variant="h3" sx={{ color: '#ed6c02', fontWeight: 'bold' }}>
                                                    {branchMetrics.activeSessions} Sessions
                                                </Typography>
                                            </Paper>
                                        </Grid2>

                                        <Grid2 size={{ xs: 12, md: 6 }}>
                                            <Paper sx={{ p: 3 }}>
                                                <Typography variant="h6" sx={{ mb: 2 }}>Session Status Distribution</Typography>
                                                <ResponsiveContainer width="100%" height={300}>
                                                    <PieChart>
                                                        <Pie
                                                            data={Object.entries(branchMetrics.statusBreakdown).map(([name, value]) => ({ name, value }))}
                                                            dataKey="value"
                                                            nameKey="name"
                                                            cx="50%"
                                                            cy="50%"
                                                            outerRadius={80}
                                                            label
                                                        >
                                                            {Object.keys(branchMetrics.statusBreakdown).map((_, index) => (
                                                                <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'][index % 5]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip />
                                                        <Legend />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </Paper>
                                        </Grid2>

                                        <Grid2 size={{ xs: 12, md: 6 }}>
                                            <Paper sx={{ p: 3 }}>
                                                <Typography variant="h6" sx={{ mb: 2 }}>Popular Services Today</Typography>
                                                <ResponsiveContainer width="100%" height={300}>
                                                    <BarChart data={Object.entries(branchMetrics.servicesBreakdown).map(([name, value]) => ({ name, value }))} layout="vertical">
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis type="number" />
                                                        <YAxis dataKey="name" type="category" width={100} />
                                                        <Tooltip />
                                                        <Bar dataKey="value" fill="#8884d8" name="Count" />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </Paper>
                                        </Grid2>
                                    </>
                                )}
                            </Grid2>

                            {/* Charts */}
                            <Grid2 container spacing={3}>
                                {/* Daily Trend Chart */}
                                <Grid2 size={{ xs: 12, md: 8 }}>
                                    <Paper sx={{ p: 3 }}>
                                        <Typography variant="h6" sx={{ mb: 2 }}>Daily Vehicle Count (Last 7 Days)</Typography>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={dashboard.dailyTrend}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="date" />
                                                <YAxis />
                                                <Tooltip />
                                                <Bar dataKey="count" fill="#0ea5e9" name="Vehicles" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Paper>
                                </Grid2>

                                {/* Branch Performance Pie Chart */}
                                <Grid2 size={{ xs: 12, md: 4 }}>
                                    <Paper sx={{ p: 3 }}>
                                        <Typography variant="h6" sx={{ mb: 2 }}>Branch Distribution</Typography>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie
                                                    data={dashboard.branchStats.map((b, i) => ({ name: b.branchName, value: b.vehiclesThisWeek }))}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={80}
                                                    label
                                                >
                                                    {dashboard.branchStats.map((_, index) => (
                                                        <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'][index % 5]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </Paper>
                                </Grid2>

                                {/* Branch Stats Table */}
                                <Grid2 size={{ xs: 12 }}>
                                    <Paper sx={{ p: 3 }}>
                                        <Typography variant="h6" sx={{ mb: 2 }}>Branch Performance</Typography>
                                        <TableContainer sx={adminTableContainerSx}>
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Branch</TableCell>
                                                        <TableCell>Location</TableCell>
                                                        <TableCell>Active Lanes</TableCell>
                                                        <TableCell>Today</TableCell>
                                                        <TableCell>This Week</TableCell>
                                                        <TableCell>Completion Rate</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {dashboard.branchStats.map((branch) => (
                                                        <TableRow key={branch.branchId}>
                                                            <TableCell>{branch.branchName}</TableCell>
                                                            <TableCell>{branch.location}</TableCell>
                                                            <TableCell>{branch.activeLanes}</TableCell>
                                                            <TableCell>{branch.vehiclesToday}</TableCell>
                                                            <TableCell>{branch.vehiclesThisWeek}</TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={`${branch.completionRate.toFixed(1)}%`}
                                                                    color={branch.completionRate > 30 ? 'success' : branch.completionRate > 15 ? 'warning' : 'error'}
                                                                    size="small"
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Paper>
                                </Grid2>
                            </Grid2>
                        </Box>
                    ) : (
                        <Typography>Loading dashboard...</Typography>
                    )}
                </TabPanel>

                {/* Branches Tab */}
                <TabPanel value={tab} index={1}>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: isMobile ? 'stretch' : 'flex-end' }}>
                        <Button variant="contained" startIcon={<Add />} onClick={() => openBranchDialog()} fullWidth={isMobile}>
                            Add Branch
                        </Button>
                    </Box>
                    <TableContainer component={Paper} sx={adminTableContainerSx}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Location</TableCell>
                                    <TableCell>Timezone</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {branches.map((branch) => (
                                    <TableRow key={branch.id}>
                                        <TableCell>{branch.id}</TableCell>
                                        <TableCell>{branch.name}</TableCell>
                                        <TableCell>{branch.location}</TableCell>
                                        <TableCell>{branch.timezone}</TableCell>
                                        <TableCell>
                                            <Chip label={branch.active ? 'Active' : 'Inactive'} color={branch.active ? 'success' : 'default'} size="small" />
                                        </TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => openBranchDialog(branch)}><Edit /></IconButton>
                                            <IconButton onClick={() => handleDeleteBranch(branch.id)} color="error"><Delete /></IconButton>
                                            <Button size="small" onClick={() => openStaffDialog(branch.id)}>Add Staff</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>

                {/* Lanes Tab */}
                <TabPanel value={tab} index={2}>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: isMobile ? 'stretch' : 'flex-end' }}>
                        <Button variant="contained" startIcon={<Add />} onClick={() => openLaneDialog()} disabled={branches.length === 0} fullWidth={isMobile}>
                            Add Lane
                        </Button>
                    </Box>
                    <TableContainer component={Paper} sx={adminTableContainerSx}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Lane Name</TableCell>
                                    <TableCell>Branch</TableCell>
                                    <TableCell>Display Order</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {lanes.map((lane) => (
                                    <TableRow key={lane.id}>
                                        <TableCell>{lane.id}</TableCell>
                                        <TableCell>{lane.laneName}</TableCell>
                                        <TableCell>{branches.find(b => b.id === lane.branchId)?.name || 'N/A'}</TableCell>
                                        <TableCell>{lane.displayOrder}</TableCell>
                                        <TableCell>
                                            <Chip label={lane.active ? 'Active' : 'Inactive'} color={lane.active ? 'success' : 'default'} size="small" />
                                        </TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => openLaneDialog(lane)}><Edit /></IconButton>
                                            <IconButton onClick={() => handleDeleteLane(lane.id)} color="error"><Delete /></IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>

                {/* Users Tab */}
                <TabPanel value={tab} index={3}>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: isMobile ? 'stretch' : 'flex-end' }}>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={openUserDialog}
                            disabled={branches.length === 0 || loading}
                            fullWidth={isMobile}
                        >
                            Add User
                        </Button>
                    </Box>
                    <TableContainer component={Paper} sx={adminTableContainerSx}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Username</TableCell>
                                    <TableCell>Role</TableCell>
                                    <TableCell>Branch</TableCell>
                                    <TableCell>Staff</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>{user.id}</TableCell>
                                        <TableCell>{user.username}</TableCell>
                                        <TableCell><Chip label={user.role} size="small" /></TableCell>
                                        <TableCell>{branches.find(b => b.id === user.branchId)?.name || 'N/A'}</TableCell>
                                        <TableCell>{user.staffName || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Chip label={user.active ? 'Active' : 'Inactive'} color={user.active ? 'success' : 'default'} size="small" />
                                        </TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => handleDeactivateUser(user.id)} color="error" disabled={!user.active}><Delete /></IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>

                {/* Services Tab */}
                <TabPanel value={tab} index={4}>
                    <ServicesTab showSnackbar={showSnackbar} />
                </TabPanel>

                <TabPanel value={tab} index={5}>
                    <CustomersTab />
                </TabPanel>
            </Card>


            {/* Branch Dialog */}
            <Dialog open={branchDialog.open} onClose={() => setBranchDialog({ open: false })} maxWidth="sm" fullWidth>
                <DialogTitle>{branchDialog.branch ? 'Edit Branch' : 'Add Branch'}</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Branch Name"
                        value={branchForm.name}
                        onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                        sx={{ mb: 2, mt: 1 }}
                    />
                    <TextField
                        fullWidth
                        label="Location"
                        value={branchForm.location}
                        onChange={(e) => setBranchForm({ ...branchForm, location: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Timezone"
                        value={branchForm.timezone}
                        onChange={(e) => setBranchForm({ ...branchForm, timezone: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setBranchDialog({ open: false })}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveBranch}>Save</Button>
                </DialogActions>
            </Dialog>

            {/* Lane Dialog */}
            <Dialog open={laneDialog.open} onClose={() => setLaneDialog({ open: false })} maxWidth="sm" fullWidth>
                <DialogTitle>{laneDialog.lane ? 'Edit Lane' : 'Add Lane'}</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
                        <InputLabel>Branch</InputLabel>
                        <Select
                            value={laneForm.branchId}
                            label="Branch"
                            onChange={(e) => setLaneForm({ ...laneForm, branchId: e.target.value as number })}
                        >
                            {branches.map((branch) => (
                                <MenuItem key={branch.id} value={branch.id}>{branch.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        label="Lane Name"
                        value={laneForm.laneName}
                        onChange={(e) => setLaneForm({ ...laneForm, laneName: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Display Order"
                        type="number"
                        value={laneForm.displayOrder}
                        onChange={(e) => setLaneForm({ ...laneForm, displayOrder: parseInt(e.target.value) || 1 })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setLaneDialog({ open: false })}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveLane}>Save</Button>
                </DialogActions>
            </Dialog>

            {/* User Dialog */}
            <Dialog open={userDialog.open} onClose={() => setUserDialog({ open: false })} maxWidth="sm" fullWidth>
                <DialogTitle>Add User</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
                        <InputLabel>Branch</InputLabel>
                        <Select
                            value={userForm.branchId}
                            label="Branch"
                            onChange={handleBranchChange}
                        >
                            {branches.map((branch) => (
                                <MenuItem key={branch.id} value={branch.id}>{branch.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Role</InputLabel>
                        <Select
                            value={userForm.role}
                            label="Role"
                            onChange={(e) => setUserForm({ ...userForm, role: e.target.value as Role })}
                        >
                            {ROLES.map((role) => (
                                <MenuItem key={role} value={role}>{role.replace('_', ' ')}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        label="Username"
                        value={userForm.username}
                        onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={userForm.email}
                        onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Login Password"
                        type="password"
                        value={userForm.password}
                        onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <FormControl fullWidth>
                        <InputLabel>Staff Member</InputLabel>
                        <Select
                            value={userForm.staffId}
                            label="Staff Member"
                            onChange={(e) => setUserForm({ ...userForm, staffId: e.target.value as number })}
                        >
                            {staff.map((s) => (
                                <MenuItem key={s.id} value={s.id}>{s.fullName} ({s.employeeCode})</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUserDialog({ open: false })}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveUser}>Save</Button>
                </DialogActions>
            </Dialog>

            {/* Staff Dialog */}
            <Dialog open={staffDialog.open} onClose={() => setStaffDialog({ open: false })} maxWidth="sm" fullWidth>
                <DialogTitle>Add Staff</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Full Name"
                        value={staffForm.fullName}
                        onChange={(e) => setStaffForm({ ...staffForm, fullName: e.target.value })}
                        sx={{ mb: 2, mt: 1 }}
                    />
                    <TextField
                        fullWidth
                        label="Employee Code"
                        value={staffForm.employeeCode}
                        onChange={(e) => setStaffForm({ ...staffForm, employeeCode: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Phone"
                        value={staffForm.phone}
                        onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setStaffDialog({ open: false })}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveStaff}>Save</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
