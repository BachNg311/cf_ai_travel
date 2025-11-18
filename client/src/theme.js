import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00D4FF'
    },
    secondary: {
      main: '#FF7A18'
    },
    background: {
      default: '#050816',
      paper: '#0F172A'
    }
  },
  typography: {
    fontFamily: '"Space Grotesk", "Inter", sans-serif',
    h3: {
      fontWeight: 600,
      letterSpacing: '-0.02em'
    }
  },
  shape: {
    borderRadius: 18
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(14px)'
        }
      }
    }
  }
});

export default theme;

