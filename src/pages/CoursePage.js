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
  OpenInNew
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
  const [projectSubmissions, setProjectSubmissions] = useState({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

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
      setError(null);
      
      // Check if submission is allowed
      if (!canSubmitProject(selectedProject.id)) {
        setError('Cannot resubmit an approved or pending project');
        return;
      }

      const submissionData = {
        userId: currentUser.uid,
        courseId,
        projectId: selectedProject.id,
        githubLink,
        status: 'pending',
        submittedAt: serverTimestamp()
      };

      // Check if submission already exists
      const existingSubmission = projectSubmissions[selectedProject.id];
      if (existingSubmission) {
        // Update existing submission
        await updateDoc(doc(db, 'submissions', existingSubmission.id), {
          githubLink,
          status: 'pending',
          submittedAt: serverTimestamp()
        });
      } else {
        // Create new submission
        await addDoc(collection(db, 'submissions'), submissionData);
        
        // Update user's project count only for new submissions
        await updateDoc(doc(db, 'users', currentUser.uid), {
          'progress.projectsSubmitted': increment(1)
        });
      }

      setShowProjectDialog(false);
    } catch (err) {
      console.error('Error submitting project:', err);
      setError('Failed to submit project. Please try again.');
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
                          <CheckCircle color="success" />
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
              
              {course.projects?.map((project) => {
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

      <Footer />
    </Box>
  );
};

export default CoursePage; 