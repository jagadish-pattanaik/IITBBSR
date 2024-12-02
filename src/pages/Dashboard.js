import { useState, useEffect } from 'react';
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
import RecentActivity from '../components/RecentActivity';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getCourses, loading, error } = useFirebase();
  const [courses, setCourses] = useState([]);
  const [userProgress, setUserProgress] = useState({
    videosWatched: 0,
    projectsSubmitted: 0,
    quizzesTaken: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const coursesData = await getCourses();
        setCourses(coursesData);
        
        // In a real app, fetch user progress from Firebase
        setUserProgress({
          videosWatched: 12,
          projectsSubmitted: 3,
          quizzesTaken: 5
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };

    fetchData();
  }, [getCourses]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
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

          {/* Recent Activity Section */}
          <motion.div variants={fadeInUp}>
            <Box sx={{ mb: 6 }}>
              <Typography variant="h5" gutterBottom>
                Recent Activity
              </Typography>
              <Paper sx={{ p: 2 }}>
                <RecentActivity userId={currentUser.uid} />
              </Paper>
            </Box>
          </motion.div>
        </Container>

        <Footer />
      </Box>
    </AnimatedPage>
  );
};

export default Dashboard; 