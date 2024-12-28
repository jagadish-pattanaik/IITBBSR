import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFirebase } from '../hooks/useFirebase';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Avatar,
  Alert,
  Paper,
  CircularProgress
} from '@mui/material';
import {
  OndemandVideo,
  Assignment,
  Quiz,
  ArrowForward,
  School,
  AutoStories
} from '@mui/icons-material';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProgressCard from '../components/ProgressCard';
import CourseCard from '../components/CourseCard';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '../utils/animations';
import AnimatedPage from '../components/AnimatedPage';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import QuizCard from '../components/QuizCard';
import { styled } from '@mui/material/styles';

const DashboardContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(8),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
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

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  backgroundColor: theme.palette.mode === 'light'
    ? theme.palette.primary.light + '10'
    : theme.palette.primary.dark + '10',
  border: `1px solid ${theme.palette.divider}`,
}));

const StyledLoadingOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: theme.palette.background.default,
  zIndex: 1,
}));

const DashboardWrapper = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  backgroundColor: theme.palette.background.default,
  width: '100%',
  overflowX: 'hidden',
  '& > *': {
    overflowX: 'hidden'
  }
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  '& .MuiTypography-h5': {
    fontWeight: 600,
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: -8,
      left: 0,
      width: 40,
      height: 3,
      borderRadius: 1.5,
      backgroundColor: theme.palette.primary.main,
    },
  },
}));

