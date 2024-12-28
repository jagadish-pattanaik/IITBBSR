import { createTheme } from '@mui/material/styles';

export const getTheme = (mode) => createTheme({
  palette: {
    mode: mode,
    // ... rest of your theme configuration
  },
}); 