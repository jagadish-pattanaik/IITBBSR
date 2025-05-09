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
  InputAdornment
} from '@mui/material';
import { Search } from '@mui/icons-material';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CourseCard from '../components/CourseCard';
import { motion } from 'framer-motion';
import { fadeInUp } from '../utils/animations';
import AnimatedPage from '../components/AnimatedPage';
import LoadingOverlay from '../components/LoadingOverlay';
import { useFirebase } from '../hooks/useFirebase';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import styled from '@emotion/styled';

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

const AllCourses = ({ toggleColorMode }) => {
  const navigate = useNavigate();
  const { getCourses } = useFirebase();
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [dataFetched, setDataFetched] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (dataFetched) return;

    try {
      setLoading(true);
      setError(null);
      const coursesData = await getCourses();
      setCourses(coursesData || []);
      setDataFetched(true);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [getCourses, dataFetched]);

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

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = levelFilter === 'all' || course.level.toLowerCase() === levelFilter.toLowerCase();
      return matchesSearch && matchesLevel;
    });
  }, [courses, searchTerm, levelFilter]);

  const levels = useMemo(() => 
    [...new Set(courses.map(course => course.level))].filter(Boolean),
    [courses]
  );

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
                All Courses
              </Typography>

              <Box sx={{ mb: 4 }}>
                <FiltersContainer>
                  <SearchField
                    size="small"
                    placeholder="Search courses..."
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
                    <InputLabel>Level</InputLabel>
                    <Select
                      value={levelFilter}
                      label="Level"
                      onChange={(e) => setLevelFilter(e.target.value)}
                    >
                      <MenuItem value="all">All Levels</MenuItem>
                      <MenuItem value="beginner">Beginner</MenuItem>
                      <MenuItem value="intermediate">Intermediate</MenuItem>
                      <MenuItem value="advanced">Advanced</MenuItem>
                    </Select>
                  </FormControl>
                </FiltersContainer>
              </Box>

              <Grid container spacing={3}>
                {filteredCourses.map((course) => (
                  <Grid item xs={12} sm={6} md={4} key={course.id}>
                    <CourseCard 
                      course={course}
                      onClick={() => navigate(`/course/${course.id}`)}
                    />
                  </Grid>
                ))}
                {filteredCourses.length === 0 && (
                  <Grid item xs={12}>
                    <Typography variant="body1" color="text.secondary" align="center">
                      No courses found matching your criteria.
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </motion.div>
          </Box>
        </PageContainer>

        <Footer />
      </Box>
    </AnimatedPage>
  );
};

export default AllCourses; 