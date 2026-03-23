import { PaletteMode, createTheme } from '@mui/material';

export const getAppTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#14b86a'
      },
      secondary: {
        main: '#f5b942'
      },
      error: {
        main: '#ef4444'
      },
      background: mode === 'dark'
        ? { default: '#08110d', paper: '#0f1b16' }
        : { default: '#f6fbf7', paper: '#ffffff' }
    },
    shape: {
      borderRadius: 24
    },
    typography: {
      fontFamily: '"Manrope", sans-serif',
      h1: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700 },
      h2: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700 },
      h3: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700 },
      h4: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700 }
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 24,
            backgroundImage: 'none',
            boxShadow: mode === 'dark'
              ? '0 18px 48px rgba(0,0,0,0.32)'
              : '0 18px 48px rgba(20, 24, 30, 0.08)'
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            textTransform: 'none',
            fontWeight: 700
          }
        }
      }
    }
  });
