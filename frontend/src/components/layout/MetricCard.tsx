import { Box, Paper, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon?: ReactNode;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function MetricCard({ title, value, subtitle, icon, color = '#14b86a', trend }: MetricCardProps) {
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp sx={{ fontSize: 20, color: '#14b86a' }} />;
    if (trend === 'down') return <TrendingDown sx={{ fontSize: 20, color: '#ef4444' }} />;
    return <TrendingFlat sx={{ fontSize: 20, color: 'text.secondary' }} />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return '#14b86a';
    if (trend === 'down') return '#ef4444';
    return 'text.secondary';
  };

  return (
    <Paper
      component={motion.div}
      whileHover={{
        y: -8,
        boxShadow: `0 20px 40px ${color}20`
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: 'spring' }}
      sx={{
        p: 3,
        height: '100%',
        background: 'rgba(15, 27, 22, 0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        borderRadius: 4,
        overflow: 'hidden',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${color} 0%, ${color}80 100%)`
        }
      }}
    >
      <Stack spacing={2}>
        {/* Header with icon */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem' }}
          >
            {title}
          </Typography>
          {icon && (
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: `${color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: color
              }}
            >
              {icon}
            </Box>
          )}
        </Box>

        {/* Value with trend */}
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography
            variant="h2"
            component={motion.span}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            sx={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 700,
              color: color,
              fontSize: '2.5rem',
              lineHeight: 1
            }}
          >
            {value}
          </Typography>
          {trend && (
            <Box
              component={motion.div}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              sx={{ display: 'flex', alignItems: 'center', color: getTrendColor() }}
            >
              {getTrendIcon()}
            </Box>
          )}
        </Box>

        {/* Subtitle */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: '0.85rem' }}
        >
          {subtitle}
        </Typography>

        {/* Decorative gradient */}
        <Box
          sx={{
            position: 'absolute',
            bottom: -50,
            right: -50,
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: `${color}08`,
            filter: 'blur(30px)'
          }}
        />
      </Stack>
    </Paper>
  );
}
