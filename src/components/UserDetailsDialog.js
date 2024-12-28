import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box
} from '@mui/material';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { BRANCHES } from '../utils/constants';

const UserDetailsDialog = ({ open, userId, onClose }) => {
  const [branch, setBranch] = useState('');
  const [graduatingYear, setGraduatingYear] = useState('');
  const [loading, setLoading] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 8 }, (_, i) => currentYear - 1 + i);

  const handleSubmit = async () => {
    if (!branch || !graduatingYear) return;

    try {
      setLoading(true);
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        branch,
        graduatingYear: parseInt(graduatingYear)
      });
      
      setBranch('');
      setGraduatingYear('');
      onClose();
    } catch (error) {
      console.error('Error updating user details:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      disableEscapeKeyDown
      PaperProps={{
        sx: { minWidth: 300 }
      }}
    >
      <DialogTitle>Complete Your Profile</DialogTitle>
      <DialogContent>
        <Box sx={{ my: 2 }}>
          <Typography gutterBottom>
            Please provide your academic details to continue:
          </Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Branch</InputLabel>
            <Select
              value={branch}
              label="Branch"
              onChange={(e) => setBranch(e.target.value)}
              disabled={loading}
            >
              {BRANCHES.map((b) => (
                <MenuItem key={b} value={b}>{b}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Graduating Year</InputLabel>
            <Select
              value={graduatingYear}
              label="Graduating Year"
              onChange={(e) => setGraduatingYear(e.target.value)}
              disabled={loading}
            >
              {years.map((year) => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
          variant="contained"
          onClick={handleSubmit}
          disabled={!branch || !graduatingYear || loading}
          fullWidth
          sx={{ mx: 2, mb: 2 }}
        >
          {loading ? 'Saving...' : 'Continue'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserDetailsDialog; 