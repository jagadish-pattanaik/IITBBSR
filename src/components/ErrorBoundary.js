import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Container
} from '@mui/material';
import { Error } from '@mui/icons-material';
import { motion } from 'framer-motion';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    // You can also log the error to an error reporting service here
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="sm">
          <Box
            sx={{
              minHeight: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  borderRadius: 2,
                }}
              >
                <Error
                  color="error"
                  sx={{ fontSize: 64, mb: 2 }}
                />
                <Typography variant="h5" gutterBottom>
                  Oops! Something went wrong
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  paragraph
                >
                  We're sorry for the inconvenience. Please try refreshing the page.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => window.location.reload()}
                  sx={{ mt: 2 }}
                >
                  Refresh Page
                </Button>
                {process.env.NODE_ENV === 'development' && (
                  <Box sx={{ mt: 4, textAlign: 'left' }}>
                    <Typography variant="caption" component="pre" sx={{ color: 'error.main' }}>
                      {this.state.error && this.state.error.toString()}
                    </Typography>
                  </Box>
                )}
              </Paper>
            </motion.div>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 