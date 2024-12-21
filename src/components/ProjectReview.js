import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  TextField,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Link,
  TablePagination,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  CheckCircle,
  Cancel,
  GitHub,
  OpenInNew,
  AccessTime,
  Person,
  School,
  Search,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const ReviewCard = styled(Paper)(({ theme, status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'approved': return theme.palette.success;
      case 'rejected': return theme.palette.error;
      case 'pending': return theme.palette.warning;
      default: return theme.palette.primary;
    }
  };

        return {
    padding: theme.spacing(1.5),
    marginBottom: theme.spacing(1.5),
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${getStatusColor().main}`,
    backgroundColor: theme.palette.background.paper,
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '4px',
      height: '100%',
      background: getStatusColor().main,
    },
  };
});

const StatusChip = styled(Chip)(({ theme, status }) => {
  const getColor = () => {
    switch (status) {
      case 'approved': return theme.palette.success;
      case 'rejected': return theme.palette.error;
      case 'pending': return theme.palette.warning;
      default: return theme.palette.primary;
    }
  };

  return {
    backgroundColor: getColor().main + '20',
    color: getColor().main,
    border: `1px solid ${getColor().main}`,
    fontWeight: 500,
    size: 'small',
    '& .MuiChip-label': {
      fontSize: '0.75rem',
    },
  };
});

const ActionButton = styled(Button)(({ theme }) => ({
  minWidth: 100,
  padding: theme.spacing(0.5, 2),
  '& .MuiSvgIcon-root': {
    fontSize: '1.2rem',
  },
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  height: '100%',
  '& .MuiTypography-h5': {
    fontSize: '1.5rem',
    fontWeight: 600,
  },
}));

const FilterBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  '& .MuiTextField-root, & .MuiFormControl-root': {
    backgroundColor: theme.palette.background.paper,
  },
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius,
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.background.paper,
    },
  },
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
  },
}));

const ProjectReview = ({ submissions, onReview }) => {
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleReview = (status) => {
    onReview(selectedSubmission.id, status, feedback);
    setShowDialog(false);
    setFeedback('');
    setSelectedSubmission(null);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredSubmissions = submissions
    .filter(submission => {
      const matchesSearch = (submission.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           submission.courseTitle?.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = filterStatus === 'all' || submission.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return b.submittedAt?.seconds - a.submittedAt?.seconds;
      }
      return a.projectTitle?.localeCompare(b.projectTitle);
    });

  return (
    <Box>
      <FilterBar>
          <TextField
          size="small"
          placeholder="Search by project or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1 }}
            InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small">
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            label="Sort By"
          >
            <MenuItem value="date">Latest First</MenuItem>
            <MenuItem value="project">Project Name</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small">
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            label="Status"
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Needs Revision</MenuItem>
          </Select>
        </FormControl>
      </FilterBar>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={4}>
          <StatsCard>
            <Typography color="text.secondary" variant="body2">
              Pending
            </Typography>
            <Typography variant="h5" color="warning.main">
              {submissions.filter(s => s.status === 'pending').length}
            </Typography>
          </StatsCard>
        </Grid>
        <Grid item xs={4}>
          <StatsCard>
            <Typography color="text.secondary" variant="body2">
              Approved
            </Typography>
            <Typography variant="h5" color="success.main">
              {submissions.filter(s => s.status === 'approved').length}
            </Typography>
          </StatsCard>
        </Grid>
        <Grid item xs={4}>
          <StatsCard>
            <Typography color="text.secondary" variant="body2">
              Needs Revision
            </Typography>
            <Typography variant="h5" color="error.main">
              {submissions.filter(s => s.status === 'rejected').length}
      </Typography>
          </StatsCard>
        </Grid>
      </Grid>

        <Box sx={{ 
        '& .project-card': {
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateX(4px)',
            backgroundColor: theme => theme.palette.action.hover,
          },
        }
      }}>
        <AnimatePresence>
          {filteredSubmissions
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((submission) => (
              <motion.div
                key={submission.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="project-card"
              >
                <ReviewCard status={submission.status}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                      <Typography 
                        variant="subtitle1"
                        gutterBottom
                        sx={{ fontWeight: 500 }}
                      >
                        {submission.projectTitle}
                        </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ mb: 1 }}
                      >
                        {submission.courseTitle}
                        </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Link
                          href={submission.githubLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1,
                            color: 'text.primary',
                            textDecoration: 'none',
                            '&:hover': {
                              color: 'primary.main',
                            },
                          }}
                        >
                          <GitHub fontSize="small" />
                          View Project
                          <OpenInNew sx={{ fontSize: 14, ml: 0.5 }} />
                        </Link>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccessTime fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            Submitted: {formatDate(submission.submittedAt)}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <StatusChip
                        status={submission.status}
                        label={submission.status.toUpperCase()}
                        sx={{ mb: 1 }}
                      />
                      {submission.status === 'pending' && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                          <ActionButton
                            variant="outlined"
                            color="error"
                            startIcon={<Cancel />}
                            onClick={() => {
                              setSelectedSubmission(submission);
                              setShowDialog(true);
                            }}
                          >
                            Reject
                          </ActionButton>
                          <ActionButton
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircle />}
                            onClick={() => onReview(submission.id, 'approved')}
                          >
                            Approve
                          </ActionButton>
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                  {(submission.status === 'approved' || submission.status === 'rejected') && (
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                            sx={{
                        display: 'block',
                        mt: 1,
                        textAlign: 'right',
                      }}
                    >
                      {submission.status === 'approved' ? 'Approved' : 'Rejected'} by {submission.reviewedBy?.name || 'Admin'}
                      {submission.reviewedAt && ` • ${formatDate(submission.reviewedAt)}`}
                    </Typography>
                  )}
                </ReviewCard>
              </motion.div>
            ))}
        </AnimatePresence>
      </Box>

      <TablePagination
        component="div"
        count={filteredSubmissions.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />

      <Dialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Provide Feedback</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Enter feedback for the student..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleReview('rejected')}
          >
            Submit Feedback
          </Button>
        </DialogActions>
      </Dialog>
        </Box>
  );
};

export default ProjectReview; 