import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Stack,
  Box,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  LinearProgress
} from '@mui/material';
import { 
  Timer, 
  EmojiEvents, 
  PlayArrow, 
  OpenInNew,
  Person
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import LeaderboardDialog from './LeaderboardDialog';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.palette.mode === 'light'
      ? '0 8px 24px rgba(26, 115, 232, 0.15)'
      : '0 8px 24px rgba(0, 0, 0, 0.4)',
  },
}));

const QuizProgress = styled(LinearProgress)(({ theme }) => ({
  height: 6,
  borderRadius: 3,
  backgroundColor: theme.palette.mode === 'light'
    ? 'rgba(208, 215, 222, 0.32)'
    : 'rgba(48, 54, 61, 0.48)',
  '.MuiLinearProgress-bar': {
    borderRadius: 3,
  },
}));

const QuizStats = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '16px',
  padding: '12px 0',
  borderTop: `1px solid ${theme.palette.divider}`,
  '& > div': {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
}));

const QuizCard = ({ quiz, userAttempt }) => {
  const navigate = useNavigate();
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const isExpired = new Date(quiz.endTime) < new Date();
  const hasAttempted = Boolean(userAttempt);

  const handleStartQuiz = () => {
    if (quiz.type === 'external') {
      window.open(quiz.link, '_blank');
    } else {
      navigate(`/quiz/${quiz.id}`);
    }
  };

  const handleViewResult = () => {
    navigate(`/quiz/${quiz.id}/result/${userAttempt.id}`);
  };

  const renderActionButton = () => {
    if (quiz.type === 'external') {
      return (
        <Button
          fullWidth
          variant="contained"
          startIcon={<OpenInNew />}
          onClick={() => setShowStartDialog(true)}
        >
          {isExpired ? 'Go to Results' : 'Go to Quiz'}
        </Button>
      );
    }

    if (hasAttempted) {
      if (isExpired) {
        return (
          <Button 
            fullWidth
            variant="outlined"
            onClick={handleViewResult}
            startIcon={<EmojiEvents />}
          >
            View Result
          </Button>
        );
      }
      return (
        <Button
          fullWidth
          variant="contained"
          color="secondary"
          startIcon={<EmojiEvents />}
          onClick={() => setShowLeaderboard(true)}
        >
          View Leaderboard
        </Button>
      );
    }

    if (isExpired) {
      return (
        <Button
          fullWidth
          variant="outlined"
          color="secondary"
          startIcon={<EmojiEvents />}
          onClick={() => setShowLeaderboard(true)}
        >
          View Results
        </Button>
      );
    }

    return (
      <Button
        fullWidth
        variant="contained"
        color="primary"
        startIcon={<PlayArrow />}
        onClick={() => setShowStartDialog(true)}
        sx={{
          color: '#FFFFFF',
          fontWeight: 500,
        }}
      >
        Start Quiz
      </Button>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <StyledCard>
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" gutterBottom>
            {quiz.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {quiz.description}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Chip 
              label={quiz.level} 
              color="primary" 
              variant="outlined" 
              size="small"
            />
            <Chip
              label={isExpired ? 'Expired' : 'Active'}
              color={isExpired ? 'error' : 'success'}
              size="small"
            />
          </Stack>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="Duration">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Timer fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {quiz.duration} mins
                </Typography>
              </Box>
            </Tooltip>
            {quiz.type === 'internal' && (
              <Tooltip title="Total Points">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <EmojiEvents fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {quiz.totalPoints} points
                  </Typography>
                </Box>
              </Tooltip>
            )}
          </Box>
        </CardContent>
        <CardActions>
          {renderActionButton()}
        </CardActions>
      </StyledCard>

      <Dialog open={showStartDialog} onClose={() => setShowStartDialog(false)}>
        <DialogTitle>Start Quiz?</DialogTitle>
        <DialogContent>
          <Typography>
            You are about to start "{quiz.title}". Make sure you:
          </Typography>
          <Box component="ul" sx={{ mt: 1, pl: 2 }}>
            <li>Have {quiz.duration} minutes available</li>
            <li>Have a stable internet connection</li>
            <li>Won't be interrupted</li>
          </Box>
          {quiz.type === 'external' && (
            <Typography sx={{ mt: 2, color: 'warning.main' }}>
              Note: This quiz will open in a new tab on an external website.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowStartDialog(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={handleStartQuiz}
          >
            {quiz.type === 'external' ? 'Go to Quiz' : 'Start Now'}
          </Button>
        </DialogActions>
      </Dialog>

      <LeaderboardDialog 
        open={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        quizId={quiz.id}
        userAttempt={userAttempt}
      />
    </motion.div>
  );
};

export default QuizCard; 