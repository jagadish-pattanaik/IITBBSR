import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  IconButton,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Alert,
  TextField,
  CircularProgress
} from '@mui/material';
import {
  Timer,
  Flag,
  NavigateNext,
  NavigateBefore,
  CheckCircle,
  RadioButtonUnchecked,
  Preview,
  Send,
  InfoOutlined
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';
import { AnimatePresence } from 'framer-motion';
import { addDoc, collection, doc, serverTimestamp, updateDoc, getDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.paper,
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.background.paper,
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
        borderWidth: 2,
      },
    },
  },
  '& .MuiFormHelperText-root': {
    marginLeft: 0,
    marginTop: theme.spacing(1),
  },
}));

const QuestionDisplay = ({ question, userAnswer, onAnswer, showFeedback = false }) => {
  const handleTextAnswer = (value) => {
    if (question.type === 'number') {
      // Allow only numeric input including decimals and negative numbers
      const numValue = value.replace(/[^0-9.-]/g, '');
      // Prevent multiple decimal points
      const parts = numValue.split('.');
      if (parts.length > 2) return;
      // Prevent multiple negative signs
      if (numValue.split('-').length > 2) return;
      onAnswer(numValue);
    } else {
      onAnswer(value);
    }
  };

  switch (question.type) {
    case 'mcq':
    case 'boolean':
      return (
        <Box sx={{ mt: 3 }}>
          {question.options.map((option, index) => (
            <OptionButton
              key={index}
              fullWidth
              variant={userAnswer === option.text ? 'contained' : 'outlined'}
              onClick={() => onAnswer(option.text)}
              isSelected={userAnswer === option.text}
              sx={{ mb: 2 }}
            >
              {option.text}
            </OptionButton>
          ))}
        </Box>
      );

    case 'text':
      return (
        <Box sx={{ mt: 3 }}>
          <StyledTextField
          fullWidth
          multiline
            rows={4}
          variant="outlined"
          label="Your Answer"
          value={userAnswer || ''}
          onChange={(e) => handleTextAnswer(e.target.value)}
          placeholder="Type your answer here..."
            helperText={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {question.caseSensitive && (
                  <Typography 
                    variant="caption" 
                    color="warning.main"
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 0.5 
                    }}
                  >
                    <InfoOutlined fontSize="small" />
                    Answer is case-sensitive
                  </Typography>
                )}
              </Box>
            }
            InputProps={{
              sx: {
                fontFamily: 'monospace',
                minHeight: '100px',
                '& .MuiOutlinedInput-input': {
                  height: '100%',
                },
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: 'auto',
              },
            }}
          />
        </Box>
      );

    case 'number':
      return (
        <Box sx={{ mt: 3 }}>
          <StyledTextField
          fullWidth
            type="text" // Changed from "number" to allow better control
          variant="outlined"
          label="Your Answer"
          value={userAnswer || ''}
          onChange={(e) => handleTextAnswer(e.target.value)}
          placeholder="Enter a number..."
            helperText={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography 
                  variant="caption" 
                  color="info.main"
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.5 
                  }}
                >
                  <InfoOutlined fontSize="small" />
                  Tolerance: ±{question.tolerance * 100}%
                </Typography>
              </Box>
            }
            InputProps={{
              sx: {
                fontFamily: 'monospace',
                fontSize: '1.1rem',
                '& input': {
                  padding: '12px 14px',
                },
              },
            }}
            sx={{
              maxWidth: '300px',
            }}
          />
        </Box>
      );

    default:
      return <Typography color="error">Unsupported question type</Typography>;
  }
};

const QuestionPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(3),
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, 
      ${theme.palette.primary.main} var(--progress), 
      ${theme.palette.divider} var(--progress))`,
  },
}));

const OptionLabel = styled(FormControlLabel)(({ theme }) => ({
  width: '100%',
  margin: theme.spacing(1, 0),
  padding: theme.spacing(1.5, 2),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'light'
      ? 'rgba(208, 215, 222, 0.32)'
      : 'rgba(48, 54, 61, 0.48)',
  },
}));

const NavigationButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  marginTop: theme.spacing(4),
  '& .MuiButton-root': {
    minWidth: '120px',
  },
}));

const QuizContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
}));

const QuizHeader = styled(Box)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  zIndex: 1100,
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
  backdropFilter: 'blur(8px)',
  transition: 'all 0.3s ease',
}));

const QuestionCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: theme.palette.primary.main,
    opacity: 0.8,
  },
}));

const OptionButton = styled(Button)(({ theme, isSelected, isCorrect, isWrong }) => ({
  width: '100%',
  justifyContent: 'flex-start',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: isSelected 
    ? theme.palette.primary.main + '20'
    : theme.palette.background.paper,
  color: theme.palette.text.primary,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: isSelected 
      ? theme.palette.primary.main + '30'
      : theme.palette.action.hover,
    transform: 'translateX(4px)',
  },
  ...(isCorrect && {
    borderColor: theme.palette.success.main,
    backgroundColor: theme.palette.success.main + '20',
  }),
  ...(isWrong && {
    borderColor: theme.palette.error.main,
    backgroundColor: theme.palette.error.main + '20',
  }),
}));

const TimerDisplay = styled(Box)(({ theme, timeLeft }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1, 2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: timeLeft <= 60 
    ? theme.palette.error.main + '20'
    : timeLeft <= 300 
      ? theme.palette.warning.main + '20'
      : theme.palette.primary.main + '20',
  color: timeLeft <= 60 
    ? theme.palette.error.main
    : timeLeft <= 300 
      ? theme.palette.warning.main
      : theme.palette.primary.main,
  transition: 'all 0.3s ease',
}));

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 6,
  borderRadius: 3,
  backgroundColor: theme.palette.mode === 'light'
    ? theme.palette.grey[200]
    : theme.palette.grey[800],
  '.MuiLinearProgress-bar': {
    borderRadius: 3,
    backgroundImage: `linear-gradient(45deg, 
      ${theme.palette.primary.main}, 
      ${theme.palette.primary.light})`,
  },
}));

const QuestionContainer = styled(motion.div)({
  width: '100%',
});

const QuizTakingInterface = ({ quiz, onSubmit }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(quiz.duration * 60);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [showReview, setShowReview] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [timeWarningType, setTimeWarningType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  // Timer countdown
  useEffect(() => {
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
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-save answers periodically
  useEffect(() => {
    const saveToLocalStorage = () => {
      localStorage.setItem(`quiz_${quiz.id}_answers`, JSON.stringify(answers));
    };

    const interval = setInterval(saveToLocalStorage, 5000);
    return () => clearInterval(interval);
  }, [answers, quiz.id]);

  // Load saved answers on mount
  useEffect(() => {
    const savedAnswers = localStorage.getItem(`quiz_${quiz.id}_answers`);
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }
  }, [quiz.id]);

  const handleAnswer = (questionId, answer) => {
    const question = quiz.questions.find(q => q.id === questionId);
    if (!question) return;

    let validatedAnswer = answer;
    if (question.type === 'number') {
      const num = parseFloat(answer);
      if (isNaN(num)) return;
      validatedAnswer = num.toString();
    }

    setAnswers(prev => ({
      ...prev,
      [questionId]: validatedAnswer
    }));
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

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const submissionTime = new Date().toISOString();
      const currentTime = new Date();
      
      // Format answers for submission
      const formattedAnswers = {};
      Object.keys(answers).forEach(questionId => {
        formattedAnswers[questionId] = {
          answer: answers[questionId],
          timestamp: submissionTime
        };
      });

      // Calculate score
      let score = 0;
      quiz.questions.forEach(question => {
        const userAnswer = answers[question.id];
        if (question.type === 'mcq' || question.type === 'boolean') {
          const correctOption = question.options.find(opt => opt.isCorrect);
          if (correctOption && userAnswer === correctOption.text) {
            score += question.points || 1;
          }
        }
      });

      // Create submission document
      const submissionData = {
        quizId: quiz.id,
        userId: currentUser.uid,
        userName: currentUser.displayName,
        answers: formattedAnswers,
        timeSpent: quiz.duration * 60 - timeLeft,
        score,
        submittedAt: serverTimestamp(),
        totalPoints: quiz.totalPoints || quiz.questions.reduce((acc, q) => acc + (q.points || 1), 0)
      };

      const submissionRef = await addDoc(collection(db, 'quiz_submissions'), submissionData);

      // Update user's quiz attempts
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        [`quizAttempts.${quiz.id}`]: {
          submissionId: submissionRef.id,
          submittedAt: serverTimestamp(),
          score
        }
      });

      // Update quiz leaderboard
      const leaderboardRef = doc(db, 'quizLeaderboard', quiz.id);
      const leaderboardDoc = await getDoc(leaderboardRef);

      const leaderboardEntry = {
        userId: currentUser.uid,
        userName: currentUser.displayName,
        score,
        timeSpent: quiz.duration * 60 - timeLeft,
        submittedAt: submissionTime,
        timestamp: currentTime.getTime() // Use numeric timestamp for sorting
      };

      if (!leaderboardDoc.exists()) {
        // Create new leaderboard if it doesn't exist
        await setDoc(leaderboardRef, {
          entries: [leaderboardEntry],
          lastUpdated: serverTimestamp()
        });
      } else {
        // Get existing entries
        const existingEntries = leaderboardDoc.data().entries || [];
        
        // Remove any previous entry from this user
        const filteredEntries = existingEntries.filter(entry => entry.userId !== currentUser.uid);
        
        // Add new entry
        const newEntries = [...filteredEntries, leaderboardEntry]
          // Sort by score (descending) and time (ascending)
          .sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.timeSpent - b.timeSpent;
          })
          // Keep only top 100 entries
          .slice(0, 100);

        // Update leaderboard
        await updateDoc(leaderboardRef, {
          entries: newEntries,
          lastUpdated: serverTimestamp()
        });
      }

      // Clear local storage
      localStorage.removeItem(`quiz_${quiz.id}_answers`);

      // Call the onSubmit callback with the submission data
      onSubmit(submissionData);

    } catch (error) {
      console.error('Error submitting quiz:', error);
      setError('Failed to submit quiz. Please try again.');
    } finally {
      setLoading(false);
    }
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
                <Timer color={timeLeft <= 300 ? 'warning' : 'inherit'} />
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
        <DialogActions>
          <Button 
            onClick={() => setShowConfirmSubmit(false)}
            startIcon={<Preview />}
          >
            Review Again
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Send />}
          >
            {loading ? 'Submitting...' : 'Submit Quiz'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box>
      {/* Header with timer and navigation */}
      <Box sx={{ 
        position: 'sticky', 
        top: 0, 
        bgcolor: 'background.paper',
        zIndex: 1100,
        boxShadow: 1
      }}>
        <Box sx={{ 
          maxWidth: 'lg', 
          mx: 'auto', 
          px: 3,
          py: 2
        }}>
          <Box sx={{ 
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
                <Timer />
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </Typography>
            </Stack>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={(currentQuestion + 1) / quiz.questions.length * 100} 
            sx={{ mt: 2 }}
          />
          
          {/* Question Navigation Pills */}
          <Box sx={{ mt: 1, px: 2, overflowX: 'auto', display: 'flex', gap: 1 }}>
            {quiz.questions.map((_, index) => (
              <Badge
                key={index}
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
            ))}
          </Box>
        </Box>
      </Box>

      {/* Main Question Content */}
      <Box sx={{ maxWidth: 'lg', mx: 'auto', px: 3, py: 4 }}>
        <AnimatePresence mode="wait">
          <QuestionContainer
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <QuestionCard>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ 
                  fontWeight: 600,
                  color: 'text.primary',
                  mb: 3,
                }}
              >
            {quiz.questions[currentQuestion].text}
          </Typography>

            <QuestionDisplay
              question={quiz.questions[currentQuestion]}
              userAnswer={answers[quiz.questions[currentQuestion].id]}
              onAnswer={(answer) => handleAnswer(quiz.questions[currentQuestion].id, answer)}
            />

              <NavigationButtons>
            <Button
              startIcon={<NavigateBefore />}
              onClick={() => setCurrentQuestion(prev => prev - 1)}
              disabled={currentQuestion === 0}
                  variant="outlined"
            >
              Previous
            </Button>
            {currentQuestion === quiz.questions.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setShowConfirmSubmit(true)}
                    endIcon={<Send />}
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
              </NavigationButtons>
            </QuestionCard>
          </QuestionContainer>
        </AnimatePresence>
      </Box>

      {/* Question Review Drawer */}
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
                <ListItemButton 
                  onClick={() => {
                    setCurrentQuestion(index);
                    setShowReview(false);
                  }}
                >
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

      {/* Render Dialogs */}
      {renderTimeWarningDialog()}
      {renderConfirmDialog()}

      {/* Error display */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            position: 'fixed', 
            bottom: 16, 
            left: '50%', 
            transform: 'translateX(-50%)',
            zIndex: 1000 
          }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default QuizTakingInterface; 