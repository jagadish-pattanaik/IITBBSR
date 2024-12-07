import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
  Button
} from '@mui/material';
import { Search } from '@mui/icons-material';
import Header from '../components/Header';
import Footer from '../components/Footer';
import QuizCard from '../components/QuizCard';
import { motion } from 'framer-motion';
import { fadeInUp } from '../utils/animations';
import AnimatedPage from '../components/AnimatedPage';
import LoadingOverlay from '../components/LoadingOverlay';
import { useFirebase } from '../hooks/useFirebase';

const DIFFICULTY_LEVELS = [
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' }
];

const AllQuizzes = ({ toggleColorMode }) => {
  const { getQuizzes } = useFirebase();
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [dataFetched, setDataFetched] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (dataFetched) return;

    try {
      setLoading(true);
      setError(null);
      const quizzesData = await getQuizzes();
      setQuizzes(quizzesData || []);
      setDataFetched(true);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setError('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  }, [getQuizzes, dataFetched]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    // Force scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  const handleRefresh = () => {
    setDataFetched(false);
  };

  const filteredQuizzes = useMemo(() => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    return quizzes.filter(quiz => {
      const quizEndTime = new Date(quiz.endTime);
      const isActive = quizEndTime > new Date();
      const isRecentlyExpired = !isActive && quizEndTime > oneMonthAgo;
      const isVisible = isActive || isRecentlyExpired;

      const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = levelFilter === 'all' || quiz.level === levelFilter;
      const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'active' && isActive) ||
                          (statusFilter === 'recent' && isRecentlyExpired);

      return isVisible && matchesSearch && matchesLevel && matchesStatus;
    });
  }, [quizzes, searchTerm, levelFilter, statusFilter]);

  return (
    <AnimatedPage>
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden' // Prevent any unwanted scrolling
      }}>
        <Header toggleColorMode={toggleColorMode} />
        
        <Container maxWidth="lg" sx={{ mt: 12, mb: 4, flex: 1, position: 'relative' }}>
          <LoadingOverlay loading={loading} />

          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 4 }}
              action={
                <Button 
                  color="inherit" 
                  size="small" 
                  onClick={handleRefresh}
                >
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          )}

          <Box sx={{ opacity: loading ? 0.5 : 1, transition: 'opacity 0.3s' }}>
            <motion.div variants={fadeInUp}>
              <Typography variant="h4" gutterBottom>
                All Quizzes
              </Typography>

              <Box sx={{ mb: 4 }}>
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
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={statusFilter}
                        label="Status"
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="recent">Recently Expired</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Stack>
              </Box>

              <Grid container spacing={3}>
                {filteredQuizzes.map((quiz) => (
                  <Grid item xs={12} sm={6} md={4} key={quiz.id}>
                    <QuizCard 
                      quiz={quiz}
                      onStart={() => window.open(quiz.link, '_blank')}
                    />
                  </Grid>
                ))}
                {filteredQuizzes.length === 0 && (
                  <Grid item xs={12}>
                    <Typography variant="body1" color="text.secondary" align="center">
                      No quizzes found matching your criteria.
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </motion.div>
          </Box>
        </Container>

        <Footer />
      </Box>
    </AnimatedPage>
  );
};

export default AllQuizzes; 