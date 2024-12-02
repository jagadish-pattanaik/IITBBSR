import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useFirebase } from '../hooks/useFirebase';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  PlayCircleOutline,
  CheckCircle,
  Assignment
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import VideoPlayer from '../components/VideoPlayer';
import ProjectSubmission from '../components/ProjectSubmission';

const CoursePage = () => {
  const { courseId } = useParams();
  const { currentUser } = useAuth();
  const { getCourses, submitProject, loading } = useFirebase();
  const [course, setCourse] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [completedVideos, setCompletedVideos] = useState(new Set());
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courses = await getCourses();
        const foundCourse = courses.find(c => c.id === courseId);
        setCourse(foundCourse);
        if (foundCourse?.videos?.length > 0) {
          setSelectedVideo(foundCourse.videos[0]);
        }
      } catch (err) {
        console.error('Error fetching course:', err);
      }
    };

    fetchCourse();
  }, [courseId, getCourses]);

  const handleVideoProgress = (videoId) => {
    setCompletedVideos(prev => new Set([...prev, videoId]));
  };

  const handleProjectSubmit = async (githubLink) => {
    try {
      await submitProject(currentUser.uid, courseId, selectedProject.id, githubLink);
      setShowProjectDialog(false);
    } catch (err) {
      console.error('Error submitting project:', err);
    }
  };

  if (loading || !course) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      
      <Container maxWidth="lg" sx={{ mt: 12, mb: 4, flex: 1 }}>
        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            {selectedVideo && (
              <VideoPlayer
                videoUrl={selectedVideo.url}
                courseId={courseId}
                videoId={selectedVideo.id}
                onProgress={handleVideoProgress}
              />
            )}
            
            <Paper sx={{ mt: 3, p: 3 }}>
              <Typography variant="h5" gutterBottom>
                {selectedVideo?.title || course.title}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {selectedVideo?.description || course.description}
              </Typography>
            </Paper>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Course Content
              </Typography>
              
              <List>
                {course.videos?.map((video, index) => (
                  <ListItem key={video.id} disablePadding>
                    <ListItemButton
                      onClick={() => setSelectedVideo(video)}
                      selected={selectedVideo?.id === video.id}
                    >
                      <ListItemIcon>
                        {completedVideos.has(video.id) ? (
                          <CheckCircle color="primary" />
                        ) : (
                          <PlayCircleOutline />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={`${index + 1}. ${video.title}`}
                        secondary={`${video.duration}`}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>

              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                Projects
              </Typography>
              
              {course.projects?.map((project) => (
                <motion.div
                  key={project.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Assignment />}
                    sx={{ mb: 2 }}
                    onClick={() => {
                      setSelectedProject(project);
                      setShowProjectDialog(true);
                    }}
                  >
                    {project.title}
                  </Button>
                </motion.div>
              ))}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <ProjectSubmission
        open={showProjectDialog}
        onClose={() => setShowProjectDialog(false)}
        onSubmit={handleProjectSubmit}
        loading={loading}
      />

      {error && <Alert severity="error">{error}</Alert>}

      <Footer />
    </Box>
  );
};

export default CoursePage; 