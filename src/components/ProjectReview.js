import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Link,
  Tooltip,
  Button,
  Stack,
  TextField
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  GitHub,
  OpenInNew,
  Search
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';

const ProjectReview = ({ submissions, onReview }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredSubmissions = useMemo(() => {
    return submissions.filter(sub => {
      const matchesSearch = sub.userName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [submissions, searchTerm, statusFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return {
          chip: 'warning',
          bg: 'warning.lighter',
          color: 'warning.dark'
        };
      case 'approved':
        return {
          chip: 'success',
          bg: 'success.lighter',
          color: 'success.dark'
        };
      case 'rejected':
        return {
          chip: 'error',
          bg: 'error.lighter',
          color: 'error.dark'
        };
      default:
        return {
          chip: 'default',
          bg: 'grey.100',
          color: 'text.secondary'
        };
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Stack spacing={2}>
          <TextField
            fullWidth
            placeholder="Search by student name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />
            }}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant={statusFilter === 'all' ? 'contained' : 'outlined'}
              onClick={() => setStatusFilter('all')}
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'pending' ? 'contained' : 'outlined'}
              color="warning"
              onClick={() => setStatusFilter('pending')}
            >
              Pending
            </Button>
            <Button
              variant={statusFilter === 'approved' ? 'contained' : 'outlined'}
              color="success"
              onClick={() => setStatusFilter('approved')}
            >
              Approved
            </Button>
            <Button
              variant={statusFilter === 'rejected' ? 'contained' : 'outlined'}
              color="error"
              onClick={() => setStatusFilter('rejected')}
            >
              Rejected
            </Button>
          </Box>
        </Stack>
      </Box>

      <Typography variant="h6" gutterBottom>
        Project Submissions
      </Typography>
      <List>
        {filteredSubmissions.map((submission) => {
          const statusColor = getStatusColor(submission.status);
          
          return (
            <motion.div
              key={submission.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ListItem
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 2,
                  mb: 2,
                  bgcolor: statusColor.bg,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: 2,
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {submission.userName}
                      </Typography>
                      <Chip
                        label={submission.status.toUpperCase()}
                        color={statusColor.chip}
                        size="small"
                        sx={{ 
                          ml: 2,
                          fontWeight: 600,
                          letterSpacing: '0.5px'
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Project: <strong>{submission.projectTitle}</strong>
                      </Typography>
                      <Button
                        component={Link}
                        href={submission.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={<GitHub />}
                        endIcon={<OpenInNew />}
                        variant="outlined"
                        size="small"
                        sx={{ mt: 1 }}
                      >
                        View Repository
                      </Button>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Approve">
                      <span>
                        <IconButton
                          color="success"
                          onClick={() => onReview(submission.id, 'approved')}
                          disabled={submission.status !== 'pending'}
                          sx={{
                            bgcolor: 'success.lighter',
                            '&:hover': {
                              bgcolor: 'success.light'
                            }
                          }}
                        >
                          <CheckCircle />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Reject">
                      <span>
                        <IconButton
                          color="error"
                          onClick={() => onReview(submission.id, 'rejected')}
                          disabled={submission.status !== 'pending'}
                          sx={{
                            bgcolor: 'error.lighter',
                            '&:hover': {
                              bgcolor: 'error.light'
                            }
                          }}
                        >
                          <Cancel />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            </motion.div>
          );
        })}
        {filteredSubmissions.length === 0 && (
          <Box 
            sx={{ 
              textAlign: 'center', 
              py: 4,
              bgcolor: 'background.default',
              borderRadius: 2
            }}
          >
            <Typography variant="body1" color="text.secondary">
              No pending submissions
            </Typography>
          </Box>
        )}
      </List>
    </Paper>
  );
};

export default ProjectReview; 