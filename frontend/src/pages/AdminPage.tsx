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
    Grid2
} from '@mui/material';
import { Add, Delete, Edit, Store, DirectionsCar, People, Speed } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Branch, Lane, User, Staff, Role, AdminDashboard, CreateBranchRequest, CreateLaneRequest, CreateUserRequest, CreateStaffRequest } from '../types';
import { branchApi, laneApi, userApi, staffApi, dashboardApi } from '../api/admin';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

const ROLES: Role[] = ['ADMIN', 'BRANCH_MANAGER', 'CASHIER', 'LANE_OPERATOR', 'INSPECTOR', 'AUDITOR'];

export function AdminPage() {
    const [tab, setTab] = useState(0);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [lanes, setLanes] = useState<Lane[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

    // Dialog states
    const [branchDialog, setBranchDialog] = useState<{ open: boolean; branch?: Branch }>({ open: false });
    const [laneDialog, setLaneDialog] = useState<{ open: boolean; lane?: Lane }>({ open: false });
    const [userDialog, setUserDialog] = useState<{ open: boolean; user?: User }>({ open: false });
    const [staffDialog, setStaffDialog] = useState<{ open: boolean; branchId?: number }>({ open: false });

    // Form states
    const [branchForm, setBranchForm] = useState<CreateBranchRequest>({ name: '', location: '', timezone: 'Africa/Accra' });
    const [laneForm, setLaneForm] = useState<CreateLaneRequest>({ laneName: '', branchId: 0, displayOrder: 1 });
    const [userForm, setUserForm] = useState<CreateUserRequest>({ username: '', password: '', role: 'CASHIER', branchId: 0, staffId: undefined });
    const [staffForm, setStaffForm] = useState<CreateStaffRequest>({ fullName: '', employeeCode: '', phone: '', branchId: 0 });

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

    const loadData = async () => {
        setLoading(true);
        try {
            const [branchesData, lanesData, usersData] = await Promise.all([
                branchApi.getAll(),
                laneApi.getAll(),
                userApi.getAll()
            ]);
            setBranches(branchesData);
            setLanes(lanesData);
            setUsers(usersData);

            // Set default branch IDs if branches exist
            if (branchesData.length > 0) {
                setLaneForm(prev => ({ ...prev, branchId: branchesData[0].id }));
                setUserForm(prev => ({ ...prev, branchId: branchesData[0].id }));
                setStaffForm(prev => ({ ...prev, branchId: branchesData[0].id }));
            }
        } catch (error) {
            showSnackbar('Failed to load data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadStaff = async (branchId: number) => {
        try {
            const staffData = await staffApi.getByBranch(branchId);
            setStaff(staffData);
        } catch (error) {
            showSnackbar('Failed to load staff', 'error');
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
        // Validate required fields
        if (!userForm.username || !userForm.password || !userForm.branchId || !userForm.role) {
            showSnackbar('Please fill in all required fields', 'error');
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
        try {
            await staffApi.create(staffForm);
            showSnackbar('Staff created successfully', 'success');
            setStaffDialog({ open: false });
            loadStaff(staffForm.branchId);
        } catch (error) {
            showSnackbar('Failed to create staff', 'error');
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
        const defaultBranchId = branches.length > 0 ? branches[0].id : 0;
        setUserForm({ username: '', password: '', role: 'CASHIER', branchId: defaultBranchId, staffId: undefined });
        if (defaultBranchId) {
            loadStaff(defaultBranchId);
        }
        setUserDialog({ open: true });
    };

    const openStaffDialog = (branchId: number) => {
        setStaffForm({ fullName: '', employeeCode: '', phone: '', branchId });
        setStaffDialog({ open: true, branchId });
    };

    const handleBranchChange = (event: SelectChangeEvent<number>) => {
        const branchId = event.target.value as number;
        setUserForm({ ...userForm, branchId, staffId: 0 });
        loadStaff(branchId);
    };

    return (
        <Box sx={{ width: '100%', p: 3 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
                Admin Management
            </Typography>

            <Card>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tab label="Overview" />
                    <Tab label="Branches" />
                    <Tab label="Lanes" />
                    <Tab label="Users" />
                </Tabs>

                {/* Overview Tab */}
                <TabPanel value={tab} index={0}>
                    {dashboard ? (
                        <Box>
                            {/* Summary Cards */}
                            <Grid2 container spacing={3} sx={{ mb: 4 }}>
                                <Grid2 size={{ xs: 12, md: 3 }}>
                                    <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
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
                                    <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
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
                                    <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
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
                                                <Bar dataKey="count" fill="#14b86a" name="Vehicles" radius={[4, 4, 0, 0]} />
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
                                        <TableContainer>
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
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button variant="contained" startIcon={<Add />} onClick={() => openBranchDialog()}>
                            Add Branch
                        </Button>
                    </Box>
                    <TableContainer component={Paper}>
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
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button variant="contained" startIcon={<Add />} onClick={() => openLaneDialog()} disabled={branches.length === 0}>
                            Add Lane
                        </Button>
                    </Box>
                    <TableContainer component={Paper}>
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
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button variant="contained" startIcon={<Add />} onClick={openUserDialog} disabled={branches.length === 0}>
                            Add User
                        </Button>
                    </Box>
                    <TableContainer component={Paper}>
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
                        label="Password"
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
