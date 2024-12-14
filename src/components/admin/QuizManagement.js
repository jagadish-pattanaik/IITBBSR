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
  MenuItem,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Radio,
  RadioGroup,
  FormControlLabel
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Save,
  Close,
  Link,
  Search,
  Refresh
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useFirebase } from '../../hooks/useFirebase';
import QuestionDialog from './QuestionDialog';
import { useAuth } from '../../contexts/AuthContext';
import { serverTimestamp } from 'firebase/firestore';

const QuizManagement = () => {
  const { currentUser } = useAuth();
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
    level: '',
    type: 'internal',
    createdBy: {
      id: currentUser?.uid,
      name: currentUser?.displayName
    }
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [dialogTab, setDialogTab] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    text: '',
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ],
    points: 1
  });
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [quizType, setQuizType] = useState('internal');
  const [fetchingData, setFetchingData] = useState(false);

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
        alert('Failed to load quizzes. Please try again.');
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
      await deleteQuiz(quizToDelete.id);
      setQuizzes(prev => prev.filter(q => q.id !== quizToDelete.id));
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
      setQuestions(quiz.questions || []);
    } else {
      setFormData({
        title: '',
        description: '',
        link: '',
        endTime: '',
        duration: '',
        level: '',
        type: 'internal',
        createdBy: {
          id: currentUser?.uid,
          name: currentUser?.displayName
        }
      });
      setSelectedQuiz(null);
      setQuestions([]);
    }
    setOpenDialog(true);
    setDialogTab(0);
  };

  const handleCloseDialog = () => {
    if (loading) return;
    
    setOpenDialog(false);
    setSelectedQuiz(null);
    setQuestions([]);
    setDialogTab(0);
    
    // Reset form data after a small delay
    setTimeout(() => {
      setFormData({
        title: '',
        description: '',
        link: '',
        endTime: '',
        duration: '',
        level: '',
        type: 'internal',
        createdBy: {
          id: currentUser?.uid,
          name: currentUser?.displayName
        }
      });
    }, 50);
  };

  const handleSubmit = async () => {
    // Validate common fields
    if (!formData.title || !formData.description || !formData.endTime || 
        !formData.duration || !formData.level) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate type-specific fields
    if (formData.type === 'external' && !formData.link) {
      alert('Please provide the external quiz link');
      return;
    }

    if (formData.type === 'internal' && (!questions || questions.length === 0)) {
      alert('Please add at least one question');
      return;
    }

    try {
      setLoading(true);
      const quizData = {
        ...formData,
        questions: formData.type === 'internal' ? questions : [],
        duration: Number(formData.duration),
        createdBy: {
          id: currentUser.uid,
          name: currentUser.displayName
        }
      };

      if (selectedQuiz?.id) {
        const updatedQuiz = await updateQuiz(selectedQuiz.id, quizData);
        setQuizzes(prev => prev.map(q => 
          q.id === selectedQuiz.id ? updatedQuiz : q
        ));
      } else {
        const newQuiz = await createQuiz(quizData);
        setQuizzes(prev => [...prev, newQuiz]);
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Error saving quiz:', error);
      alert('Failed to save quiz: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = (questionData) => {
    setQuestions([...questions, questionData]);
  };

  const handleEditQuestion = (index) => {
    const questionToEdit = {
      ...questions[index],
      // Ensure all required fields exist
      options: questions[index].options || [],
      caseSensitive: questions[index].caseSensitive || false,
      tolerance: questions[index].tolerance || 0.01,
      answer: questions[index].answer || ''
    };
    setEditingQuestionIndex(index);
    setShowQuestionDialog(true);
    // Pass the full question data to the dialog
    setCurrentQuestion(questionToEdit);
  };

  const handleDeleteQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSaveQuestion = (questionData) => {
    if (editingQuestionIndex !== null) {
      // Update existing question
      const newQuestions = [...questions];
      newQuestions[editingQuestionIndex] = questionData;
      setQuestions(newQuestions);
      setEditingQuestionIndex(null);
    } else {
      // Add new question
      setQuestions([...questions, questionData]);
    }
    setShowQuestionDialog(false);
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

  // Dialog content with tabs
  const renderDialogContent = () => (
    <>
      <Tabs 
        value={dialogTab} 
        onChange={(e, newValue) => setDialogTab(newValue)}
      >
        <Tab label="Basic Info" />
        {formData.type === 'internal' && <Tab label="Questions" />}
      </Tabs>

      {dialogTab === 0 ? (
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
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Quiz Type</InputLabel>
              <Select
                value={formData.type}
                label="Quiz Type"
                onChange={(e) => {
                  setFormData({ 
                    ...formData, 
                    type: e.target.value,
                    // Reset questions if switching from internal to external
                    questions: e.target.value === 'external' ? [] : formData.questions
                  });
                  // Reset to first tab if switching to external
                  if (e.target.value === 'external') {
                    setDialogTab(0);
                  }
                }}
              >
                <MenuItem value="internal">Internal Quiz</MenuItem>
                <MenuItem value="external">External Link</MenuItem>
              </Select>
            </FormControl>

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

            {formData.type === 'external' && (
              <TextField
                fullWidth
                label="External Quiz Link"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                helperText="Users will be redirected to this link"
              />
            )}
          </Box>
        </DialogContent>
      ) : (
        formData.type === 'internal' && (
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6">Questions</Typography>
            <List>
              {questions.map((question, index) => (
                <ListItem key={index}>
                  <ListItemText 
                    primary={question.text}
                    secondary={`${question.points} points`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton onClick={() => handleEditQuestion(index)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteQuestion(index)}>
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={() => setShowQuestionDialog(true)}
            >
              Add Question
            </Button>
          </Box>
        </DialogContent>
        )
      )}
    </>
  );

  return (
    <Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
              <Typography variant="h4">
                Quiz Management
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
              >
                Create Quiz
              </Button>
            </Box>

            {/* Search and filters */}
            <Box sx={{ mb: 4 }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    placeholder="Search quizzes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />
                    }}
                  />
                  <FormControl>
                    <InputLabel>Level</InputLabel>
                    <Select
                      value={levelFilter}
                      label="Level"
                      onChange={(e) => setLevelFilter(e.target.value)}
                    >
                      <MenuItem value="all">All Levels</MenuItem>
                      {DIFFICULTY_LEVELS.map(level => (
                        <MenuItem key={level.value} value={level.value}>
                          {level.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Stack>
            </Box>

            {/* Quiz grid */}
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
                            <Link />
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

          {/* Dialogs */}
          <Dialog
            open={deleteConfirmOpen}
            onClose={() => setDeleteConfirmOpen(false)}
            maxWidth="xs"
            fullWidth
            PaperProps={{
              elevation: 3,
              sx: {
                borderRadius: 2,
                minWidth: '300px'
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

          <Dialog
            open={openDialog}
            onClose={loading ? undefined : handleCloseDialog}
            maxWidth="sm"
            fullWidth
            disableEscapeKeyDown={loading}
            PaperProps={{
              sx: {
                minHeight: '50vh',
                maxHeight: '80vh',
                overflow: 'auto'
              }
            }}
          >
            <DialogTitle>
              {selectedQuiz ? 'Edit Quiz' : 'Add New Quiz'}
            </DialogTitle>
            <DialogContent>
              {renderDialogContent()}
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={handleCloseDialog} 
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Save />}
              >
                {loading ? 'Saving...' : (selectedQuiz ? 'Update Quiz' : 'Create Quiz')}
              </Button>
            </DialogActions>
          </Dialog>

          <QuestionDialog
            open={showQuestionDialog}
            onClose={loading ? undefined : () => {
              setShowQuestionDialog(false);
              setEditingQuestionIndex(null);
            }}
            onSave={handleSaveQuestion}
            initialData={editingQuestionIndex !== null ? questions[editingQuestionIndex] : null}
            maxWidth="sm"
            loading={loading}
          />
        </>
      )}
    </Box>
  );
};

export default QuizManagement; 