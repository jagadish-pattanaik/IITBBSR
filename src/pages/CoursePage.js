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
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Card,
  Avatar
} from '@mui/material';
import {
  PlayCircleOutline,
  CheckCircle,
  Assignment,
  GitHub,
  OpenInNew,
  School
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
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
import { styled } from '@mui/material/styles';
import LoadingShimmer from '../components/LoadingShimmer';

const CourseContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(8),
  paddingBottom: theme.spacing(4),
}));

const ContentSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
}));

const ModuleCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.palette.mode === 'light'
      ? '0 4px 12px rgba(140,149,159,0.15)'
      : '0 4px 12px rgba(0,0,0,0.3)',
  },
}));

const CustomStepper = styled(Stepper)(({ theme }) => ({
  '.MuiStepLabel-root': {
    padding: theme.spacing(1, 2),
  },
  '.MuiStepLabel-label': {
    marginTop: theme.spacing(0.5),
  },
  '.MuiStepIcon-root': {
    color: theme.palette.mode === 'light' 
      ? theme.palette.grey[300] 
      : theme.palette.grey[700],
    '&.Mui-active': {
      color: theme.palette.primary.main,
    },
    '&.Mui-completed': {
      color: theme.palette.success.main,
    },
  },
}));

const CourseHeader = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(4, 0),
  marginBottom: theme.spacing(4),
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

const VideoContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  backgroundColor: theme.palette.mode === 'light' 
    ? theme.palette.grey[100] 
    : theme.palette.grey[900],
  border: `1px solid ${theme.palette.divider}`,
  '& iframe': {
    border: 'none',
  },
}));

const SidebarCard = styled(Paper)(({ theme }) => ({
  position: 'sticky',
  top: '100px',
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  height: 'calc(100vh - 120px)',
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.mode === 'light'
      ? theme.palette.grey[300]
      : theme.palette.grey[700],
    borderRadius: '3px',
  },
}));

const VideoListItem = styled(ListItemButton)(({ theme, isActive, isCompleted }) => ({
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(1),
  transition: 'all 0.2s ease',
  border: `1px solid ${
    isActive 
      ? theme.palette.primary.main 
      : theme.palette.divider
  }`,
  backgroundColor: isActive
    ? theme.palette.primary.main + '10'
    : isCompleted
      ? theme.palette.success.main + '10'
      : 'transparent',
  '&:hover': {
    backgroundColor: isActive
      ? theme.palette.primary.main + '20'
      : theme.palette.action.hover,
    transform: 'translateX(4px)',
  },
}));

// Define getStatusColor outside
const getStatusColor = (status, theme) => {
  switch (status) {
    case 'approved': return theme.palette.success;
    case 'rejected': return theme.palette.error;
    case 'pending': return theme.palette.warning;
    default: return theme.palette.primary;
  }
};

