import { Box, SxProps, Theme } from '@mui/material';

type SupercarShowcaseProps = {
  variant?: 'lineup' | 'night';
  sx?: SxProps<Theme>;
};

export function SupercarShowcase({ variant = 'lineup', sx }: SupercarShowcaseProps) {
  const src = variant === 'night' ? '/supercar-night.svg' : '/supercar-lineup.svg';

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 3,
        border: '1px solid rgba(154,168,176,0.14)',
        bgcolor: 'rgba(11,15,20,0.96)',
        minHeight: 220,
        ...sx,
      }}
    >
      <Box
        component="img"
        src={src}
        alt="Supercar showcase"
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(8,12,16,0.08) 0%, rgba(8,12,16,0.28) 100%)',
          pointerEvents: 'none',
        }}
      />
    </Box>
  );
}
