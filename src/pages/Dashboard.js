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
  Paper
} from '@mui/material';
import {
  OndemandVideo,
  Assignment,
  Quiz,
  ArrowForward,
  School
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
import LoadingOverlay from '../components/LoadingOverlay';
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

  // Memoize sorted courses
  const sortedCourses = useMemo(() => {
    return courses
      .slice()
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [courses]);

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
      if (userData?.progress) {
        setUserProgress({
          videosWatched: userData.progress.videosWatched || 0,
          projectsSubmitted: userData.progress.projectsSubmitted || 0
        });
      }

      if (Array.isArray(coursesData)) {
        setCourses(coursesData);
      }

      if (Array.isArray(quizzesData)) {
        // Filter out expired quizzes
        const activeQuizzes = quizzesData.filter(quiz => 
          new Date(quiz.endTime) > new Date()
        );
        setQuizzes(activeQuizzes);
      }

      setDataFetched(true);
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

  return (
    <AnimatedPage>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <Header toggleColorMode={toggleColorMode} />
        
        <DashboardContainer maxWidth="lg" sx={{ mt: 12, mb: 4, flex: 1, position: 'relative' }}>
          <LoadingOverlay loading={loading} />

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
            {/* User Profile Section */}
            <motion.div variants={fadeInUp}>
              <Box sx={{ mb: 6 }}>
                <Grid container spacing={3} alignItems="center">
                  <Grid item>
                    <Avatar
                      src={currentUser?.photoURL}
                      alt={currentUser?.displayName}
                      sx={{ width: 80, height: 80 }}
                    />
                  </Grid>
                  <Grid item xs>
                    <Typography variant="h4">
                      Welcome back, {currentUser?.displayName}!
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Keep up the great work on your learning journey
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </motion.div>

            {/* Progress Section */}
            <motion.div variants={staggerContainer} initial="initial" animate="animate">
              <Typography variant="h5" gutterBottom>
                Your Progress
              </Typography>
              <Grid container spacing={3} sx={{ mb: 6 }}>
                <Grid item xs={12} sm={6} md={4}>
                  <ProgressCard
                    title="Videos Watched"
                    value={userProgress.videosWatched}
                    total={30}
                    icon={<OndemandVideo fontSize="large" />}
                    color="#0000CB"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <ProgressCard
                    title="Projects Submitted"
                    value={userProgress.projectsSubmitted}
                    total={10}
                    icon={<Assignment fontSize="large" />}
                    color="#FF4500"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <ProgressCard
                    title="Courses Completed"
                    value={userProgress.coursesCompleted || 0}
                    total={5}
                    icon={<School fontSize="large" />}
                    color="#00C853"
                  />
                </Grid>
              </Grid>
            </motion.div>

            {/* Courses Section */}
            <motion.div variants={fadeInUp}>
              <Box sx={{ mb: 6 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5">
                    Your Courses
                  </Typography>
                  <Button
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/courses')}
                    variant="outlined"
                    color="primary"
                  >
                    View All
                  </Button>
                </Box>
                <Grid container spacing={3}>
                  {sortedCourses.length > 0 ? (
                    sortedCourses.map((course) => (
                      <Grid item xs={12} sm={6} md={4} key={course.id}>
                        <CourseCard
                          course={course}
                          onClick={() => navigate(`/course/${course.id}`)}
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
              </Box>
            </motion.div>

            {/* Quizzes Section */}
            <motion.div variants={fadeInUp}>
              <Box sx={{ mb: 6 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5">
                    Quizzes
                  </Typography>
                  <Button
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/quizzes')}
                    variant="outlined"
                    color="primary"
                  >
                    View All
                  </Button>
                </Box>
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
            </motion.div>
          </Box>
        </DashboardContainer>

        <Footer />
      </Box>
    </AnimatedPage>
  );
};

export default Dashboard; 