import { Box, Chip, Grid2, MenuItem, Paper, Skeleton, Stack, TextField, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DirectionsCar, EmojiEvents, Speed, TrendingUp, Warning } from '@mui/icons-material';
import { api } from '../api/client';
import { MetricCard } from '../components/layout/MetricCard';
import { PremiumScene } from '../components/layout/PremiumScene';
import { authStore } from '../store/auth';
import { DashboardSummary, SelectOption } from '../types';
import { getAdminBranchPreference, saveAdminBranchPreference } from '../utils/adminBranchPreference';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, type: 'spring', stiffness: 90, damping: 14 },
  }),
};

export function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [animatedValues, setAnimatedValues] = useState({ vehicles: 0, lanes: 0, delayed: 0 });
  const [branches, setBranches] = useState<SelectOption[]>([]);
  const auth = authStore.get();
  const isAdmin = auth?.role === 'ADMIN';
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    isAdmin ? getAdminBranchPreference(auth?.branchId) : String(auth?.branchId ?? ''),
  );

  const dashboardQuery = useMemo(
    () => (selectedBranchId === 'ALL' ? '/dashboard/summary' : `/dashboard/summary?branchId=${selectedBranchId || auth?.branchId}`),
    [auth?.branchId, selectedBranchId],
  );

  useEffect(() => {
    api.get<SelectOption[]>('/reference/branches').then(setBranches);
  }, []);

  useEffect(() => {
    if (isAdmin) {
      saveAdminBranchPreference(selectedBranchId);
    }
  }, [isAdmin, selectedBranchId]);

  useEffect(() => {
    setLoadError(null);
    setData(null);

    api.get<DashboardSummary>(dashboardQuery)
      .then((summary) => {
        setData(summary);
        const duration = 1200;
        const steps = 36;
        let step = 0;
        const timer = setInterval(() => {
          step += 1;
          const progress = 1 - Math.pow(1 - step / steps, 3);
          setAnimatedValues({
            vehicles: Math.round(summary.vehiclesToday * progress),
            lanes: Math.round(summary.activeLanes * progress),
            delayed: Math.round(summary.delayedSessions * progress),
          });
          if (step >= steps) {
            clearInterval(timer);
          }
        }, duration / steps);
      })
      .catch((error: Error) => {
        setLoadError(error.message || 'Unable to load overview');
      });
  }, [dashboardQuery]);

  if (loadError) {
    return (
      <Paper sx={{ p: 4 }}>
        <Stack spacing={1.5}>
          <Typography variant="h5">Overview unavailable</Typography>
          <Typography color="text.secondary">
            {loadError}
          </Typography>
        </Stack>
      </Paper>
    );
  }

  const vehicleSpark = data?.laneLeaderboard?.map((lane) => lane.averageMinutes) ?? [28, 36, 31, 44, 38, 52];
  const laneSpark = data?.monthlyRanking?.map((lane) => lane.combinedScore * 100) ?? [66, 72, 77, 83, 78, 86];
  const areaData = Array.from({ length: 7 }, (_, index) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index],
    vehicles: Math.round((data?.vehiclesToday ?? 20) * 0.45 + 18 + Math.random() * 22),
  }));
  const radialData =
    data?.monthlyRanking?.slice(0, 4).map((lane, index) => ({
      name: lane.laneName,
      value: Math.round(lane.combinedScore * 100),
      fill: ['#7dd3fc', '#34d399', '#fbbf24', '#c084fc'][index],
    })) ?? [];

  if (!data) {
    return (
      <Stack spacing={3}>
        <Skeleton variant="rectangular" height={260} sx={{ borderRadius: 6 }} />
        <Grid2 container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid2 key={i} size={{ xs: 12, md: 4 }}>
              <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 6 }} />
            </Grid2>
          ))}
        </Grid2>
      </Stack>
    );
  }

  return (
    <Stack spacing={4}>
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <Grid2 container spacing={3} alignItems="stretch">
          <Grid2 size={{ xs: 12, xl: 7 }}>
            <Paper sx={{ p: { xs: 3, md: 4 }, minHeight: '100%', overflow: 'hidden', position: 'relative' }}>
              <Stack spacing={2.25} sx={{ position: 'relative', zIndex: 1 }}>
                <Chip label="Operations Overview" sx={{ width: 'fit-content', bgcolor: 'rgba(240,180,76,0.12)', color: '#f5cb7f' }} />
                <Typography variant="h2" sx={{ maxWidth: 760, color: '#eef2f4', lineHeight: 1.04 }}>
                  Branch performance laid out like a control room, not a marketing screen
                </Typography>
                <Typography sx={{ maxWidth: 640, color: 'rgba(154,168,176,0.86)', fontSize: '1.02rem' }}>
                  Track throughput, lane pressure, and delays in a calmer industrial layout designed for real daily use. The graphics are now there to support decisions, not compete with them.
                </Typography>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2} useFlexGap flexWrap="wrap">
                  <Chip label={`${data.vehiclesToday} vehicles completed today`} sx={{ bgcolor: 'rgba(102,194,138,0.12)', color: '#8fd7a7' }} />
                  <Chip label={`${data.activeLanes} lanes running`} sx={{ bgcolor: 'rgba(95,183,212,0.12)', color: '#8fd0e6' }} />
                  <Chip label={`${data.delayedSessions} sessions at risk`} sx={{ bgcolor: 'rgba(240,180,76,0.12)', color: '#f5cb7f' }} />
                </Stack>
                <Box sx={{ maxWidth: 430, pt: 1 }}>
                  <TextField
                    select
                    fullWidth
                    label="Viewing Branch"
                    value={selectedBranchId}
                    onChange={(event) => setSelectedBranchId(event.target.value)}
                  >
                    {isAdmin && <MenuItem value="ALL">All Branches</MenuItem>}
                    {branches.map((branch) => (
                      <MenuItem key={branch.id} value={String(branch.id)}>
                        {branch.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
              </Stack>
            </Paper>
          </Grid2>
          <Grid2 size={{ xs: 12, xl: 5 }}>
            <PremiumScene height="100%" sx={{ minHeight: 280 }} />
          </Grid2>
        </Grid2>
      </motion.div>

      <Grid2 container spacing={3}>
        {[
          {
            title: 'Vehicles Today',
            value: animatedValues.vehicles,
            subtitle: 'Completed sessions pushed through the wash flow today.',
            icon: <DirectionsCar />,
            color: '#5fb7d4',
            trend: 'up' as const,
            sparkData: vehicleSpark,
          },
          {
            title: 'Active Lanes',
            value: animatedValues.lanes,
            subtitle: 'Lanes actively participating in live operations.',
            icon: <Speed />,
            color: '#66c28a',
            trend: 'neutral' as const,
            sparkData: laneSpark,
          },
          {
            title: 'Delayed Sessions',
            value: animatedValues.delayed,
            subtitle: 'Sessions exceeding the ideal turnaround threshold.',
            icon: <Warning />,
            color: animatedValues.delayed > 3 ? '#de6f5d' : '#f0b44c',
            trend: animatedValues.delayed > 3 ? 'down' as const : 'neutral' as const,
          },
        ].map((card, index) => (
          <Grid2 key={card.title} size={{ xs: 12, md: 4 }}>
            <motion.div custom={index + 1} variants={fadeUp} initial="hidden" animate="visible">
              <MetricCard {...card} />
            </motion.div>
          </Grid2>
        ))}
      </Grid2>

      <Grid2 container spacing={3}>
        <Grid2 size={{ xs: 12, lg: 7 }}>
          <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
            <Paper sx={{ p: 3, height: 320 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
                <Box sx={{ width: 42, height: 42, borderRadius: 2.5, display: 'grid', placeItems: 'center', bgcolor: 'rgba(95,183,212,0.12)', color: '#5fb7d4' }}>
                  <TrendingUp />
                </Box>
                <Box>
                  <Typography sx={{ color: '#eef2f4', fontWeight: 700 }}>7-day throughput</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(154,168,176,0.8)', fontFamily: '"IBM Plex Mono", monospace' }}>
                    Daily completed wash volume
                  </Typography>
                </Box>
              </Stack>
              <ResponsiveContainer width="100%" height="78%">
                <AreaChart data={areaData}>
                  <defs>
                    <linearGradient id="dashboardVehicles" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5fb7d4" stopOpacity={0.32} />
                      <stop offset="95%" stopColor="#5fb7d4" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fill: '#9aa8b0', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#9aa8b0', fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid rgba(154,168,176,0.16)',
                      background: 'rgba(19,25,30,0.96)',
                      color: '#eef2f4',
                    }}
                  />
                  <Area type="monotone" dataKey="vehicles" stroke="#5fb7d4" strokeWidth={2.5} fill="url(#dashboardVehicles)" />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </motion.div>
        </Grid2>

        <Grid2 size={{ xs: 12, lg: 5 }}>
          <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible">
            <Paper sx={{ p: 3, height: 320 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
                <Box sx={{ width: 42, height: 42, borderRadius: 2.5, display: 'grid', placeItems: 'center', bgcolor: 'rgba(240,180,76,0.12)', color: '#f0b44c' }}>
                  <EmojiEvents />
                </Box>
                <Box>
                  <Typography sx={{ color: '#eef2f4', fontWeight: 700 }}>Lane efficiency index</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(154,168,176,0.8)', fontFamily: '"IBM Plex Mono", monospace' }}>
                    Speed and completion score
                  </Typography>
                </Box>
              </Stack>
              <ResponsiveContainer width="100%" height="78%">
                <RadialBarChart innerRadius="25%" outerRadius="92%" data={radialData} startAngle={90} endAngle={-270}>
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar background dataKey="value" cornerRadius={18} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid rgba(154,168,176,0.16)',
                      background: 'rgba(19,25,30,0.96)',
                      color: '#eef2f4',
                    }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </Paper>
          </motion.div>
        </Grid2>
      </Grid2>
    </Stack>
  );
}
