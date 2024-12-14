import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFirebase } from '../hooks/useFirebase';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Grid,
  IconButton,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { Timer, Flag, NavigateNext, NavigateBefore, CheckCircle, RadioButtonUnchecked, Preview } from '@mui/icons-material';
import Header from '../components/Header';
import BackButton from '../components/BackButton';

const QuizPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getQuizWithQuestions, submitQuizAttempt, getUserQuizAttempts } = useFirebase();
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [timeWarningType, setTimeWarningType] = useState('');
  const [userAttempts, setUserAttempts] = useState({});

  // Fetch quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const [quizData, attemptsData] = await Promise.all([
          getQuizWithQuestions(quizId),
          getUserQuizAttempts(currentUser.uid)
        ]);

        if (!quizData) {
          setError('Quiz not found');
          return;
        }

        // Check if quiz is expired
        if (new Date(quizData.endTime) < new Date()) {
          setError('This quiz has expired');
          return;
        }

        // Check for existing attempt
        if (attemptsData[quizId]) {
          setHasAttempted(true);
          setUserAttempts(attemptsData);
          return;
        }

        setQuiz(quizData);
        setTimeLeft(quizData.duration * 60);
      } catch (error) {
        console.error('Error fetching quiz:', error);
        setError('Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId, currentUser.uid]);

  // Timer countdown
  useEffect(() => {
    if (!quizStarted || !timeLeft) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        // Time warnings
        const minutes = Math.floor(prev / 60);
        if (minutes === 5 && prev % 60 === 0) {
          setTimeWarningType('five');
          setShowTimeWarning(true);
        } else if (minutes === 1 && prev % 60 === 0) {
          setTimeWarningType('one');
          setShowTimeWarning(true);
        } else if (minutes === 0 && prev === 30) {
          setTimeWarningType('thirty');
          setShowTimeWarning(true);
        }

        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, timeLeft]);

  const handleStartQuiz = () => {
    setQuizStarted(true);
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmitQuiz = async () => {
    try {
      setLoading(true);
      const timeSpent = (quiz.duration * 60) - timeLeft;
      
      await submitQuizAttempt({
        quizId,
        userId: currentUser.uid,
        answers,
        timeSpent,
        submittedAt: new Date()
      });

      navigate(`/quiz/${quizId}/result`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setError('Failed to submit quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleFlagQuestion = (index) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleReviewQuestion = (index) => {
    setCurrentQuestion(index);
    setShowReview(false);
  };

  const renderConfirmDialog = () => {
    const answeredCount = Object.keys(answers).length;
    const totalQuestions = quiz.questions.length;
    const flaggedCount = flaggedQuestions.size;
    const unansweredCount = totalQuestions - answeredCount;

    return (
      <Dialog 
        open={showConfirmSubmit} 
        onClose={() => setShowConfirmSubmit(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" component="div">
            Submit Quiz?
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" paragraph>
              Please review your attempt summary before submitting:
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle color="success" />
                <Typography>
                  Answered Questions: {answeredCount} of {totalQuestions}
                </Typography>
              </Box>
              {unansweredCount > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <RadioButtonUnchecked color="error" />
                  <Typography color="error.main">
                    Unanswered Questions: {unansweredCount}
                  </Typography>
                </Box>
              )}
              {flaggedCount > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Flag color="warning" />
                  <Typography color="warning.main">
                    Flagged Questions: {flaggedCount}
                  </Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Timer color="info" />
                <Typography>
                  Time Remaining: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </Typography>
              </Box>
            </Stack>
          </Box>
          <Alert severity={unansweredCount > 0 ? "warning" : "info"} sx={{ mt: 2 }}>
            {unansweredCount > 0 
              ? "You have unanswered questions. Are you sure you want to submit?"
              : "Once submitted, you cannot change your answers."}
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setShowConfirmSubmit(false)}
            startIcon={<Preview />}
          >
            Review Again
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleSubmitQuiz}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Submitting...' : 'Submit Quiz'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const renderTimeWarningDialog = () => {
    const warningMessages = {
      five: {
        title: '5 Minutes Remaining',
        message: 'You have 5 minutes left to complete the quiz. Please review your answers and submit soon.',
        severity: 'info'
      },
      one: {
        title: '1 Minute Remaining',
        message: 'Only 1 minute remaining! Please submit your quiz now.',
        severity: 'warning'
      },
      thirty: {
        title: '30 Seconds Remaining',
        message: 'Quiz will be automatically submitted in 30 seconds!',
        severity: 'error'
      }
    };

    const warning = warningMessages[timeWarningType];

    return (
      <Dialog
        open={showTimeWarning}
        onClose={() => setShowTimeWarning(false)}
        PaperProps={{
          elevation: 3,
          sx: {
            borderLeft: 6,
            borderColor: `${warning?.severity}.main`
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          color: `${warning?.severity}.main`
        }}>
          <Timer />
          {warning?.title}
        </DialogTitle>
        <DialogContent>
          <Alert severity={warning?.severity} sx={{ mt: 1 }}>
            {warning?.message}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowTimeWarning(false)}
            color={warning?.severity}
          >
            Continue Quiz
          </Button>
          <Button
            variant="contained"
            color={warning?.severity}
            onClick={() => setShowConfirmSubmit(true)}
          >
            Submit Now
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 12, mb: 4 }}>
          <BackButton />
          <Alert severity="error">{error}</Alert>
        </Container>
      </Box>
    );
  }

  if (!quizStarted) {
    return (
      <Box>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 12, mb: 4 }}>
          <BackButton />
          <Paper sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>{quiz.title}</Typography>
            <Typography variant="body1" paragraph>{quiz.description}</Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1">
                • Duration: {quiz.duration} minutes
              </Typography>
              <Typography variant="subtitle1">
                • Total Questions: {quiz.questions.length}
              </Typography>
              <Typography variant="subtitle1">
                • Total Points: {quiz.totalPoints}
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="large"
              onClick={handleStartQuiz}
            >
              Start Quiz
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  if (hasAttempted) {
    return <Navigate to={`/quiz/${quizId}/result/${userAttempts[quizId].id}`} />;
  }

  const currentQuestionData = quiz.questions[currentQuestion];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Box sx={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1100,
        bgcolor: 'background.paper',
        boxShadow: 1
      }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Typography variant="h6">
              Question {currentQuestion + 1}/{quiz.questions.length}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <IconButton 
                onClick={() => handleFlagQuestion(currentQuestion)}
                color={flaggedQuestions.has(currentQuestion) ? 'warning' : 'default'}
              >
                <Flag />
              </IconButton>
              <IconButton onClick={() => setShowReview(true)}>
                <Preview />
              </IconButton>
              <Typography 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  color: timeLeft <= 60 ? 'error.main' : 
                         timeLeft <= 300 ? 'warning.main' : 
                         'text.primary'
                }}
              >
                <Timer color={timeLeft <= 60 ? 'error' : 
                              timeLeft <= 300 ? 'warning' : 
                              'inherit'} />
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </Typography>
            </Stack>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={(currentQuestion + 1) / quiz.questions.length * 100} 
          />
          <Box sx={{ mt: 1, px: 2 }}>
            <Grid container spacing={1}>
              {quiz.questions.map((_, index) => (
                <Grid item key={index}>
                  <Badge
                    color="warning"
                    variant="dot"
                    invisible={!flaggedQuestions.has(index)}
                  >
                    <IconButton
                      size="small"
                      onClick={() => setCurrentQuestion(index)}
                      sx={{
                        bgcolor: index === currentQuestion ? 'primary.main' : 
                                answers[quiz.questions[index].id] ? 'success.light' : 
                                'action.disabled',
                        color: 'white',
                        '&:hover': {
                          bgcolor: index === currentQuestion ? 'primary.dark' : 
                                  answers[quiz.questions[index].id] ? 'success.main' : 
                                  'action.hover'
                        }
                      }}
                    >
                      {index + 1}
                    </IconButton>
                  </Badge>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 12, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom>
            {currentQuestionData.text}
          </Typography>

          <RadioGroup
            value={answers[currentQuestionData.id] || ''}
            onChange={(e) => handleAnswer(currentQuestionData.id, e.target.value)}
          >
            {currentQuestionData.options.map((option, index) => (
              <FormControlLabel
                key={index}
                value={option.text}
                control={<Radio />}
                label={option.text}
                sx={{ mb: 1 }}
              />
            ))}
          </RadioGroup>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              startIcon={<NavigateBefore />}
              onClick={() => setCurrentQuestion(prev => prev - 1)}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            {currentQuestion === quiz.questions.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setShowConfirmSubmit(true)}
              >
                Submit Quiz
              </Button>
            ) : (
              <Button
                endIcon={<NavigateNext />}
                variant="contained"
                onClick={() => setCurrentQuestion(prev => prev + 1)}
              >
                Next
              </Button>
            )}
          </Box>
        </Paper>
      </Container>

      {renderConfirmDialog()}

      <Drawer
        anchor="right"
        open={showReview}
        onClose={() => setShowReview(false)}
      >
        <Box sx={{ width: 350, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Question Review
          </Typography>
          <List>
            {quiz.questions.map((question, index) => (
              <ListItem 
                key={index}
                disablePadding
                secondaryAction={
                  flaggedQuestions.has(index) && (
                    <Flag color="warning" />
                  )
                }
              >
                <ListItemButton onClick={() => handleReviewQuestion(index)}>
                  <ListItemIcon>
                    {answers[question.id] ? (
                      <CheckCircle color="success" />
                    ) : (
                      <RadioButtonUnchecked color="action" />
                    )}
                  </ListItemIcon>
                  <ListItemText 
                    primary={`Question ${index + 1}`}
                    secondary={question.text.substring(0, 50) + '...'}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={() => setShowConfirmSubmit(true)}
            sx={{ mt: 2 }}
          >
            Submit Quiz
          </Button>
        </Box>
      </Drawer>

      {renderTimeWarningDialog()}
    </Box>
  );
};

export default QuizPage; 