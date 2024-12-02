import { Box, Paper, Typography, Chip, Button } from '@mui/material';
import { AccessTime, Assignment } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const QuizCard = ({ quiz, onStart }) => {
  const isActive = new Date(quiz.endTime) > new Date();
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">{quiz.title}</Typography>
          <Chip
            label={isActive ? 'Active' : 'Expired'}
            color={isActive ? 'success' : 'error'}
            size="small"
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          {quiz.description}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AccessTime sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            Ends: {format(new Date(quiz.endTime), 'PPp')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Assignment sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {quiz.questionCount} Questions • {quiz.duration} minutes
          </Typography>
        </Box>

        <Button
          variant="contained"
          fullWidth
          disabled={!isActive}
          onClick={() => onStart(quiz.id)}
        >
          Start Quiz
        </Button>
      </Paper>
    </motion.div>
  );
};

export default QuizCard; 