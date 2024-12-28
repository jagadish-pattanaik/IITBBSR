import { Box, Container, Typography, Grid, Button, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import CourseCard from '../components/CourseCard';
import { School, Code, Group, Timeline, ArrowForward } from '@mui/icons-material';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useFirebase } from '../hooks/useFirebase';
import { useAuth } from '../contexts/AuthContext';

const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  minHeight: '85vh',
  display: 'flex',
  alignItems: 'center',
  overflow: 'hidden',
  paddingTop: theme.spacing(12),
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: theme.palette.divider,
  },
}));

const BenefitCard = styled(motion(Paper))(({ theme }) => ({
  height: '100%',
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  background: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease',
  '& .MuiSvgIcon-root': {
    fontSize: 40,
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(2),
  },
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.palette.mode === 'light'
      ? '0 16px 40px rgba(0, 0, 0, 0.12)'
      : '0 16px 40px rgba(0, 0, 0, 0.5)',
    borderColor: theme.palette.primary.main,
    '& .MuiSvgIcon-root': {
      transform: 'scale(1.1)',
    },
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  padding: '12px 32px',
  borderRadius: theme.shape.borderRadius,
  fontSize: '1.1rem',
  fontWeight: 500,
  textTransform: 'none',
  '&.MuiButton-contained': {
    boxShadow: 'none',
    '&:hover': {
      boxShadow: theme.palette.mode === 'light'
        ? '0 8px 24px rgba(0, 71, 179, 0.2)'
        : '0 8px 24px rgba(25, 118, 210, 0.3)',
    },
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  position: 'relative',
  marginBottom: theme.spacing(6),
  textAlign: 'center',
  fontWeight: 700,
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -16,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 60,
    height: 4,
    borderRadius: 2,
    background: theme.palette.primary.main,
  },
}));

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const CourseSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4, 0),
  borderTop: `1px solid ${theme.palette.divider}`,
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const CourseScroller = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  padding: theme.spacing(1),
  marginX: theme.spacing(1),
  overflowX: 'auto',
  scrollSnapType: 'x mandatory',
  className: 'scroll-container',
  '&::-webkit-scrollbar': {
    height: 6,
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: `${theme.palette.primary.main}33`,
    borderRadius: 3,
    '&:hover': {
      background: `${theme.palette.primary.main}4D`,
    },
  },
  '& > *': {
    scrollSnapAlign: 'start',
    minWidth: '280px',
    maxWidth: '300px',
    flexShrink: 0,
  },
}));

const TeamSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(8, 0),
  background: theme.palette.mode === 'light'
    ? theme.palette.background.paper
    : theme.palette.background.default,
}));

const ConvenorImage = styled(Box)(({ theme }) => ({
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 20,
    left: 20,
    right: -20,
    bottom: -20,
    background: theme.palette.primary.main,
    opacity: 0.1,
    borderRadius: theme.shape.borderRadius,
    zIndex: 0,
  },
  '& img': {
    position: 'relative',
    zIndex: 1,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.palette.mode === 'light'
      ? '0 20px 40px rgba(0,0,0,0.1)'
      : '0 20px 40px rgba(0,0,0,0.3)',
  },
}));

