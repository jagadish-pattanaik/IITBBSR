import { useState, useEffect, useCallback } from 'react';
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
  Alert,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  PlayCircleOutline,
  CheckCircle,
  Assignment,
  GitHub,
  OpenInNew,
  School
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import VideoPlayer from '../components/VideoPlayer';
import ProjectSubmission from '../components/ProjectSubmission';
import { 
  getDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  collection,
  updateDoc, 
  increment, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { Link } from 'react-router-dom';
import BackButton from '../components/BackButton';

const CoursePage = () => {
  const { courseId } = useParams();
  const { currentUser } = useAuth();
  const { getCourses, submitProject } = useFirebase();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [completedVideos, setCompletedVideos] = useState(new Set());
  const [error, setError] = useState(null);
  const [projectSubmissions, setProjectSubmissions] = useState({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;

      try {
        setLoading(true);
        const courseDoc = await getDoc(doc(db, 'courses', courseId));
        if (courseDoc.exists()) {
          const courseData = courseDoc.data();
          setCourse({ id: courseDoc.id, ...courseData });
          // Set initial video
          if (courseData.videos?.length > 0) {
            setSelectedVideo(courseData.videos[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  useEffect(() => {
    const fetchUserProgress = async () => {
      if (!currentUser) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const userData = userDoc.data();
        
        if (userData?.completedVideos) {
          const completed = new Set(
            Object.keys(userData.completedVideos)
              .filter(key => key.startsWith(courseId))
              .map(key => key.split('_')[1])
          );
          setCompletedVideos(completed);
        }
      } catch (error) {
        console.error('Error fetching user progress:', error);
      }
    };

    fetchUserProgress();
  }, [currentUser, courseId]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!currentUser || !courseId) return;
      
      try {
        const submissionsQuery = query(
          collection(db, 'submissions'),
          where('userId', '==', currentUser.uid),
          where('courseId', '==', courseId)
        );
        
        const snapshot = await getDocs(submissionsQuery);
        const submissions = {};
        snapshot.forEach(doc => {
          const data = doc.data();
          submissions[data.projectId] = {
            id: doc.id,
            ...data
          };
        });
        setProjectSubmissions(submissions);
      } catch (error) {
        console.error('Error fetching submissions:', error);
      }
    };

    fetchSubmissions();
  }, [currentUser, courseId]);

  useEffect(() => {
    const checkCourseCompletion = async () => {
      if (!currentUser?.uid || !course) return;

      try {
        // Get user data first
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();

        // Get all videos in course
        const totalVideos = course.videos?.length || 0;
        const totalProjects = course.projects?.length || 0;

        // Get completed videos for this course
        const completedVideos = new Set(
          Object.keys(userData?.completedVideos || {})
            .filter(key => key.startsWith(courseId))
            .map(key => key.split('_')[1])
        );

        // Get approved project submissions
        const projectSubmissionsQuery = query(
          collection(db, 'submissions'),
          where('userId', '==', currentUser.uid),
          where('courseId', '==', courseId),
          where('status', '==', 'approved')
        );
        const projectSnapshot = await getDocs(projectSubmissionsQuery);
        const approvedProjects = projectSnapshot.docs.length;

        // Check if course is completed
        if (completedVideos.size === totalVideos && 
            approvedProjects === totalProjects && 
            totalVideos > 0 && 
            totalProjects > 0) {
          // Update user's completed courses count if not already marked
          const completedCourses = userData?.completedCourses || {};

          if (!completedCourses[courseId]) {
            await updateDoc(userRef, {
              [`completedCourses.${courseId}`]: serverTimestamp(),
              'progress.coursesCompleted': increment(1)
            });
          }
        }
      } catch (error) {
        console.error('Error checking course completion:', error);
      }
    };

    checkCourseCompletion();
  }, [currentUser?.uid, courseId, course]);

  const handleVideoProgress = (videoId) => {
    setCompletedVideos(prev => new Set([...prev, videoId]));
  };

  const canSubmitProject = (projectId) => {
    const submission = projectSubmissions[projectId];
    // Allow submission if:
    // 1. No previous submission exists
    // 2. Previous submission was rejected
    return !submission || submission.status === 'rejected';
  };

  const handleProjectSubmit = async (githubLink) => {
    try {
      setLoading(true);
      setError(null);

      const submission = {
        userId: currentUser.uid,
        courseId: courseId,
        courseTitle: course.title,
        projectId: selectedProject.id,
        projectTitle: selectedProject.title,
        githubLink: githubLink,
        status: 'pending',
        submittedAt: serverTimestamp()
      };

      // Debug log
      console.log('Creating submission:', submission);

      const submissionRef = await addDoc(collection(db, 'submissions'), submission);
      console.log('Submission created with ID:', submissionRef.id);
      
      // Update user's project count
      await updateDoc(doc(db, 'users', currentUser.uid), {
        'progress.projectsSubmitted': increment(1)
      });

      setShowProjectDialog(false);
      // Show success message
      setSuccess('Project submitted successfully!');
    } catch (error) {
      console.error('Error submitting project:', error);
      setError('Failed to submit project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectClick = (project) => {
    const canSubmit = canSubmitProject(project.id);
    if (!canSubmit) return;

    // If it's a resubmission, show confirmation dialog
    if (projectSubmissions[project.id]?.status === 'rejected') {
      setSelectedProject(project);
      setShowConfirmDialog(true);
    } else {
      setSelectedProject(project);
      setShowProjectDialog(true);
    }
  };

  const getProjectStatusMessage = (submission) => {
    if (!submission) return "Click to submit your project";
    switch (submission.status) {
      case 'approved':
        return "Project has been approved! Great work!";
      case 'pending':
        return "Your submission is under review";
      case 'rejected':
        return "Project needs improvements. Click to resubmit";
      default:
        return "Click to submit your project";
    }
  };

  const handleVideoSelect = useCallback((video) => {
    console.log('Selecting video:', video);
    setSelectedVideo(null);
    setTimeout(() => setSelectedVideo(video), 0);
  }, []);

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
      
      <Container maxWidth="lg" sx={{ mt: 12, mb: 4 }}>
        <BackButton />
        
        {/* Course Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'flex-start',
            gap: 2,
            mb: 2
          }}>
            <School 
              sx={{ 
                fontSize: 32,
                color: 'primary.main',
                mt: 1
              }} 
            />
            <Box>
              <Typography 
                variant="h4"
                sx={{ 
                  fontWeight: 700,
                  mb: 1,
                  lineHeight: 1.2
                }}
              >
                {course?.title}
              </Typography>
              <Typography 
                variant="body1"
                color="text.secondary"
                sx={{ 
                  maxWidth: '800px',
                  lineHeight: 1.6,
                  mb: 2
                }}
              >
                {course?.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {course?.level && (
                  <Chip 
                    label={course.level}
                    color="primary"
                    variant="outlined"
                    size="medium"
                    sx={{ fontWeight: 500, px: 2 }}
                  />
                )}
                {course?.duration && (
                  <Chip 
                    label={course.duration}
                    color="secondary"
                    variant="outlined"
                    size="medium"
                    sx={{ fontWeight: 500, px: 2 }}
                  />
                )}
              </Box>
            </Box>
          </Box>
        </motion.div>

        {/* Main Content Grid */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* Video Player Section */}
          <Grid item xs={12} md={8}>
            {selectedVideo ? (
              <Paper 
                elevation={3}
                sx={{ 
                  p: 2,
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: 'background.paper'
                }}
              >
                <VideoPlayer
                  key={selectedVideo.id}
                  videoUrl={selectedVideo.url}
                  courseId={courseId}
                  videoId={selectedVideo.id}
                  onProgress={handleVideoProgress}
                />
                <Box sx={{ mt: 2 }}>
                  <Typography 
                    variant="h5"
                    sx={{ 
                      fontWeight: 600,
                      mb: 1
                    }}
                  >
                    {selectedVideo.title}
                  </Typography>
                  <Typography 
                    variant="body1"
                    color="text.secondary"
                    sx={{ 
                      lineHeight: 1.6,
                      mb: 2
                    }}
                  >
                    {selectedVideo.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Chip 
                      label={`Duration: ${selectedVideo.duration}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    {completedVideos.has(selectedVideo.id) && (
                      <Chip 
                        icon={<CheckCircle />}
                        label="Completed"
                        color="success"
                        variant="outlined"
                        size="small"
                      />
                    )}
                  </Box>
                </Box>
              </Paper>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            )}
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Paper 
              sx={{ 
                p: 2,
                position: 'sticky',
                top: '100px',
                borderRadius: 2
              }}
            >
              <Typography variant="h6" gutterBottom>
                Course Content
              </Typography>
              
              <List>
                {course?.videos?.map((video) => (
                  <ListItem
                    key={video.id}
                    disablePadding
                    sx={{
                      bgcolor: selectedVideo?.id === video.id ? 'action.selected' : 'transparent',
                      borderRadius: 1,
                      mb: 0.5,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <ListItemButton 
                      onClick={() => handleVideoSelect(video)}
                      selected={selectedVideo?.id === video.id}
                    >
                      <ListItemIcon>
                        {completedVideos.has(video.id) ? (
                          <CheckCircle color="success" />
                        ) : (
                          <PlayCircleOutline />
                        )}
                      </ListItemIcon>
                      <ListItemText 
                        primary={video.title}
                        secondary={video.duration}
                        primaryTypographyProps={{
                          fontWeight: selectedVideo?.id === video.id ? 600 : 400
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>

              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                Projects
              </Typography>
              
              {course?.projects?.map((project) => {
                const submission = projectSubmissions[project.id];
                const canSubmit = canSubmitProject(project.id);
                
                return (
                  <motion.div key={project.id}>
                    <Box sx={{ mb: 2 }}>
                      <Tooltip 
                        title={getProjectStatusMessage(submission)}
                        placement="top"
                      >
                        <Button
                          fullWidth
                          variant={submission?.status === 'approved' ? 'contained' : 'outlined'}
                          startIcon={<Assignment />}
                          onClick={() => handleProjectClick(project)}
                          disabled={!canSubmit && submission?.status === 'approved'}
                          sx={{
                            borderRadius: 2,
                            py: 1.5,
                            bgcolor: submission?.status === 'approved' ? 'success.main' : 'transparent',
                            borderColor: submission?.status === 'rejected' ? 'error.main' : 
                                        submission?.status === 'pending' ? 'warning.main' : 'primary.main',
                            color: submission?.status === 'approved' ? 'white' : 
                                   submission?.status === 'rejected' ? 'error.main' :
                                   submission?.status === 'pending' ? 'warning.main' : 'primary.main',
                            '&:hover': {
                              bgcolor: submission?.status === 'approved' ? 'success.dark' : 'transparent',
                              borderColor: submission?.status === 'rejected' ? 'error.dark' : 
                                          submission?.status === 'pending' ? 'warning.dark' : 'primary.dark',
                            }
                          }}
                          endIcon={
                            submission && (
                              <Chip
                                size="small"
                                label={submission.status.toUpperCase()}
                                color={
                                  submission.status === 'approved'
                                    ? 'success'
                                    : submission.status === 'rejected'
                                    ? 'error'
                                    : 'warning'
                                }
                                sx={{ 
                                  fontWeight: 600,
                                  letterSpacing: '0.5px',
                                  ml: 1
                                }}
                              />
                            )
                          }
                        >
                          {project.title}
                          {submission?.status === 'approved' && ' (Completed)'}
                          {submission?.status === 'pending' && ' (Under Review)'}
                          {submission?.status === 'rejected' && ' (Resubmit)'}
                        </Button>
                      </Tooltip>
                      {submission?.githubLink && (
                        <Box sx={{ mt: 1, pl: 1 }}>
                          <Button
                            component={Link}
                            href={submission.githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="small"
                            startIcon={<GitHub sx={{ fontSize: 16 }} />}
                            endIcon={<OpenInNew sx={{ fontSize: 14 }} />}
                            sx={{ 
                              textTransform: 'none',
                              color: 'text.secondary',
                              '&:hover': {
                                color: 'primary.main'
                              }
                            }}
                          >
                            View Submission
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </motion.div>
                );
              })}
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

      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
      >
        <DialogTitle>Resubmit Project?</DialogTitle>
        <DialogContent>
          <Typography>
            You are about to resubmit this project. Your previous submission will be updated with the new one.
            Are you sure you want to continue?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setShowConfirmDialog(false);
              setShowProjectDialog(true);
            }}
          >
            Yes, Resubmit
          </Button>
        </DialogActions>
      </Dialog>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            position: 'fixed', 
            bottom: 16, 
            left: '50%', 
            transform: 'translateX(-50%)',
            zIndex: 1000,
            boxShadow: 3
          }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert 
          severity="success" 
          sx={{ 
            position: 'fixed', 
            bottom: 16, 
            left: '50%', 
            transform: 'translateX(-50%)',
            zIndex: 1000,
            boxShadow: 3
          }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      <Footer />
    </Box>
  );
};

export default CoursePage; 