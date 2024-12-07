import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  Divider,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Save,
  Close,
  Refresh,
  Link as LinkIcon,
  Search
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useFirebase } from '../../hooks/useFirebase';

const QuizManagement = () => {
  const { createQuiz, updateQuiz, deleteQuiz, getQuizzes } = useFirebase();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [dataFetched, setDataFetched] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    endTime: '',
    duration: '',
    level: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);

  const DIFFICULTY_LEVELS = [
    { value: 'Beginner', label: 'Beginner' },
    { value: 'Intermediate', label: 'Intermediate' },
    { value: 'Advanced', label: 'Advanced' }
  ];

  useEffect(() => {
    const fetchQuizzes = async () => {
      if (dataFetched) return;

      try {
        setLoading(true);
        const quizzesData = await getQuizzes();
        setQuizzes(quizzesData || []);
        setDataFetched(true);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [getQuizzes, dataFetched]);

  const handleRefresh = () => {
    setDataFetched(false);
  };

  const handleDeleteClick = (quiz) => {
    setQuizToDelete(quiz);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!quizToDelete) return;

    try {
      setLoading(true);
      console.log('Deleting quiz:', quizToDelete.id);
      await deleteQuiz(quizToDelete.id);
      setDataFetched(false); // Refresh list
      setDeleteConfirmOpen(false);
      setQuizToDelete(null);
    } catch (error) {
      console.error('Error deleting quiz:', error);
      alert('Failed to delete quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (quiz = null) => {
    if (quiz) {
      setFormData({
        ...quiz,
        endTime: new Date(quiz.endTime).toISOString().slice(0, 16)
      });
      setSelectedQuiz(quiz);
    } else {
      setFormData({
        title: '',
        description: '',
        link: '',
        endTime: '',
        duration: '',
        level: ''
      });
      setSelectedQuiz(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedQuiz(null);
    setFormData({
      title: '',
      description: '',
      link: '',
      endTime: '',
      duration: '',
      level: ''
    });
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.link || !formData.endTime || !formData.duration || !formData.level) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const quizData = {
        ...formData,
        duration: Number(formData.duration),
        updatedAt: new Date().toISOString()
      };

      if (selectedQuiz?.id) {
        console.log('Updating quiz:', selectedQuiz.id, quizData);
        await updateQuiz(selectedQuiz.id, quizData);
      } else {
        console.log('Creating new quiz:', quizData);
        await createQuiz({
          ...quizData,
          createdAt: new Date().toISOString()
        });
      }
      setDataFetched(false); // Refresh list
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving quiz:', error);
      alert('Failed to save quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter quizzes
  const filteredQuizzes = useMemo(() => {
    return quizzes.filter(quiz => {
      const isActive = new Date(quiz.endTime) > new Date();
      const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'active' && isActive) ||
                          (statusFilter === 'expired' && !isActive);
      const matchesLevel = levelFilter === 'all' || quiz.level === levelFilter;
      return matchesSearch && matchesStatus && matchesLevel;
    });
  }, [quizzes, searchTerm, statusFilter, levelFilter]);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Stack spacing={2}>
          <TextField
            fullWidth
            placeholder="Search quizzes by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />
            }}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Quizzes</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="expired">Expired</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Level</InputLabel>
              <Select
                value={levelFilter}
                label="Level"
                onChange={(e) => setLevelFilter(e.target.value)}
              >
                <MenuItem value="all">All Levels</MenuItem>
                {DIFFICULTY_LEVELS.map((level) => (
                  <MenuItem key={level.value} value={level.value}>
                    {level.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              Add Quiz
            </Button>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ position: 'relative', minHeight: '200px' }}>
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 2
            }}
          >
            <CircularProgress />
          </Box>
        )}

        <Box sx={{ opacity: loading ? 0.5 : 1, transition: 'opacity 0.3s' }}>
          <Grid container spacing={3}>
            {filteredQuizzes.map((quiz) => (
              <Grid item xs={12} sm={6} md={4} key={quiz.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {quiz.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {quiz.description}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Chip 
                          label={quiz.level || 'No Level'} 
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        <Chip
                          label={new Date(quiz.endTime) > new Date() ? 'Active' : 'Expired'}
                          color={new Date(quiz.endTime) > new Date() ? 'success' : 'error'}
                          size="small"
                        />
                        <Chip
                          label={`${quiz.duration} mins`}
                          size="small"
                          color="secondary"
                        />
                      </Stack>
                    </CardContent>
                    <Divider />
                    <CardActions>
                      <Tooltip title="Edit Quiz">
                        <IconButton 
                          onClick={() => handleOpenDialog(quiz)}
                          disabled={loading}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Open Quiz Link">
                        <IconButton 
                          onClick={() => window.open(quiz.link, '_blank')}
                          color="primary"
                        >
                          <LinkIcon />
                        </IconButton>
                      </Tooltip>
                      <Box sx={{ flexGrow: 1 }} />
                      <Tooltip title="Delete Quiz">
                        <IconButton 
                          color="error"
                          onClick={() => handleDeleteClick(quiz)}
                          disabled={loading}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </CardActions>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: 2,
            minWidth: '400px'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Delete color="error" />
            Confirm Deletion
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the quiz "{quizToDelete?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            variant="outlined"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Delete />}
          >
            Delete Quiz
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedQuiz ? 'Edit Quiz' : 'Add New Quiz'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Quiz Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <TextField
              fullWidth
              label="Quiz Link"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            />
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="End Time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Duration (minutes)"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  InputProps={{
                    inputProps: { min: 1 }
                  }}
                />
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth>
                  <InputLabel>Level</InputLabel>
                  <Select
                    value={formData.level || ''}
                    label="Level"
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  >
                    {DIFFICULTY_LEVELS.map((level) => (
                      <MenuItem key={level.value} value={level.value}>
                        {level.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDialog} 
            startIcon={<Close />}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
            disabled={loading}
          >
            {selectedQuiz ? 'Update Quiz' : 'Create Quiz'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuizManagement; 