const Home = ({ toggleColorMode }) => {
  const navigate = useNavigate();
  const { getCourses } = useFirebase();
  const { currentUser, googleSignIn } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesData = await getCourses();
        // Filter only popular courses
        const popularCourses = coursesData.filter(course => course.isPopular);
        setCourses(popularCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, [getCourses]);

  const benefits = [
    {
      icon: <School fontSize="large" />,
      title: "Expert-Led Learning",
      description: "Learn from industry professionals with years of experience"
    },
    {
      icon: <Code fontSize="large" />,
      title: "Hands-on Practice",
      description: "Build real projects and gain practical experience"
    },
    {
      icon: <Group fontSize="large" />,
      title: "Community Support",
      description: "Join a community of like-minded learners"
    },
    {
      icon: <Timeline fontSize="large" />,
      title: "Track Progress",
      description: "Monitor your learning journey with detailed analytics"
    }
  ];

  const handleCourseClick = (course) => {
    if (currentUser) {
      navigate(`/course/${course.id}`);
    } else {
      setSelectedCourse(course);
      setOpenDialog(true);
    }
  };

  const handleContactClick = () => {
    // Will be implemented later
    console.log('Contact clicked');
  };

  return (
    <Box sx={{ overflow: 'hidden' }}>
      <Header toggleColorMode={toggleColorMode} />
      
      <HeroSection>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center" sx={{ minHeight: '80vh' }}>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Typography 
                  variant="h2" 
                  component="h1" 
                  sx={{ 
                    fontWeight: 800,
                    lineHeight: 1.2,
                    mb: 3,
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    mt: { xs: 4, md: 0 }
                  }}
                >
                  Learn. Grow.{' '}
                  <Box 
                    component="span" 
                    sx={{ 
                      color: 'primary.main',
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 8,
                        left: 0,
                        right: 0,
                        height: '30%',
                        background: theme => `${theme.palette.primary.main}20`,
                        zIndex: -1,
                      }
                    }}
                  >
                    Progresso.
                  </Box>
                </Typography>
                <Typography 
                  variant="h5" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 4,
                    maxWidth: 500,
                    lineHeight: 1.6
                  }}
                >
                  Your journey to becoming a skilled developer starts here.
                </Typography>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <StyledButton
                    variant="contained"
                    color="primary"
                    size="large"
                  >
                    Get Started
                  </StyledButton>
                </motion.div>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Box
                  component="img"
                  src="/hero-image.png"
                  alt="Hero"
                  sx={{
                    width: '100%',
                    maxWidth: 600,
                    height: 'auto',
                    filter: theme => theme.palette.mode === 'dark' ? 'brightness(0.8)' : 'none',
                  }}
                />
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </HeroSection>

      {/* Benefits Section */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <motion.div {...fadeInUp}>
            <SectionTitle variant="h3" gutterBottom>
              Why Choose Progresso?
            </SectionTitle>
          </motion.div>
          
          <Grid container spacing={4}>
            {benefits.map((benefit, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <BenefitCard elevation={0}>
                    {benefit.icon}
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{ fontWeight: 600 }}
                    >
                      {benefit.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ lineHeight: 1.6 }}
                    >
                      {benefit.description}
                    </Typography>
                  </BenefitCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
        </Box>

      {/* Courses Section */}
      <CourseSection>
        <Container maxWidth="lg">
          <motion.div {...fadeInUp}>
            <SectionTitle variant="h3" gutterBottom>
              Popular Courses
            </SectionTitle>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              align="center"
              sx={{
                maxWidth: 600,
                mx: 'auto',
                mb: 3,
              }}
            >
              Explore our featured selection of top-rated courses.
            </Typography>
          </motion.div>

          <CourseScroller>
            {courses.length > 0 ? (
              courses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <CourseCard 
                    course={course}
                    onClick={() => handleCourseClick(course)}
                    sx={{
                      height: '100%',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                      },
                    }}
                  />
                </motion.div>
              ))
            ) : (
              <Typography 
                variant="body1" 
                color="text.secondary" 
                align="center"
                sx={{ width: '100%', py: 4 }}
              >
                No featured courses available at the moment.
              </Typography>
            )}
          </CourseScroller>

          {/* <Box sx={{ textAlign: 'center', mt: 3 }}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <StyledButton
                variant="outlined"
                color="primary"
                size="large"
                endIcon={<ArrowForward />}
                onClick={() => navigate('/courses')}
              >
                View All Courses
              </StyledButton>
            </motion.div>
          </Box> */}
        </Container>
      </CourseSection>

        {/* Our Team Section */}
      <TeamSection>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="flex-start">
            {/* Developer Section */}
            <Grid item xs={12} md={6}>
              <motion.div {...fadeInUp}>
                <Typography 
                  variant="h4" 
                  gutterBottom 
                  sx={{ 
                    mb: 4,
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -8,
                      left: 0,
                      width: 40,
                      height: 3,
                      borderRadius: 1.5,
                      backgroundColor: 'primary.main',
                    },
                  }}
                >
                  Meet the Developer
                </Typography>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start', mb: 3 }}>
                  <Avatar
                    src="/developer-image.png"
                    alt="Developer"
                    sx={{
                      width: 100,
                      height: 100,
                      border: 3,
                      borderColor: 'primary.main',
                    }}
                  />
                  <Box>
                    <Typography 
                      variant="h6" 
                      color="primary.main"
                      sx={{ fontWeight: 600 }}
                    >
                      Jagadish Prasad Pattanaik
                    </Typography>
                    <Typography 
                      variant="subtitle2" 
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                     Lead & Developer
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <School fontSize="small" />
                      B.Tech Biotechnology 2020-24
                    </Typography>
                  </Box>
                </Box>
                <Typography 
                  variant="body1" 
                  paragraph
                  sx={{ 
                    fontSize: '1.1rem',
                    lineHeight: 1.8,
                    color: 'text.secondary',
                    mb: 4,
                  }}
                >
                  "As a passionate developer and student, I developed Progresso to help fellow students learn programming in a structured and engaging way."
                </Typography>
              </motion.div>
            </Grid>

            {/* Convenor Section */}
            <Grid item xs={12} md={6}>
              <motion.div {...fadeInUp}>
                <Typography 
                  variant="h4" 
                  gutterBottom 
                  sx={{ 
                    mb: 4,
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -8,
                      left: 0,
                      width: 40,
                      height: 3,
                      borderRadius: 1.5,
                      backgroundColor: 'primary.main',
                    },
                  }}
                >
                  Message from Convenor
                </Typography>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start', mb: 3 }}>
                  <Avatar
                    src="/convenor-image.png"
                    alt="Convenor"
                  sx={{ 
                      width: 100,
                      height: 100,
                      border: 3,
                      borderColor: 'primary.main',
                    }}
                  />
                  <Box>
                    <Typography 
                      variant="h6" 
                      color="primary.main"
                      sx={{ fontWeight: 600 }}
                    >
                  Dr. Jane Smith
                </Typography>
                    <Typography 
                      variant="subtitle2" 
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                  Program Convenor
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <School fontSize="small" />
                      Professor, Department of Computer Science
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mt: 0.5,
                      }}
                    >
                      Ph.D Computer Science, IIT Delhi
                    </Typography>
                  </Box>
                </Box>
                <Typography 
                  variant="body1" 
                  paragraph
                  sx={{ 
                    fontSize: '1.1rem',
                    lineHeight: 1.8,
                    color: 'text.secondary',
                    mb: 4,
                  }}
                >
                "We believe in empowering students with the skills and knowledge they need to succeed in the ever-evolving tech industry. Our mission is to provide quality education that bridges the gap between academic learning and industry requirements."
                </Typography>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </TeamSection>

        {/* Contact Section */}
        <Box sx={{ my: 8, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Love to Hear From You
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Have questions or feedback? We'd love to hear from you.
          </Typography>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="contained"
              color="primary"
              size="large"
            onClick={handleContactClick}
            >
              Get in Touch
            </Button>
          </motion.div>
        </Box>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: 2,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" component="div" gutterBottom>
            {selectedCourse?.title}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" paragraph>
              {selectedCourse?.description}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Duration:</strong> {selectedCourse?.duration}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Level:</strong> {selectedCourse?.level}
              </Typography>
            </Box>
            <Typography 
              variant="body1" 
              color="primary" 
              sx={{ 
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 2
              }}
            >
              <School />
              This course is completely free!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to access this course and many more features including:
            </Typography>
            <Box component="ul" sx={{ mt: 1, pl: 2 }}>
              <li>Full course content access</li>
              <li>Progress tracking</li>
              <li>Project submissions</li>
              <li>Certificates upon completion</li>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={() => setOpenDialog(false)}
            color="inherit"
          >
            Close
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={async () => {
              setOpenDialog(false);
              try {
                await googleSignIn();
              } catch (error) {
                console.error('Sign in error:', error);
              }
            }}
            startIcon={<School />}
          >
            Sign in to Start Learning
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </Box>
  );
};

export default Home; 