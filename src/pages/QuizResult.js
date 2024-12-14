import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useFirebase } from '../hooks/useFirebase';
import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Chip
} from '@mui/material';
import { CheckCircle, Cancel, EmojiEvents } from '@mui/icons-material';
import Header from '../components/Header';
import BackButton from '../components/BackButton';

const QuizResult = () => {
  const { quizId, attemptId } = useParams();
  const { getQuizResult, getQuizLeaderboard } = useFirebase();
  
  const [result, setResult] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resultData, leaderboardData] = await Promise.all([
          getQuizResult(quizId, attemptId),
          getQuizLeaderboard(quizId)
        ]);
        setResult(resultData);
        setLeaderboard(leaderboardData);
      } catch (error) {
        console.error('Error fetching result:', error);
        setError('Failed to load quiz result');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [quizId, attemptId]);

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

  const { quiz, questions, attempt } = result;
  const userRank = leaderboard.findIndex(entry => entry.userId === attempt.userId) + 1;

  return (
    <Box>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 12, mb: 4 }}>
        <BackButton />
        
        <Paper sx={{ p: 4, mb: 3 }}>
          <Typography variant="h4" gutterBottom>{quiz.title}</Typography>
          <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Score</Typography>
              <Typography variant="h4">{attempt.score}/{quiz.totalPoints}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Time Taken</Typography>
              <Typography variant="h4">{Math.floor(attempt.timeSpent / 60)}:{(attempt.timeSpent % 60).toString().padStart(2, '0')}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Rank</Typography>
              <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                #{userRank} <EmojiEvents color={userRank <= 3 ? 'primary' : 'action'} />
              </Typography>
            </Box>
          </Box>

          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Answers" />
            <Tab label="Leaderboard" />
          </Tabs>

          {activeTab === 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Question</TableCell>
                    <TableCell>Your Answer</TableCell>
                    <TableCell>Correct Answer</TableCell>
                    <TableCell align="right">Points</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {questions.map((question) => {
                    const userAnswer = attempt.answers[question.id];
                    const correctAnswer = question.options.find(opt => opt.isCorrect).text;
                    const isCorrect = userAnswer === correctAnswer;

                    return (
                      <TableRow key={question.id}>
                        <TableCell>{question.text}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {userAnswer}
                            {isCorrect ? 
                              <CheckCircle color="success" sx={{ ml: 1 }} /> : 
                              <Cancel color="error" sx={{ ml: 1 }} />
                            }
                          </Box>
                        </TableCell>
                        <TableCell>{correctAnswer}</TableCell>
                        <TableCell align="right">
                          {isCorrect ? question.points : 0}/{question.points}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Rank</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell align="right">Score</TableCell>
                    <TableCell align="right">Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaderboard.map((entry, index) => (
                    <TableRow 
                      key={index}
                      sx={{ 
                        bgcolor: entry.userId === attempt.userId ? 'action.hover' : 'inherit'
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          #{index + 1}
                          {index < 3 && <EmojiEvents color="primary" />}
                        </Box>
                      </TableCell>
                      <TableCell>{entry.userName}</TableCell>
                      <TableCell align="right">{entry.score}</TableCell>
                      <TableCell align="right">
                        {Math.floor(entry.timeSpent / 60)}:{(entry.timeSpent % 60).toString().padStart(2, '0')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default QuizResult; 