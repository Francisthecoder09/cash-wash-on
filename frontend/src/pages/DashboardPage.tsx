import {
  Box, Grid2, Paper, Stack, Typography, Chip, Skeleton,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { MetricCard } from '../components/layout/MetricCard';
import { authStore } from '../store/auth';
import { DashboardSummary } from '../types';
import {
  DirectionsCar, Warning, Speed, EmojiEvents, TrendingUp,
} from '@mui/icons-material';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, PolarAngleAxis,
} from 'recharts';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, type: 'spring', stiffness: 90, damping: 14 },
  }),
};

export function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [animatedValues, setAnimatedValues] = useState({ vehicles: 0, lanes: 0, delayed: 0 });
  const auth = authStore.get();

  useEffect(() => {
    api.get<DashboardSummary>(`/dashboard/summary?branchId=${auth?.branchId}`).then((summary) => {
      setData(summary);
      const duration = 1500, steps = 40;
      let step = 0;
      const timer = setInterval(() => {
        step++;
        const p = 1 - Math.pow(1 - step / steps, 3);
        setAnimatedValues({
          vehicles: Math.round(summary.vehiclesToday * p),
          lanes: Math.round(summary.activeLanes * p),
          delayed: Math.round(summary.delayedSessions * p),
        });
        if (step >= steps) {
          clearInterval(timer);
          setAnimatedValues({
            vehicles: summary.vehiclesToday,
            lanes: summary.activeLanes,
            delayed: summary.delayedSessions,
          });
        }
      }, duration / steps);
      return () => clearInterval(timer);
    });
  }, [auth?.branchId]);

  // Build sparkline data from leaderboard if available
  const vehicleSpark = data?.laneLeaderboard?.map((l) => l.averageMinutes) ?? [30, 45, 38, 60, 50, 72];
  const laneSpark = data?.monthlyRanking?.map((r) => r.combinedScore * 100) ?? [60, 75, 55, 85, 78, 90];

  // Radial efficiency data
  const radialData = data?.monthlyRanking?.slice(0, 4).map((r, i) => ({
    name: r.laneName,
    value: Math.round(r.combinedScore * 100),
    fill: ['#0ea5e9', '#3b82f6', '#f59e0b', '#a78bfa'][i],
  })) ?? [];

  // Area chart — mock 7-day throughput based on leaderboard vehicles
  const areaData = Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    vehicles: Math.round(Math.random() * 40 + 20 + (data?.vehiclesToday ?? 0) * 0.3),
  }));

  const LoadingSkeleton = () => (
    <Stack spacing={3}>
      <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 3 }} />
      <Grid2 container spacing={3}>
        {[1, 2, 3].map(i => (
          <Grid2 key={i} size={{ xs: 12, md: 4 }}>
            <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 3 }} />
          </Grid2>
        ))}
      </Grid2>
    </Stack>
  );

  if (!data) return <LoadingSkeleton />;

  return (
    <Stack spacing={4}>
      {/* Header */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <Stack direction="row" alignItems="flex-end" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #ffffff 30%, #0ea5e9 100%)',
                backgroundClip: 'text', WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.15, mb: 0.75,
              }}
            >
              Operations Pulse
            </Typography>
            <Typography color="text.secondary">
              Live productivity, lane velocity, and service health across all branches.
            </Typography>
          </Box>
          <Chip
            label="● Live"
            sx={{
              background: 'rgba(14,165,233,0.15)',
              color: '#0ea5e9',
              border: '1px solid rgba(14,165,233,0.3)',
              fontWeight: 700,
              '& .MuiChip-label': { animation: 'blink 1.5s ease-in-out infinite' },
              '@keyframes blink': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.4 } },
            }}
          />
        </Stack>
      </motion.div>

      {/* Metric Cards */}
      <Grid2 container spacing={3}>
        {[
          {
            title: 'Vehicles Today',
            value: animatedValues.vehicles,
            subtitle: 'Completed sessions logged today',
            icon: <DirectionsCar />, color: '#0ea5e9', trend: 'up' as const,
            sparkData: vehicleSpark,
          },
          {
            title: 'Active Lanes',
            value: animatedValues.lanes,
            subtitle: 'Operational lanes in branch',
            icon: <Speed />, color: '#3b82f6', trend: 'neutral' as const,
            sparkData: laneSpark,
          },
          {
            title: 'Delayed Sessions',
            value: animatedValues.delayed,
            subtitle: 'Sessions older than 45 minutes',
            icon: <Warning />,
            color: animatedValues.delayed > 3 ? '#ef4444' : '#f59e0b',
            trend: animatedValues.delayed > 3 ? 'down' as const : 'neutral' as const,
          },
        ].map((card, i) => (
          <Grid2 key={card.title} size={{ xs: 12, md: 4 }}>
            <motion.div custom={i + 1} variants={fadeUp} initial="hidden" animate="visible">
              <MetricCard {...card} />
            </motion.div>
          </Grid2>
        ))}
      </Grid2>

      {/* Charts Row */}
      <Grid2 container spacing={3}>
        {/* 7-Day Area Chart */}
        <Grid2 size={{ xs: 12, lg: 7 }}>
          <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
            <Paper sx={{ p: 3, height: 300, bgcolor: 'rgba(12,24,16,0.85)', backdropFilter: 'blur(12px)' }}>
              <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: 'rgba(14,165,233,0.15)',
                  border: '1px solid rgba(14,165,233,0.3)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: '#0ea5e9' }}>
                  <TrendingUp sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography fontWeight={700}>7-Day Vehicle Throughput</Typography>
                  <Typography variant="caption" color="text.secondary">Completed washes per day</Typography>
                </Box>
              </Stack>
              <ResponsiveContainer width="100%" height="75%">
                <AreaChart data={areaData}>
                  <defs>
                    <linearGradient id="gVehicles" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip
                    contentStyle={{ background: '#0c1810', border: '1px solid rgba(14,165,233,0.3)', borderRadius: 12 }}
                    labelStyle={{ color: '#94a3b8', fontSize: 12 }}
                    itemStyle={{ color: '#0ea5e9', fontWeight: 700 }}
                  />
                  <Area
                    type="monotone" dataKey="vehicles" stroke="#0ea5e9" strokeWidth={2.5}
                    fill="url(#gVehicles)" dot={false} activeDot={{ r: 5, fill: '#0ea5e9' }}
                    animationDuration={1200}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </motion.div>
        </Grid2>

        {/* Radial efficiency chart */}
        <Grid2 size={{ xs: 12, lg: 5 }}>
          <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
            <Paper sx={{ p: 3, height: 300, bgcolor: 'rgba(12,24,16,0.85)', backdropFilter: 'blur(12px)' }}>
              <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
                <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: 'rgba(245,158,11,0.15)',
                  border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: '#f59e0b' }}>
                  <Speed sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography fontWeight={700}>Lane Efficiency</Typography>
                  <Typography variant="caption" color="text.secondary">Monthly performance score</Typography>
                </Box>
              </Stack>
              {radialData.length > 0 ? (
                <ResponsiveContainer width="100%" height="82%">
                  <RadialBarChart innerRadius="30%" outerRadius="90%" data={radialData} startAngle={180} endAngle={0}>
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                    <RadialBar
                      dataKey="value"
                      cornerRadius={6}
                      background={{ fill: 'rgba(148,163,184,0.08)' }}
                      animationDuration={1200}
                    />
                    <Tooltip
                      contentStyle={{ background: '#0c1810', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 12 }}
                      formatter={(value) => [`${value}%`, 'Score']}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '75%' }}>
                  <Typography color="text.secondary">No ranking data</Typography>
                </Box>
              )}
            </Paper>
          </motion.div>
        </Grid2>
      </Grid2>

      {/* Leaderboard */}
      <Grid2 container spacing={3}>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible">
            <Paper sx={{ p: 3, bgcolor: 'rgba(12,24,16,0.85)', backdropFilter: 'blur(12px)' }}>
              <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
                <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: 'rgba(245,158,11,0.15)',
                  border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: '#f59e0b' }}>
                  <EmojiEvents sx={{ fontSize: 20 }} />
                </Box>
                <Typography variant="h6" fontWeight={700}>Lane Leaderboard</Typography>
              </Stack>
              <Stack spacing={1.5}>
                {data.laneLeaderboard.map((item, idx) => {
                  const medals = ['🥇', '🥈', '🥉'];
                  const isTop = idx < 3;
                  return (
                    <motion.div
                      key={item.laneId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 + 0.5 }}
                    >
                      <Box
                        sx={{
                          p: 1.5, borderRadius: 2,
                          background: isTop
                            ? `linear-gradient(135deg, rgba(245,158,11,0.10) 0%, rgba(245,158,11,0.04) 100%)`
                            : 'rgba(148,163,184,0.04)',
                          border: isTop ? '1px solid rgba(245,158,11,0.2)' : '1px solid rgba(148,163,184,0.07)',
                          transition: 'all 0.25s',
                          '&:hover': { transform: 'translateX(4px)', background: 'rgba(14,165,233,0.08)' },
                        }}
                      >
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Typography sx={{ fontSize: '1.2rem', lineHeight: 1 }}>
                              {medals[idx] ?? `#${idx + 1}`}
                            </Typography>
                            <Box>
                              <Typography fontWeight={700} sx={{ fontSize: '0.9rem' }}>{item.laneName}</Typography>
                              <Typography variant="caption" color="text.secondary">{item.branchName}</Typography>
                            </Box>
                          </Stack>
                          <Box textAlign="right">
                            <Typography fontWeight={800} color="#0ea5e9" sx={{ fontSize: '1.05rem' }}>
                              {item.averageMinutes.toFixed(1)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">min avg</Typography>
                          </Box>
                        </Stack>
                      </Box>
                    </motion.div>
                  );
                })}
              </Stack>
            </Paper>
          </motion.div>
        </Grid2>

        {/* Monthly Ranking */}
        <Grid2 size={{ xs: 12, md: 6 }}>
          <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible">
            <Paper sx={{ p: 3, bgcolor: 'rgba(12,24,16,0.85)', backdropFilter: 'blur(12px)' }}>
              <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
                <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: 'rgba(14,165,233,0.15)',
                  border: '1px solid rgba(14,165,233,0.3)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: '#0ea5e9' }}>
                  <TrendingUp sx={{ fontSize: 20 }} />
                </Box>
                <Typography variant="h6" fontWeight={700}>Monthly Ranking</Typography>
              </Stack>
              <Stack spacing={2.5}>
                {data.monthlyRanking.map((item, idx) => {
                  const score = item.combinedScore;
                  const color = score >= 0.8 ? '#0ea5e9' : score >= 0.5 ? '#f59e0b' : '#ef4444';
                  return (
                    <motion.div
                      key={item.laneId}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.12 + 0.4 }}
                    >
                      <Box>
                        <Stack direction="row" justifyContent="space-between" mb={0.75}>
                          <Typography fontWeight={700} sx={{ fontSize: '0.9rem' }}>{item.laneName}</Typography>
                          <Typography fontWeight={800} sx={{ color, fontSize: '0.9rem' }}>
                            {(score * 100).toFixed(0)}%
                          </Typography>
                        </Stack>
                        <Box sx={{ height: 10, borderRadius: 999, bgcolor: 'rgba(148,163,184,0.12)', overflow: 'hidden' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, score * 100)}%` }}
                            transition={{ delay: idx * 0.12 + 0.6, duration: 0.8, ease: 'easeOut' }}
                            style={{
                              height: '100%',
                              borderRadius: 999,
                              background: `linear-gradient(90deg, ${color} 0%, ${color}99 100%)`,
                              boxShadow: `0 0 8px ${color}55`,
                            }}
                          />
                        </Box>
                      </Box>
                    </motion.div>
                  );
                })}
              </Stack>
            </Paper>
          </motion.div>
        </Grid2>
      </Grid2>
    </Stack>
  );
}
