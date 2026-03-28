import { alpha, Box, Chip, Paper, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingFlat, TrendingUp } from '@mui/icons-material';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';

interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
  sparkData?: number[];
  badge?: string;
}

const trendConfig = {
  up: { icon: <TrendingUp sx={{ fontSize: 16 }} />, color: '#66c28a', label: 'Improving' },
  down: { icon: <TrendingDown sx={{ fontSize: 16 }} />, color: '#de6f5d', label: 'Watchlist' },
  neutral: { icon: <TrendingFlat sx={{ fontSize: 16 }} />, color: '#9aa8b0', label: 'Holding' },
};

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  color = '#5fb7d4',
  trend = 'neutral',
  sparkData,
  badge,
}: MetricCardProps) {
  const tc = trendConfig[trend];
  const chartData = (sparkData ?? [42, 56, 49, 73, 68, 81, typeof value === 'number' ? value : 76]).map((v, i) => ({ i, v }));
  const gradientId = `metric-${color.replace('#', '')}`;

  return (
    <Paper
      component={motion.div}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      sx={{
        p: 2.25,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 4,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.08))',
        border: `1px solid ${alpha(color, 0.26)}`,
        boxShadow: '0 18px 38px rgba(3,10,18,0.2), inset 0 1px 0 rgba(255,255,255,0.14)',
        backdropFilter: 'blur(24px)',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: `linear-gradient(180deg, ${alpha(color, 0.95)}, ${alpha('#ffffff', 0.55)})`,
        }}
      />

      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              display: 'grid',
              placeItems: 'center',
              color,
              background: alpha('#ffffff', 0.12),
              border: `1px solid ${alpha(color, 0.26)}`,
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'rgba(222,235,245,0.82)', fontFamily: '"IBM Plex Mono", monospace' }}>
              {title}
            </Typography>
            <Typography sx={{ mt: 0.5, color: '#f4f9fd', fontWeight: 700, fontSize: { xs: '1.9rem', md: '2.35rem' }, lineHeight: 1 }}>
              {value}
            </Typography>
          </Box>
        </Stack>
        <Chip
          icon={tc.icon}
          label={badge ?? tc.label}
          size="small"
          sx={{
            bgcolor: alpha(tc.color, 0.12),
            color: tc.color,
            border: `1px solid ${alpha(tc.color, 0.2)}`,
          }}
        />
      </Stack>

      {subtitle && (
        <Typography sx={{ mt: 1.5, color: 'rgba(217,230,240,0.84)', maxWidth: 280 }}>
          {subtitle}
        </Typography>
      )}

      <Box sx={{ mt: 2.2, height: 62 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.28} />
                <stop offset="95%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2.1} fill={`url(#${gradientId})`} dot={false} animationDuration={900} />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}
