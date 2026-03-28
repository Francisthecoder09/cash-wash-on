import { PaletteMode, alpha, createTheme } from '@mui/material';

const glassBlue = '#9edcff';
const glassAqua = '#7de2d1';
const glassAmber = '#ffd48a';
const glassRed = '#ff9b97';

export const getAppTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
      primary: { main: glassBlue, light: '#d4f1ff', dark: '#5aa9da' },
      secondary: { main: glassAmber, light: '#ffe4b6', dark: '#d9a75f' },
      success: { main: glassAqua },
      warning: { main: glassAmber },
      error: { main: glassRed },
      info: { main: glassBlue },
      background:
        mode === 'dark'
          ? { default: '#091018', paper: '#121b24' }
          : { default: '#edf6fb', paper: '#ffffff' },
      text:
        mode === 'dark'
          ? { primary: '#f4f9fd', secondary: '#b9c9d8', disabled: '#718292' }
          : { primary: '#173042', secondary: '#587084', disabled: '#8ea1b1' },
      divider: mode === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(117,157,189,0.18)',
    },
    shape: { borderRadius: 18 },
    typography: {
      fontFamily: '"IBM Plex Sans", "Segoe UI", sans-serif',
      h1: { fontWeight: 700, letterSpacing: '-0.03em' },
      h2: { fontWeight: 700, letterSpacing: '-0.03em' },
      h3: { fontWeight: 700, letterSpacing: '-0.025em' },
      h4: { fontWeight: 700, letterSpacing: '-0.02em' },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600 },
      button: { fontWeight: 700, textTransform: 'none', letterSpacing: '0.01em' },
      caption: { letterSpacing: '0.08em', textTransform: 'uppercase' },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: (themeParam) => ({
          '@import':
            "url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap')",
          html: {
            backgroundColor: themeParam.palette.background.default,
          },
          body: {
            minHeight: '100vh',
            background:
              themeParam.palette.mode === 'dark'
                ? 'radial-gradient(circle at top left, rgba(158,220,255,0.18), transparent 24%), radial-gradient(circle at top right, rgba(125,226,209,0.1), transparent 20%), linear-gradient(180deg, #091018 0%, #0b1520 45%, #101c28 100%)'
                : 'radial-gradient(circle at top left, rgba(158,220,255,0.22), transparent 22%), linear-gradient(180deg, #f6fbff 0%, #edf6fb 100%)',
          },
          '::selection': {
            background: alpha(glassBlue, 0.35),
          },
          '*': {
            scrollbarWidth: 'thin',
            scrollbarColor: `${alpha(glassBlue, 0.45)} transparent`,
            boxSizing: 'border-box',
          },
          '*::-webkit-scrollbar': { width: 10, height: 10 },
          '*::-webkit-scrollbar-track': { background: 'transparent' },
          '*::-webkit-scrollbar-thumb': {
            background: alpha(glassBlue, 0.22),
            borderRadius: 999,
          },
          '*::-webkit-scrollbar-thumb:hover': {
            background: alpha(glassBlue, 0.38),
          },
        }),
      },
      MuiPaper: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundImage: 'none',
            borderRadius: 20,
            border: `1px solid ${theme.palette.divider}`,
            background:
              theme.palette.mode === 'dark'
                ? 'linear-gradient(180deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.08) 100%)'
                : 'linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.72) 100%)',
            boxShadow:
              theme.palette.mode === 'dark'
                ? '0 24px 60px rgba(3,10,18,0.26), inset 0 1px 0 rgba(255,255,255,0.18)'
                : '0 20px 46px rgba(96,134,165,0.12), inset 0 1px 0 rgba(255,255,255,0.72)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }),
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            minHeight: 44,
            paddingInline: 16,
            whiteSpace: 'normal',
            textAlign: 'center',
            lineHeight: 1.2,
          },
          containedPrimary: {
            background: 'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(212,241,255,0.88))',
            color: '#102636',
            boxShadow: '0 14px 32px rgba(0,0,0,0.16)',
          },
          outlined: ({ theme }) => ({
            borderWidth: 1.2,
            borderColor: alpha(theme.palette.common.white, theme.palette.mode === 'dark' ? 0.22 : 0.36),
            background: alpha(theme.palette.common.white, theme.palette.mode === 'dark' ? 0.04 : 0.45),
            backdropFilter: 'blur(20px)',
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
            minHeight: 32,
            alignItems: 'center',
          },
          label: {
            whiteSpace: 'normal',
            overflowWrap: 'anywhere',
            lineHeight: 1.15,
            paddingTop: 6,
            paddingBottom: 6,
          },
        },
      },
      MuiTextField: {
        defaultProps: { variant: 'outlined' },
        styleOverrides: {
          root: ({ theme }) => ({
            '& .MuiOutlinedInput-root': {
              borderRadius: 14,
              background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.72)',
              backdropFilter: 'blur(18px)',
              '& fieldset': {
                borderColor: alpha(theme.palette.common.white, theme.palette.mode === 'dark' ? 0.18 : 0.3),
              },
              '&:hover fieldset': {
                borderColor: alpha(glassBlue, 0.55),
              },
              '&.Mui-focused fieldset': {
                borderColor: glassBlue,
              },
              '&.Mui-focused': {
                boxShadow: `0 0 0 4px ${alpha(glassBlue, 0.14)}`,
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
            backgroundColor: glassBlue,
            height: 3,
            borderRadius: 999,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: ({ theme }) => ({
            borderRadius: 22,
            border: `1px solid ${theme.palette.divider}`,
            backdropFilter: 'blur(28px)',
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
