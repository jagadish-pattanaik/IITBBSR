import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../hooks/useFirebase';
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert
} from '@mui/material';
import { Search } from '@mui/icons-material';
import Header from '../components/Header';
import Footer from '../components/Footer';
import QuizCard from '../components/QuizCard';

const QuizSection = () => {
  const navigate = useNavigate();
  const { getQuizzes, loading, error } = useFirebase();
  const [quizzes, setQuizzes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const quizzesData = await getQuizzes();
        setQuizzes(quizzesData);
        setFilteredQuizzes(quizzesData);
      } catch (err) {
        console.error('Error fetching quizzes:', err);
      }
    };

    fetchQuizzes();
  }, [getQuizzes]);

  useEffect(() => {
    const filtered = quizzes.filter(quiz =>
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredQuizzes(filtered);
  }, [searchTerm, quizzes]);

  const handleStartQuiz = (quizId) => {
    navigate(`/quiz/${quizId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      
      <Container maxWidth="lg" sx={{ mt: 12, mb: 4, flex: 1 }}>
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom>
            Available Quizzes
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Test your knowledge and track your progress
          </Typography>

          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 4 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />

          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            {filteredQuizzes.map((quiz) => (
              <Grid item xs={12} sm={6} md={4} key={quiz.id}>
                <QuizCard
                  quiz={quiz}
                  onStart={handleStartQuiz}
                />
              </Grid>
            ))}
            {filteredQuizzes.length === 0 && (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    No quizzes found
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
      </Container>

      <Footer />
    </Box>
  );
};

export default QuizSection; 