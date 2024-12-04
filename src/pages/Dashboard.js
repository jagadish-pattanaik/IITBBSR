import { useState, useEffect, useCallback } from 'react';
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
  CircularProgress,
  Paper
} from '@mui/material';
import {
  OndemandVideo,
  Assignment,
  Quiz,
  ArrowForward
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

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getCourses } = useFirebase();
  const [courses, setCourses] = useState([]);
  const [userProgress, setUserProgress] = useState({
    videosWatched: 0,
    projectsSubmitted: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoize fetchData to prevent infinite loops
  const fetchData = useCallback(async () => {
    if (!currentUser?.uid) return;
    
    try {
      setLoading(true);
      setError(null);

      // Get user progress - one-time read
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      
      if (userData) {
        setUserProgress({
          videosWatched: userData.progress?.videosWatched || 0,
          projectsSubmitted: userData.progress?.projectsSubmitted || 0
        });
      }

      // Get courses - one-time read
      const coursesData = await getCourses();
      setCourses(coursesData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid, getCourses]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Add loading state to prevent flickering
  if (loading) {
    return (
      <Box 
        sx={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          bgcolor: 'background.default'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
        <Button onClick={() => window.location.reload()} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <AnimatedPage>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        
        <Container maxWidth="lg" sx={{ mt: 12, mb: 4, flex: 1 }}>
          <motion.div variants={fadeInUp}>
            {/* User Profile Section */}
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
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
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
                  title="Quizzes Completed"
                  value={userProgress.quizzesTaken}
                  total={8}
                  icon={<Quiz fontSize="large" />}
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
                >
                  View All
                </Button>
              </Box>
              <Grid container spacing={3}>
                {courses.map((course) => (
                  <Grid item xs={12} sm={6} md={4} key={course.id}>
                    <CourseCard
                      course={course}
                      onClick={() => navigate(`/course/${course.id}`)}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </motion.div>
        </Container>

        <Footer />
      </Box>
    </AnimatedPage>
  );
};

export default Dashboard; 