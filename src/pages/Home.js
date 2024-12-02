import { Box, Container, Typography, Grid, Button } from '@mui/material';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import CourseCard from '../components/CourseCard';
import { School, Code, Group, Timeline } from '@mui/icons-material';
import Footer from '../components/Footer';

const Home = ({ toggleColorMode }) => {
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header toggleColorMode={toggleColorMode} />
      
      <Container maxWidth="lg" sx={{ mt: 10, flex: 1 }}>
        {/* Hero Section */}
        <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Typography variant="h2" component="h1" gutterBottom>
                  Learn. Grow. Progress.
                </Typography>
                <Typography variant="h5" color="text.secondary" paragraph>
                  Your journey to becoming a skilled developer starts here.
                </Typography>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Box
                  component="img"
                  src="/hero-image.png"
                  alt="Hero"
                  sx={{ width: '100%', maxWidth: 500 }}
                />
              </motion.div>
            </Grid>
          </Grid>
        </Box>

        {/* Courses Section */}
        <Box sx={{ my: 8 }}>
          <Typography variant="h4" gutterBottom>
            Popular Courses
          </Typography>
          <Box
            sx={{
              display: 'flex',
              overflowX: 'auto',
              pb: 2,
              '&::-webkit-scrollbar': { height: 6 },
              '&::-webkit-scrollbar-track': { backgroundColor: 'background.paper' },
              '&::-webkit-scrollbar-thumb': { backgroundColor: 'primary.main', borderRadius: 2 },
            }}
          >
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </Box>
        </Box>

        {/* Why Choose Progresso Section */}
        <Box sx={{ my: 8 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Why Choose Progresso?
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            {benefits.map((benefit, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      p: 2,
                    }}
                  >
                    <Box sx={{ color: 'primary.main', mb: 2 }}>
                      {benefit.icon}
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      {benefit.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {benefit.description}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Our Team Section */}
        <Box sx={{ my: 8 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Our Team
          </Typography>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Box
                  component="img"
                  src="/convenor-image.png"
                  alt="Convenor"
                  sx={{ width: '100%', maxWidth: 400, borderRadius: 2 }}
                />
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Typography variant="h5" gutterBottom>
                  Message from the Convenor
                </Typography>
                <Typography variant="body1" paragraph>
                  "We believe in empowering students with the skills and knowledge they need to succeed in the ever-evolving tech industry. Our mission is to provide quality education that bridges the gap between academic learning and industry requirements."
                </Typography>
                <Typography variant="subtitle1" color="primary" fontWeight="bold">
                  Dr. Jane Smith
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Program Convenor
                </Typography>
              </motion.div>
            </Grid>
          </Grid>
        </Box>

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
              onClick={() => window.location.href = 'mailto:contact@progresso.com'}
            >
              Get in Touch
            </Button>
          </motion.div>
        </Box>
      </Container>

      <Footer />
    </Box>
  );
};

export default Home; 