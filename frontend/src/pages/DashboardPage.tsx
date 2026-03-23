import { Box, Grid2, LinearProgress, Paper, Stack, Typography, keyframes } from '@mui/material';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { MetricCard } from '../components/layout/MetricCard';
import { authStore } from '../store/auth';
import { DashboardSummary } from '../types';
import { DirectionsCar, Timer, Warning, Speed, EmojiEvents, TrendingUp } from '@mui/icons-material';

const countUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

export function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [animatedValues, setAnimatedValues] = useState({ vehicles: 0, lanes: 0, delayed: 0 });
  const auth = authStore.get();

  useEffect(() => {
    api.get<DashboardSummary>(`/dashboard/summary?branchId=${auth?.branchId}`).then((summary) => {
      setData(summary);
      // Animate numbers
      const duration = 1500;
      const steps = 30;
      const interval = duration / steps;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        const easeOut = 1 - Math.pow(1 - progress, 3);

        setAnimatedValues({
          vehicles: Math.round(summary.vehiclesToday * easeOut),
          lanes: Math.round(summary.activeLanes * easeOut),
          delayed: Math.round(summary.delayedSessions * easeOut)
        });

        if (step >= steps) {
          clearInterval(timer);
          setAnimatedValues({
            vehicles: summary.vehiclesToday,
            lanes: summary.activeLanes,
            delayed: summary.delayedSessions
          });
        }
      }, interval);

      return () => clearInterval(timer);
    });
  }, [auth?.branchId]);

  if (!data) {
    return (
      <Box sx={{
        height: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(20, 184, 106, 0.05)',
        borderRadius: 4
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <DirectionsCar sx={{ fontSize: 48, color: '#14b86a' }} />
        </motion.div>
      </Box>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 100, damping: 12 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Stack spacing={4}>
        {/* Header */}
        <motion.div variants={itemVariants}>
          <Box>
            <Typography
              variant="h3"
              sx={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontWeight: 700,
                mb: 1,
                background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Operations Pulse
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: '1.05rem' }}>
              Live productivity, lane velocity, and branch-wide service health.
            </Typography>
          </Box>
        </motion.div>

        {/* Metrics Grid */}
        <Grid2 container spacing={3}>
          {/* Vehicles Today */}
          <Grid2 size={{ xs: 12, md: 4 }}>
            <motion.div variants={itemVariants}>
              <MetricCard
                title="Vehicles Today"
                value={animatedValues.vehicles}
                subtitle="Completed sessions logged today"
                icon={<DirectionsCar />}
                color="#14b86a"
                trend="up"
              />
            </motion.div>
          </Grid2>

          {/* Active Lanes */}
          <Grid2 size={{ xs: 12, md: 4 }}>
            <motion.div variants={itemVariants}>
              <MetricCard
                title="Active Lanes"
                value={animatedValues.lanes}
                subtitle="Operational lanes in the selected branch"
                icon={<Speed />}
                color="#f5b942"
                trend="neutral"
              />
            </motion.div>
          </Grid2>

          {/* Delayed Sessions */}
          <Grid2 size={{ xs: 12, md: 4 }}>
            <motion.div variants={itemVariants}>
              <MetricCard
                title="Delayed Sessions"
                value={animatedValues.delayed}
                subtitle="Sessions older than 45 minutes"
                icon={<Warning />}
                color={animatedValues.delayed > 3 ? '#ef4444' : '#14b86a'}
                trend={animatedValues.delayed > 3 ? 'down' : 'neutral'}
              />
            </motion.div>
          </Grid2>

          {/* Lane Leaderboard */}
          <Grid2 size={{ xs: 12, lg: 6 }}>
            <motion.div variants={itemVariants}>
              <Paper
                sx={{
                  p: 3,
                  height: '100%',
                  background: 'rgba(15, 27, 22, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                  borderRadius: 4
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #f5b942 0%, #f59e0b 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <EmojiEvents sx={{ color: 'white', fontSize: 24 }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>Lane Leaderboard</Typography>
                </Box>
                <Stack spacing={2}>
                  {data.laneLeaderboard.map((item, index) => (
                    <motion.div
                      key={item.laneId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.15 + 0.5 }}
                    >
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          background: index === 0
                            ? 'linear-gradient(135deg, rgba(245, 185, 66, 0.15) 0%, rgba(245, 185, 66, 0.05) 100%)'
                            : 'rgba(148, 163, 184, 0.05)',
                          border: index === 0 ? '1px solid rgba(245, 185, 66, 0.3)' : '1px solid transparent',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateX(4px)',
                            background: 'rgba(20, 184, 106, 0.1)'
                          }
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                              sx={{
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                background: index === 0
                                  ? 'linear-gradient(135deg, #f5b942 0%, #f59e0b 100%)'
                                  : index === 1
                                    ? 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)'
                                    : index === 2
                                      ? 'linear-gradient(135deg, #cd7f32 0%, #b45309 100%)'
                                      : 'rgba(148, 163, 184, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                color: 'white'
                              }}
                            >
                              {index + 1}
                            </Box>
                            <Box>
                              <Typography fontWeight={800} sx={{ fontSize: '1.05rem' }}>
                                {item.laneName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {item.branchName}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography
                              fontWeight={700}
                              sx={{
                                color: '#14b86a',
                                fontSize: '1.1rem'
                              }}
                            >
                              {item.averageMinutes.toFixed(1)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              min avg
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    </motion.div>
                  ))}
                </Stack>
              </Paper>
            </motion.div>
          </Grid2>

          {/* Monthly Ranking */}
          <Grid2 size={{ xs: 12, lg: 6 }}>
            <motion.div variants={itemVariants}>
              <Paper
                sx={{
                  p: 3,
                  height: '100%',
                  background: 'rgba(15, 27, 22, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                  borderRadius: 4
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #14b86a 0%, #10b360 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <TrendingUp sx={{ color: 'white', fontSize: 24 }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>Monthly Ranking</Typography>
                </Box>
                <Stack spacing={2.5}>
                  {data.monthlyRanking.map((item, index) => (
                    <motion.div
                      key={item.laneId}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.15 + 0.5 }}
                    >
                      <Box>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                          <Typography fontWeight={800} sx={{ fontSize: '1.05rem' }}>
                            {item.laneName}
                          </Typography>
                          <Typography
                            fontWeight={700}
                            sx={{
                              color: item.combinedScore >= 0.8 ? '#14b86a' : item.combinedScore >= 0.5 ? '#f5b942' : '#ef4444'
                            }}
                          >
                            {(item.combinedScore * 100).toFixed(0)}%
                          </Typography>
                        </Stack>
                        <Box sx={{ position: 'relative' }}>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(100, item.combinedScore * 100)}
                            sx={{
                              height: 12,
                              borderRadius: 6,
                              background: 'rgba(148, 163, 184, 0.15)',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 6,
                                background: item.combinedScore >= 0.8
                                  ? 'linear-gradient(90deg, #14b86a 0%, #10b360 100%)'
                                  : item.combinedScore >= 0.5
                                    ? 'linear-gradient(90deg, #f5b942 0%, #f59e0b 100%)'
                                    : 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)'
                              }
                            }}
                          />
                          {/* Shimmer effect */}
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              borderRadius: 6,
                              background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)`,
                              backgroundSize: '200% 100%',
                              animation: `${shimmer} 2s infinite`
                            }}
                          />
                        </Box>
                      </Box>
                    </motion.div>
                  ))}
                </Stack>
              </Paper>
            </motion.div>
          </Grid2>
        </Grid2>
      </Stack>
    </motion.div>
  );
}
