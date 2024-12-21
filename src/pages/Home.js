import { Box, Container, Typography, Grid, Button, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import CourseCard from '../components/CourseCard';
import { School, Code, Group, Timeline, ArrowForward } from '@mui/icons-material';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

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
  '&::-webkit-scrollbar': {
    height: 6,
    background: theme.palette.mode === 'light'
      ? theme.palette.grey[200]
      : theme.palette.grey[900],
    borderRadius: 3,
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.primary.main,
    borderRadius: 3,
    '&:hover': {
      background: theme.palette.primary.dark,
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

  // Mock data - replace with Firebase data later
  const courses = [
    {
      id: 1,
      title: "Web Development Basics",
      description: "Learn the fundamentals of web development with HTML, CSS, and JavaScript",
      image: "/course-images/web-dev.jpg",
      duration: "8 weeks",
      level: "Beginner"
    },
    // Add more courses...
  ];

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

  const handleCourseClick = () => {
    // Will be implemented later
    console.log('Course clicked');
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
              Explore our curated selection of courses designed to help you master modern development skills.
            </Typography>
          </motion.div>

          <CourseScroller>
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <CourseCard 
                  course={course}
                  onClick={handleCourseClick}
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                />
              </motion.div>
            ))}
          </CourseScroller>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
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
          </Box>
        </Container>
      </CourseSection>

      {/* Our Team Section */}
      <TeamSection>
        <Container maxWidth="lg">
          <motion.div {...fadeInUp}>
            <SectionTitle variant="h3" gutterBottom>
              Meet Our Team
            </SectionTitle>
          </motion.div>

          <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
            >
                <ConvenorImage>
              <Box
                component="img"
                src="/convenor-image.png"
                alt="Convenor"
                    sx={{ width: '100%', maxWidth: 500 }}
              />
                </ConvenorImage>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Typography 
                  variant="h4" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 700,
                    mb: 3,
                  }}
                >
                Message from the Convenor
              </Typography>
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography 
                    variant="h6" 
                    color="primary.main"
                    sx={{ fontWeight: 600 }}
                  >
                Dr. Jane Smith
              </Typography>
                  <Box 
                    sx={{ 
                      width: 40, 
                      height: 2, 
                      bgcolor: 'primary.main',
                      borderRadius: 1,
                    }} 
                  />
                  <Typography variant="subtitle1" color="text.secondary">
                Program Convenor
              </Typography>
                </Box>
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

      <Footer />
    </Box>
  );
};

export default Home; 