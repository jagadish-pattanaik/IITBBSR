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
  TextField
} from '@mui/material';
import {
  Timer,
  Flag,
  NavigateNext,
  NavigateBefore,
  CheckCircle,
  RadioButtonUnchecked,
  Preview,
  Send
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';

const QuestionDisplay = ({ question, userAnswer, onAnswer, showFeedback = false }) => {
  const handleTextAnswer = (value) => {
    if (question.type === 'number') {
      // Only allow numeric input
      const numValue = value.replace(/[^0-9.-]/g, '');
      onAnswer(numValue);
    } else {
      onAnswer(value);
    }
  };

  switch (question.type) {
    case 'mcq':
    case 'boolean':
      return (
        <RadioGroup
          value={userAnswer || ''}
          onChange={(e) => onAnswer(e.target.value)}
        >
          {question.options.map((option, index) => (
            <FormControlLabel
              key={index}
              value={option.text}
              control={<Radio />}
              label={option.text}
            />
          ))}
        </RadioGroup>
      );

    case 'text':
      return (
        <TextField
          fullWidth
          multiline
          rows={2}
          variant="outlined"
          label="Your Answer"
          value={userAnswer || ''}
          onChange={(e) => handleTextAnswer(e.target.value)}
          placeholder="Type your answer here..."
          helperText={question.caseSensitive ? "Note: Answer is case-sensitive" : ""}
        />
      );

    case 'number':
      return (
        <TextField
          fullWidth
          type="number"
          variant="outlined"
          label="Your Answer"
          value={userAnswer || ''}
          onChange={(e) => handleTextAnswer(e.target.value)}
          placeholder="Enter a number..."
          helperText={`Tolerance: ±${question.tolerance * 100}%`}
          InputProps={{
            inputProps: { 
              step: 'any' // Allow decimal numbers
            }
          }}
        />
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

const QuizTakingInterface = ({ quiz, onSubmit }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(quiz.duration * 60);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [showReview, setShowReview] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [timeWarningType, setTimeWarningType] = useState('');

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

  const handleSubmit = () => {
    onSubmit({
      answers,
      timeSpent: quiz.duration * 60 - timeLeft
    });
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
          >
            Submit Quiz
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
        <QuestionPaper>
          <Typography variant="h6" gutterBottom>
            {quiz.questions[currentQuestion].text}
          </Typography>

          <Box sx={{ mb: 3 }}>
            <QuestionDisplay
              question={quiz.questions[currentQuestion]}
              userAnswer={answers[quiz.questions[currentQuestion].id]}
              onAnswer={(answer) => handleAnswer(quiz.questions[currentQuestion].id, answer)}
            />
          </Box>

          <NavigationButtons>
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
          </NavigationButtons>
        </QuestionPaper>
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
    </Box>
  );
};

export default QuizTakingInterface; 