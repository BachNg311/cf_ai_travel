import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TravelAppLayout from './components/TravelAppLayout';
import theme from './theme';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <TravelAppLayout />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
