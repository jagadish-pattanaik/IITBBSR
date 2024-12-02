import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Container,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Paper
} from '@mui/material';
import { Google } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { auth } from '../services/firebase';

const Login = () => {
  const navigate = useNavigate();
  const { googleSignIn, updateUserProfile } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingData, setOnboardingData] = useState({
    year: '',
    branch: ''
  });

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      const result = await googleSignIn();
      
      if (result.isNewUser) {
        setShowOnboarding(true);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Failed to sign in with Google');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingSubmit = async () => {
    if (!onboardingData.year || !onboardingData.branch) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await updateUserProfile(auth.currentUser.uid, onboardingData);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          py: 4
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h4" gutterBottom>
                Welcome to Progresso
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to continue your learning journey
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Google />}
                onClick={handleGoogleSignIn}
                disabled={loading}
                sx={{ mb: 2 }}
              >
                Sign in with Google
              </Button>
            </motion.div>
          </Paper>
        </motion.div>
      </Box>

      {/* Onboarding Dialog */}
      <Dialog open={showOnboarding} onClose={() => {}} maxWidth="sm" fullWidth>
        <DialogTitle>Complete Your Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              select
              fullWidth
              label="Year"
              value={onboardingData.year}
              onChange={(e) => setOnboardingData(prev => ({ ...prev, year: e.target.value }))}
              sx={{ mb: 2 }}
            >
              {['1st', '2nd', '3rd', '4th'].map((year) => (
                <MenuItem key={year} value={year}>
                  {year} Year
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              label="Branch"
              value={onboardingData.branch}
              onChange={(e) => setOnboardingData(prev => ({ ...prev, branch: e.target.value }))}
            >
              {['Computer Science', 'Information Technology', 'Electronics', 'Mechanical'].map((branch) => (
                <MenuItem key={branch} value={branch}>
                  {branch}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleOnboardingSubmit}
            variant="contained"
            disabled={loading}
          >
            Complete Profile
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Login; 