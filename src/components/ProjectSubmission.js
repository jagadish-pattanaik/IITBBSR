import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import { GitHub } from '@mui/icons-material';
import { motion } from 'framer-motion';

const ProjectSubmission = ({ open, onClose, onSubmit, loading }) => {
  const [githubLink, setGithubLink] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!githubLink.includes('github.com')) {
      setError('Please enter a valid GitHub repository URL');
      return;
    }
    onSubmit(githubLink);
    setGithubLink('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Submit Project</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            label="GitHub Repository URL"
            value={githubLink}
            onChange={(e) => setGithubLink(e.target.value)}
            placeholder="https://github.com/username/repository"
            InputProps={{
              startAdornment: <GitHub sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
          >
            Submit Project
          </Button>
        </motion.div>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectSubmission; 