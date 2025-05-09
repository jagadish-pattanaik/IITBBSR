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
  Button,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import { Search } from '@mui/icons-material';
import Header from '../components/Header';
import Footer from '../components/Footer';
import QuizCard from '../components/QuizCard';
import { motion } from 'framer-motion';
import { fadeInUp } from '../utils/animations';
import AnimatedPage from '../components/AnimatedPage';
import BackButton from '../components/BackButton';
import { useAuth } from '../contexts/AuthContext';
import { useFirebase } from '../hooks/useFirebase';
import styled from '@emotion/styled';

const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
];

const PageContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(12),
  paddingBottom: theme.spacing(8),
  overflowX: 'hidden',
  '& > *': {
    overflowX: 'hidden'
  }
}));

const FiltersContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  flexWrap: 'wrap',
  alignItems: 'center'
}));

const SearchField = styled(TextField)(({ theme }) => ({
  flex: 1,
  minWidth: 200,
  maxWidth: '100%',
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius,
  }
}));

const AllQuizzes = ({ toggleColorMode }) => {
  const { getQuizzes, getUserQuizAttempts } = useFirebase();
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [dataFetched, setDataFetched] = useState(false);
  const [error, setError] = useState(null);
  const [userAttempts, setUserAttempts] = useState({});

  useEffect(() => {
    let mounted = true;

    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const data = await getQuizzes();
        if (mounted) {
          setQuizzes(data || []);
          setError(null);
        }
      } catch (error) {
        console.error('Error fetching quizzes:', error);
        if (mounted) {
          setError('Failed to load quizzes');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchQuizzes();

    return () => {
      mounted = false;
    };
  }, [getQuizzes]);

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
      const matchesLevel = levelFilter === 'all' || 
                          quiz.level.toLowerCase() === levelFilter.toLowerCase();
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
        
        <PageContainer maxWidth="lg" sx={{ flex: 1, position: 'relative' }}>
          <BackButton />
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 4 }}>
              {error}
            </Alert>
          ) : (
            <Box>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Typography variant="h4" gutterBottom>
                  All Quizzes
                </Typography>

                <Box sx={{ mb: 4 }}>
                  <FiltersContainer>
                    <SearchField
                      size="small"
                      placeholder="Search quizzes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <InputLabel>Difficulty</InputLabel>
                      <Select
                        value={levelFilter}
                        label="Difficulty"
                        onChange={(e) => setLevelFilter(e.target.value)}
                      >
                        <MenuItem value="all">All Difficulties</MenuItem>
                        {DIFFICULTY_LEVELS.map(level => (
                          <MenuItem key={level.value} value={level.value}>
                            {level.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={statusFilter}
                        label="Status"
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="recent">Recently Expired</MenuItem>
                      </Select>
                    </FormControl>
                  </FiltersContainer>
                </Box>

                <Grid container spacing={3}>
                  {filteredQuizzes.map((quiz) => (
                    <Grid item xs={12} sm={6} md={4} key={quiz.id}>
                      <QuizCard 
                        quiz={quiz}
                        userAttempt={userAttempts[quiz.id]}
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
          )}
        </PageContainer>

        <Footer />
      </Box>
    </AnimatedPage>
  );
};

export default AllQuizzes; 