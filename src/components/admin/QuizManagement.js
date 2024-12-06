import { useState, useEffect } from 'react';
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
  DialogActions,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Save,
  Close,
  Refresh,
  Link as LinkIcon
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
    duration: ''
  });

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

  const handleDelete = async (quizId) => {
    try {
      await deleteQuiz(quizId);
      setDataFetched(false); // Refresh list after deletion
    } catch (error) {
      console.error('Error deleting quiz:', error);
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
        duration: ''
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
      duration: ''
    });
  };

  const handleSubmit = async () => {
    try {
      if (selectedQuiz) {
        await updateQuiz(selectedQuiz.id, formData);
      } else {
        await createQuiz(formData);
      }
      handleCloseDialog();
      setDataFetched(false); // Refresh list
    } catch (error) {
      console.error('Error saving quiz:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Quiz Management</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
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
            {quizzes.map((quiz) => (
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
                          label={`${quiz.duration} mins`} 
                          size="small" 
                        />
                        <Chip 
                          label={new Date(quiz.endTime).toLocaleDateString()} 
                          size="small"
                          color={new Date(quiz.endTime) > new Date() ? "success" : "error"}
                        />
                      </Stack>
                    </CardContent>
                    <Divider />
                    <CardActions>
                      <Tooltip title="Edit Quiz">
                        <IconButton onClick={() => handleOpenDialog(quiz)}>
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
                          onClick={() => handleDelete(quiz.id)}
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
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="End Time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Duration (minutes)"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<Close />}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            startIcon={<Save />}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuizManagement; 