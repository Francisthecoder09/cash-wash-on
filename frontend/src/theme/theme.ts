import { PaletteMode, alpha, createTheme } from '@mui/material';

const sparkOrange = '#e36b2c';
const sparkCream = '#f8f3ed';
const sparkInk = '#1f1a17';
const sparkStone = '#7d7066';
const sparkRed = '#c8583d';
const sparkMint = '#4f9b88';

export const getAppTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
      primary: { main: sparkOrange, light: '#f08b54', dark: '#bc4f17' },
      secondary: { main: '#2d221d', light: '#57453c', dark: '#17110e' },
      success: { main: sparkMint },
      warning: { main: '#d6903b' },
      error: { main: sparkRed },
      info: { main: '#8f6f58' },
      background:
        mode === 'dark'
          ? { default: '#17120f', paper: '#221a15' }
          : { default: sparkCream, paper: '#fffaf4' },
      text:
        mode === 'dark'
          ? { primary: '#f5ede5', secondary: '#c5b4a6', disabled: '#8e7e73' }
          : { primary: sparkInk, secondary: sparkStone, disabled: '#ab9b91' },
      divider: mode === 'dark' ? 'rgba(255,243,232,0.12)' : 'rgba(88,66,50,0.12)',
    },
    shape: { borderRadius: 14 },
    typography: {
      fontFamily: '"Space Grotesk", "Manrope", "Segoe UI", sans-serif',
      h1: { fontWeight: 700, letterSpacing: '-0.045em', fontSize: '3rem' },
      h2: { fontWeight: 700, letterSpacing: '-0.04em', fontSize: '2.35rem' },
      h3: { fontWeight: 700, letterSpacing: '-0.03em', fontSize: '1.95rem' },
      h4: { fontWeight: 700, letterSpacing: '-0.025em', fontSize: '1.5rem' },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600 },
      body1: { fontSize: '0.96rem' },
      body2: { fontSize: '0.9rem' },
      button: { fontWeight: 700, textTransform: 'none', letterSpacing: '0', fontSize: '0.92rem' },
      caption: { letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: '0.72rem' },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: (themeParam) => ({
          '@import':
            "url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Manrope:wght@400;500;600;700&display=swap')",
          html: {
            backgroundColor: themeParam.palette.background.default,
          },
          body: {
            minHeight: '100vh',
            background:
              themeParam.palette.mode === 'dark'
                ? 'radial-gradient(circle at top left, rgba(227,107,44,0.12), transparent 20%), linear-gradient(180deg, #17120f 0%, #1c1511 52%, #241a15 100%)'
                : 'linear-gradient(180deg, #fcf7f1 0%, #f8f3ed 100%)',
          },
          '::selection': {
            background: alpha(sparkOrange, 0.22),
          },
          '*': {
            scrollbarWidth: 'thin',
            scrollbarColor: `${alpha(sparkOrange, 0.36)} transparent`,
            boxSizing: 'border-box',
          },
          '*::-webkit-scrollbar': { width: 10, height: 10 },
          '*::-webkit-scrollbar-track': { background: 'transparent' },
          '*::-webkit-scrollbar-thumb': {
            background: alpha(sparkOrange, 0.2),
            borderRadius: 999,
          },
          '*::-webkit-scrollbar-thumb:hover': {
            background: alpha(sparkOrange, 0.34),
          },
        }),
      },
      MuiPaper: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundImage: 'none',
            borderRadius: 16,
            border: `1px solid ${theme.palette.divider}`,
            background:
              theme.palette.mode === 'dark'
                ? 'linear-gradient(180deg, rgba(31,24,20,0.96) 0%, rgba(24,18,15,0.93) 100%)'
                : 'linear-gradient(180deg, rgba(255,251,245,0.98) 0%, rgba(249,241,232,0.94) 100%)',
            boxShadow:
              theme.palette.mode === 'dark'
                ? '0 18px 40px rgba(8,6,5,0.34)'
                : '0 18px 38px rgba(69,49,36,0.08)',
            backdropFilter: theme.palette.mode === 'dark' ? 'blur(16px)' : undefined,
          }),
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            minHeight: 42,
            paddingInline: 16,
            whiteSpace: 'normal',
            textAlign: 'center',
            lineHeight: 1.2,
          },
          containedPrimary: {
            background: `linear-gradient(135deg, ${sparkOrange}, #f08b54)`,
            color: '#fffaf5',
            boxShadow: '0 12px 28px rgba(227,107,44,0.22)',
          },
          outlined: ({ theme }) => ({
            borderWidth: 1.2,
            borderColor: theme.palette.mode === 'dark' ? alpha('#fff3e8', 0.18) : alpha('#5a4638', 0.14),
            background: theme.palette.mode === 'dark' ? 'rgba(33,25,21,0.88)' : alpha('#fffaf5', 0.72),
          }),
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            fontWeight: 700,
            maxWidth: '100%',
            height: 'auto',
            minHeight: 28,
            alignItems: 'center',
            fontSize: '0.78rem',
          },
          label: {
            whiteSpace: 'normal',
            overflowWrap: 'anywhere',
            lineHeight: 1.15,
            paddingTop: 4,
            paddingBottom: 4,
            paddingLeft: 10,
            paddingRight: 10,
          },
        },
      },
      MuiTextField: {
        defaultProps: { variant: 'outlined' },
        styleOverrides: {
          root: ({ theme }) => ({
            '& .MuiOutlinedInput-root': {
              borderRadius: 10,
              background: theme.palette.mode === 'dark' ? 'rgba(32,25,21,0.9)' : 'rgba(255,251,245,0.92)',
              '& fieldset': {
                borderColor: theme.palette.mode === 'dark' ? alpha('#fff3e8', 0.16) : alpha('#5a4638', 0.14),
              },
              '&:hover fieldset': {
                borderColor: alpha(sparkOrange, 0.48),
              },
              '&.Mui-focused fieldset': {
                borderColor: sparkOrange,
              },
            },
          }),
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            overflowWrap: 'anywhere',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: ({ theme }) => ({
            borderBottom: `1px solid ${theme.palette.divider}`,
            color: theme.palette.text.secondary,
            fontSize: '0.74rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            overflowWrap: 'anywhere',
          }),
          body: ({ theme }) => ({
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.74)}`,
            overflowWrap: 'anywhere',
            wordBreak: 'break-word',
          }),
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: ({ theme }) => ({
            transition: 'background-color 0.16s ease',
            '&:hover': {
              backgroundColor: alpha(theme.palette.common.white, theme.palette.mode === 'dark' ? 0.06 : 0.66),
            },
          }),
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            backgroundColor: sparkOrange,
            height: 3,
            borderRadius: 999,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: ({ theme }) => ({
            borderRadius: 16,
            border: `1px solid ${theme.palette.divider}`,
            background:
              theme.palette.mode === 'dark'
                ? 'linear-gradient(180deg, rgba(28,21,18,0.98) 0%, rgba(23,17,14,0.96) 100%)'
                : undefined,
            backdropFilter: theme.palette.mode === 'dark' ? 'blur(18px)' : undefined,
          }),
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            overflow: 'hidden',
          },
        },
      },
    },
  });