const Dashboard = ({ toggleColorMode }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getCourses, getQuizzes } = useFirebase();
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [userProgress, setUserProgress] = useState({
    videosWatched: 0,
    projectsSubmitted: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataFetched, setDataFetched] = useState(false);
  const [totalVideos, setTotalVideos] = useState(0);
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalCourses, setTotalCourses] = useState(0);
  const [userData, setUserData] = useState(null);

  // Memoize sorted courses
  const sortedCourses = useMemo(() => {
    return courses
      .slice()
      .sort((a, b) => {
        // Put completed courses at the end
        const aCompleted = currentUser?.completedCourses?.[a.id];
        const bCompleted = currentUser?.completedCourses?.[b.id];
        if (aCompleted && !bCompleted) return 1;
        if (!aCompleted && bCompleted) return -1;
        return (a.order || 0) - (b.order || 0);
      });
  }, [courses, currentUser?.completedCourses]);

  const fetchData = useCallback(async () => {
    if (!currentUser?.uid || dataFetched) return;

    try {
      setLoading(true);
      setError(null);

      const [userDoc, coursesData, quizzesData] = await Promise.all([
        getDoc(doc(db, 'users', currentUser.uid)),
        getCourses(),
        getQuizzes()
      ]);

      const userData = userDoc.data();
      
      // Calculate totals from all courses
      let videosCount = 0;
      let projectsCount = 0;
      coursesData.forEach(course => {
        videosCount += course.videos?.length || 0;
        projectsCount += course.projects?.length || 0;
      });

      setTotalVideos(videosCount);
      setTotalProjects(projectsCount);
      setTotalCourses(coursesData.length);

      if (userData?.progress) {
        setUserProgress({
          videosWatched: userData.progress.videosWatched || 0,
          projectsSubmitted: userData.progress.projectsSubmitted || 0,
          coursesCompleted: Object.keys(userData.completedCourses || {}).length || 0
        });
      }

      if (Array.isArray(coursesData)) {
        setCourses(coursesData);
      }

      if (Array.isArray(quizzesData)) {
        const activeQuizzes = quizzesData.filter(quiz => 
          new Date(quiz.endTime) > new Date()
        );
        setQuizzes(activeQuizzes);
      }

      setDataFetched(true);
      setUserData(userData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid, getCourses, getQuizzes, dataFetched]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredQuizzes = useMemo(() => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    return quizzes.filter(quiz => {
      const quizEndTime = new Date(quiz.endTime);
      const isActive = quizEndTime > new Date();
      const isRecentlyExpired = !isActive && quizEndTime > oneMonthAgo;
      return isActive || isRecentlyExpired;
    });
  }, [quizzes]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser?.uid) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [currentUser]);

  return (
    <AnimatedPage>
      <DashboardWrapper>
        <Header toggleColorMode={toggleColorMode} />
        
        <DashboardContainer 
          maxWidth="lg" 
          sx={{ 
            mt: 12, 
            mb: 4, 
            flex: 1, 
            position: 'relative',
            opacity: loading ? 0.6 : 1,
            transition: 'opacity 0.3s ease'
          }}
        >
          {loading && (
            <StyledLoadingOverlay>
              <CircularProgress />
            </StyledLoadingOverlay>
          )}

          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 4 }}
              action={
                <Button 
                  color="inherit" 
                  size="small" 
                  onClick={() => {
                    setDataFetched(false);
                    fetchData();
                  }}
                >
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          )}

          <Box sx={{ opacity: loading ? 0.5 : 1, transition: 'opacity 0.3s' }}>
            {/* User Profile Section with animation */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Box sx={{ 
                mb: 6, 
                p: 3, 
                borderRadius: 2,
                bgcolor: 'background.paper',
                boxShadow: 1,
                border: '1px solid',
                borderColor: 'divider',
              }}>
                {/* First row - Profile and Details */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar
                      src={currentUser?.photoURL}
                      alt={currentUser?.displayName}
                      sx={{
                        width: 64,
                        height: 64,
                        border: 2,
                        borderColor: 'primary.main',
                        transition: 'transform 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        }
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ ml: 2 }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 1
                      }}
                    >
                      <School fontSize="small" />
                      {userData?.branch || 'Branch not set'}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <AutoStories fontSize="small" />
                      Graduating: {userData?.graduatingYear || 'Year not set'}
                    </Typography>
                  </Box>
                </Box>

                {/* Second row - Welcome Message */}
                <Box>
                  <Typography variant="h4" gutterBottom>
                    Welcome back, {currentUser?.displayName}!
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Keep up the great work on your learning journey
                  </Typography>
                </Box>
              </Box>
            </motion.div>

            {/* Progress Section */}
            <SectionHeader>
              <Typography variant="h5">Your Progress</Typography>
            </SectionHeader>
              <Grid container spacing={3} sx={{ mb: 6 }}>
                <Grid item xs={12} sm={6} md={4}>
                  <ProgressCard
                    title="Videos Watched"
                    value={userProgress.videosWatched}
                  total={totalVideos}
                    icon={<OndemandVideo fontSize="large" />}
                    color="#0000CB"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <ProgressCard
                    title="Projects Submitted"
                    value={userProgress.projectsSubmitted}
                  total={totalProjects}
                    icon={<Assignment fontSize="large" />}
                    color="#FF4500"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <ProgressCard
                    title="Courses Completed"
                    value={userProgress.coursesCompleted || 0}
                  total={totalCourses}
                    icon={<School fontSize="large" />}
                    color="#00C853"
                  />
                </Grid>
              </Grid>

            {/* Courses Section */}
            <SectionHeader>
              <Typography variant="h5">Your Courses</Typography>
              <motion.div whileHover={{ scale: 1.05 }}>
                  <Button
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/courses')}
                    variant="outlined"
                    color="primary"
                  >
                    View All
                  </Button>
              </motion.div>
            </SectionHeader>
            <Grid container spacing={3} sx={{ mb: 6 }}>
                  {sortedCourses.length > 0 ? (
                    sortedCourses.map((course) => (
                      <Grid item xs={12} sm={6} md={4} key={course.id}>
                        <CourseCard
                          course={course}
                          onClick={() => navigate(`/course/${course.id}`)}
                      isCompleted={currentUser?.completedCourses?.[course.id]}
                        />
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Typography variant="body1" color="text.secondary" align="center">
                        No courses available at the moment.
                      </Typography>
                    </Grid>
                  )}
                </Grid>

            {/* Quizzes Section */}
            <SectionHeader>
              <Typography variant="h5">Active Quizzes</Typography>
              <motion.div whileHover={{ scale: 1.05 }}>
                  <Button
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/quizzes')}
                    variant="outlined"
                    color="primary"
                  >
                    View All
                  </Button>
              </motion.div>
            </SectionHeader>
                <Grid container spacing={3}>
                  {filteredQuizzes.length > 0 ? (
                    filteredQuizzes.map((quiz) => (
                      <Grid item xs={12} sm={6} md={4} key={quiz.id}>
                        <QuizCard
                          quiz={quiz}
                          onStart={() => window.open(quiz.link, '_blank')}
                        />
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Typography variant="body1" color="text.secondary" align="center">
                        No active or recent quizzes at the moment.
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
        </DashboardContainer>

        <Footer />
      </DashboardWrapper>
    </AnimatedPage>
  );
};

export default Dashboard; 