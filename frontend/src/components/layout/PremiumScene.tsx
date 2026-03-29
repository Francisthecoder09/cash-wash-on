import { Box, SxProps, Theme, Typography } from '@mui/material';
import { motion } from 'framer-motion';

type PremiumSceneProps = {
  height?: number | string;
  compact?: boolean;
  sx?: SxProps<Theme>;
};

const laneBars = [68, 84, 56, 91];
const queuePoints = [
  { top: '18%', left: '18%' },
  { top: '34%', left: '48%' },
  { top: '57%', left: '34%' },
  { top: '68%', left: '76%' },
];

export function PremiumScene({ height = 280, compact = false, sx }: PremiumSceneProps) {
  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: height,
        borderRadius: compact ? 3 : 4,
        border: '1px solid rgba(88,66,50,0.1)',
        background:
          'linear-gradient(180deg, rgba(255,251,245,0.98) 0%, rgba(246,237,228,0.98) 100%)',
        ...sx,
      }}
    >
      <Box
        className="premium-scene-grid"
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.32,
          backgroundImage:
            'linear-gradient(rgba(125,112,102,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(125,112,102,0.08) 1px, transparent 1px)',
          backgroundSize: compact ? '28px 28px' : '34px 34px',
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(227,107,44,0.08) 0%, transparent 22%), radial-gradient(circle at 85% 15%, rgba(88,66,50,0.08), transparent 24%)',
        }}
      />

      <Box sx={{ position: 'absolute', top: compact ? 14 : 18, left: compact ? 14 : 18, right: compact ? 14 : 18 }}>
        <Typography
          sx={{
            color: 'rgba(125,112,102,0.88)',
            fontSize: '0.74rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          Wash flow snapshot
        </Typography>
      </Box>

      <Box
        component="img"
        src="/supercar-lineup.svg"
        alt="Showcase vehicles"
        sx={{
          position: 'absolute',
          right: compact ? -36 : -22,
          bottom: compact ? 8 : 10,
          width: compact ? '54%' : '48%',
          maxWidth: compact ? 250 : 360,
          opacity: 0.72,
          filter: 'drop-shadow(0 14px 24px rgba(69,49,36,0.18))',
          pointerEvents: 'none',
        }}
      />

      <svg viewBox="0 0 1000 420" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <path
          d="M96 112 L360 112 L360 180 L640 180 L640 272 L910 272"
          fill="none"
          stroke="rgba(227,107,44,0.7)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="10 12"
        />
        <path
          d="M104 308 L278 308 L278 234 L540 234 L540 140 L814 140"
          fill="none"
          stroke="rgba(125,112,102,0.65)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="8 12"
        />
      </svg>

      {queuePoints.map((point, index) => (
        <motion.div
          key={`${point.top}-${point.left}`}
          animate={{ scale: [1, 1.16, 1], opacity: [0.45, 1, 0.55] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3.6, delay: index * 0.35 }}
          style={{
            position: 'absolute',
            top: point.top,
            left: point.left,
            width: compact ? 10 : 12,
            height: compact ? 10 : 12,
            borderRadius: '50%',
            background: index % 2 === 0 ? '#e36b2c' : '#8f6f58',
            boxShadow: index % 2 === 0 ? '0 0 0 6px rgba(227,107,44,0.12)' : '0 0 0 6px rgba(143,111,88,0.12)',
          }}
        />
      ))}

      <Box
        sx={{
          position: 'absolute',
          left: compact ? 16 : 22,
          right: compact ? 16 : 22,
          bottom: compact ? 16 : 20,
          display: 'grid',
          gap: 1,
        }}
      >
        {laneBars.map((bar, index) => (
          <Box key={bar} sx={{ display: 'grid', gridTemplateColumns: compact ? '54px 1fr' : '74px 1fr', alignItems: 'center', gap: 1.2 }}>
            <Typography
              sx={{
                color: 'rgba(125,112,102,0.84)',
                fontSize: compact ? '0.68rem' : '0.74rem',
                textTransform: 'uppercase',
              }}
            >
              Lane {index + 1}
            </Typography>
            <Box sx={{ height: compact ? 8 : 10, borderRadius: 999, bgcolor: 'rgba(88,66,50,0.08)', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${bar}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
                style={{
                  height: '100%',
                  borderRadius: 999,
                  background: index % 2 === 0 ? 'linear-gradient(90deg, #e36b2c, #f0a06e)' : 'linear-gradient(90deg, #8f6f58, #c0a592)',
                }}
              />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
