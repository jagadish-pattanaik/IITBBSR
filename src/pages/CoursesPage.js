import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFirebase } from '../hooks/useFirebase';
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
  InputAdornment,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Search, School } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CourseCard from '../components/CourseCard';
import { FilterBar } from '../components/shared/SearchAndFilterBar';
import { styled } from '@mui/material/styles';

const PageContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(12),
  paddingBottom: theme.spacing(8),
}));

const PageHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  '& .MuiTypography-h4': {
    fontWeight: 600,
    marginBottom: theme.spacing(1),
  },
}));

const CoursesPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getCourses } = useFirebase();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const coursesData = await getCourses();
        setCourses(coursesData || []);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [getCourses]);

  const filteredCourses = useMemo(() => {
    return courses
      .filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            course.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLevel = levelFilter === 'all' || course.level === levelFilter;
        
        if (statusFilter === 'completed') {
          return matchesSearch && matchesLevel && currentUser?.completedCourses?.[course.id];
        }
        if (statusFilter === 'ongoing') {
          // Check if user has any progress but hasn't completed
          const hasProgress = currentUser?.progress?.videosWatched > 0 || 
                            currentUser?.progress?.projectsSubmitted > 0;
          return matchesSearch && matchesLevel && hasProgress && !currentUser?.completedCourses?.[course.id];
        }
        if (statusFilter === 'notStarted') {
          const hasNoProgress = !currentUser?.progress?.videosWatched && 
                              !currentUser?.progress?.projectsSubmitted;
          return matchesSearch && matchesLevel && hasNoProgress;
        }
        return matchesSearch && matchesLevel;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.title.localeCompare(b.title);
          case 'level':
            return a.level.localeCompare(b.level);
          case 'completion':
            const aCompleted = currentUser?.completedCourses?.[a.id];
            const bCompleted = currentUser?.completedCourses?.[b.id];
            if (aCompleted && !bCompleted) return -1;
            if (!aCompleted && bCompleted) return 1;
            return 0;
          default:
            return (a.order || 0) - (b.order || 0);
        }
      });
  }, [courses, searchTerm, statusFilter, levelFilter, sortBy, currentUser]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />
      
      <PageContainer maxWidth="lg">
        <PageHeader>
          <Typography variant="h4">All Courses</Typography>
          <Typography variant="body1" color="text.secondary">
            Explore our comprehensive collection of courses
          </Typography>
        </PageHeader>

        <Box sx={{ mb: 4 }}>
          <FilterBar>
            <TextField
              size="small"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flexGrow: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Courses</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="ongoing">In Progress</MenuItem>
                <MenuItem value="notStarted">Not Started</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Level</InputLabel>
              <Select
                value={levelFilter}
                label="Level"
                onChange={(e) => setLevelFilter(e.target.value)}
              >
                <MenuItem value="all">All Levels</MenuItem>
                <MenuItem value="Beginner">Beginner</MenuItem>
                <MenuItem value="Intermediate">Intermediate</MenuItem>
                <MenuItem value="Advanced">Advanced</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="default">Default</MenuItem>
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="level">Level</MenuItem>
                <MenuItem value="completion">Completion</MenuItem>
              </Select>
            </FormControl>
          </FilterBar>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        ) : (
          <AnimatePresence>
            <Grid container spacing={3} sx={{ mt: 2 }}>
              {filteredCourses.map((course, index) => (
                <Grid item xs={12} sm={6} md={4} key={course.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <CourseCard
                      course={course}
                      onClick={() => navigate(`/course/${course.id}`)}
                      isCompleted={currentUser?.completedCourses?.[course.id]}
                    />
                  </motion.div>
                </Grid>
              ))}
              {filteredCourses.length === 0 && (
                <Grid item xs={12}>
                  <Typography 
                    variant="body1" 
                    color="text.secondary" 
                    align="center"
                    sx={{ py: 8 }}
                  >
                    No courses found matching your criteria.
                  </Typography>
                </Grid>
              )}
            </Grid>
          </AnimatePresence>
        )}
      </PageContainer>

      <Footer />
    </Box>
  );
};

export default CoursesPage; 