const ProjectCard = styled(Paper)(({ theme, status }) => ({
  padding: theme.spacing(1.5),
  marginBottom: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${getStatusColor(status, theme).main}`,
  backgroundColor: getStatusColor(status, theme).main + '08',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[2],
  }
}));

const LoadingState = () => (
  <Grid container spacing={3}>
    <Grid item xs={12} md={8}>
      <LoadingShimmer height={400} sx={{ mb: 3 }} />
      <LoadingShimmer height={60} sx={{ mb: 2 }} />
      <LoadingShimmer height={40} width="60%" sx={{ mb: 4 }} />
    </Grid>
    <Grid item xs={12} md={4}>
      <LoadingShimmer height={600} />
    </Grid>
  </Grid>
);

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

  const checkCourseCompletion = useCallback(async () => {
    if (!currentUser?.uid || !course) return;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();

      // Check if all videos are watched
      const totalVideos = course.videos?.length || 0;
      const watchedVideos = Object.keys(userData?.completedVideos || {})
        .filter(key => key.startsWith(`${course.id}_`))
        .length;

      // Check if all projects are approved
      const submissionsSnapshot = await getDocs(
        query(
          collection(db, 'submissions'),
          where('userId', '==', currentUser.uid),
          where('courseId', '==', course.id),
          where('status', '==', 'approved')
        )
      );
      const approvedProjects = submissionsSnapshot.docs.length;
      const totalProjects = course.projects?.length || 0;

      // Update course completion status if all videos watched and all projects approved
      if (watchedVideos === totalVideos && approvedProjects === totalProjects && 
          totalVideos > 0 && totalProjects > 0) {
        if (!userData?.completedCourses?.[course.id]) {
          await updateDoc(userRef, {
            [`completedCourses.${course.id}`]: serverTimestamp(),
            'progress.coursesCompleted': increment(1)
          });
        }
      }
    } catch (error) {
      console.error('Error checking course completion:', error);
    }
  }, [currentUser?.uid, course]);

  // Call checkCourseCompletion when component mounts and when videos/projects are completed
  useEffect(() => {
    checkCourseCompletion();
  }, [checkCourseCompletion]);

  const handleVideoComplete = async (videoId) => {
    if (!currentUser?.uid) return;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        [`completedVideos.${course.id}_${videoId}`]: serverTimestamp(),
        'progress.videosWatched': increment(1)
      });

      // Immediately update local state
      setCompletedVideos(prev => new Set([...prev, videoId]));

      // Check course completion after video is watched
      checkCourseCompletion();
    } catch (error) {
      console.error('Error updating video progress:', error);
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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />
      
      <CourseContainer>
        <BackButton />
        
        {loading ? (
          <LoadingState />
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Course Header */}
            <CourseHeader>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <Avatar
                    sx={{ 
                      width: 64, 
                      height: 64,
                      bgcolor: 'primary.main',
                    }}
                  >
                    <School fontSize="large" />
                  </Avatar>
                </Grid>
                <Grid item xs>
                  <Typography variant="h4" gutterBottom>
                    {course?.title}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    color="text.secondary"
                    sx={{ maxWidth: 800 }}
                  >
                    {course?.description}
                  </Typography>
                </Grid>
              </Grid>
            </CourseHeader>

            {/* Main Content */}
            <Grid container spacing={4}>
              {/* Video Section */}
              <Grid item xs={12} md={8}>
                <ContentSection>
                  <Typography variant="h6" gutterBottom>Course Content</Typography>
                  <VideoContainer>
                    <VideoPlayer
                      key={selectedVideo.id}
                      videoUrl={selectedVideo.url}
                      courseId={courseId}
                      videoId={selectedVideo.id}
                      onProgress={handleVideoProgress}
                      onComplete={handleVideoComplete}
                    />
                  </VideoContainer>
                </ContentSection>
              </Grid>

              {/* Sidebar */}
              <Grid item xs={12} md={4}>
                <ContentSection>
                  <Typography variant="h6" gutterBottom>Videos</Typography>
                  <List>
                    {course?.videos?.map((video) => (
                      <ListItem
                        key={video.id}
                        disablePadding
                      >
                        <VideoListItem
                          onClick={() => handleVideoSelect(video)}
                          isActive={selectedVideo?.id === video.id}
                          isCompleted={completedVideos.has(video.id)}
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
                        </VideoListItem>
                      </ListItem>
                    ))}
                  </List>
                </ContentSection>

                <ContentSection>
                  <Typography variant="h6" gutterBottom>Projects</Typography>
                  {course?.projects?.map((project) => {
                    const submission = projectSubmissions[project.id];
                    const canSubmit = canSubmitProject(project.id);
                    
                    return (
                      <motion.div key={project.id}>
                        <ProjectCard 
                          status={submission?.status}
                          onClick={() => handleProjectClick(project)}
                          sx={{ cursor: canSubmit ? 'pointer' : 'default' }}
                        >
                          <Typography 
                            variant="subtitle2"
                            sx={{ mb: 0.5 }}
                          >
                            {project.title}
                          </Typography>
                          <Typography 
                            variant="caption"
                            color="text.secondary"
                            sx={{ 
                              mb: 1,
                              display: 'block',
                              lineHeight: 1.4
                            }}
                          >
                            {project.description}
                          </Typography>
                          {submission?.githubLink && (
                            <Button
                              component={Link}
                              href={submission.githubLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              startIcon={<GitHub sx={{ fontSize: '1rem' }} />}
                              endIcon={<OpenInNew sx={{ fontSize: '0.875rem' }} />}
                              size="small"
                              sx={{ 
                                py: 0.5,
                                fontSize: '0.75rem',
                                minHeight: 24
                              }}
                            >
                              View Submission
                            </Button>
                          )}
                          <Chip
                            label={
                              submission?.status === 'approved' ? 'Completed' :
                              submission?.status === 'pending' ? 'Under Review' :
                              submission?.status === 'rejected' ? 'Needs Revision' :
                              'Not Submitted'
                            }
                            color={
                              submission?.status === 'approved' ? 'success' :
                              submission?.status === 'pending' ? 'warning' :
                              submission?.status === 'rejected' ? 'error' :
                              'default'
                            }
                            size="small"
                            sx={{ 
                              mt: 0.5,
                              height: 20,
                              '& .MuiChip-label': {
                                px: 1,
                                fontSize: '0.7rem'
                              }
                            }}
                          />
                        </ProjectCard>
                      </motion.div>
                    );
                  })}
                </ContentSection>
              </Grid>
            </Grid>
          </motion.div>
        )}
      </CourseContainer>

      {/* Project Submission Dialog */}
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
    </Box>
  );
};

export default CoursePage; 