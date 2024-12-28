import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Tooltip,
  Divider,
  Stack,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DialogContentText,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  TablePagination
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  VideoLibrary,
  Assignment,
  Save,
  Close,
  Search,
  OndemandVideo,
  Visibility,
  PublishOutlined,
  ExpandMore,
  AccessTime,
  School,
  Star,
  StarBorder
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useFirebase } from '../../hooks/useFirebase';
import VideoManagement from './VideoManagement';
import ProjectManagement from './ProjectManagement';
import { styled } from '@mui/material/styles';

const CourseManagement = () => {
  const { createCourse, updateCourse, deleteCourse, addProjectToCourse, getCourses } = useFirebase();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [dataFetched, setDataFetched] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    duration: '',
    level: ''
  });
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(9);

  const DIFFICULTY_LEVELS = [
    { value: 'Beginner', label: 'Beginner' },
    { value: 'Intermediate', label: 'Intermediate' },
    { value: 'Advanced', label: 'Advanced' }
  ];

  useEffect(() => {
    const fetchCourses = async () => {
      if (dataFetched) return;

      try {
        setLoading(true);
        const coursesData = await getCourses();
        setCourses(coursesData || []);
        setDataFetched(true);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [getCourses, dataFetched]);

  const handleRefresh = () => {
    setDataFetched(false);
  };

  const handleOpenDialog = (course = null) => {
    if (course) {
      setFormData(course);
      setSelectedCourse(course);
    } else {
      setFormData({
        title: '',
        description: '',
        image: '',
        duration: '',
        level: ''
      });
      setSelectedCourse(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCourse(null);
    setFormData({
      title: '',
      description: '',
      image: '',
      duration: '',
      level: ''
    });
  };

  const handleDeleteClick = (course) => {
    setCourseToDelete(course);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return;

    try {
      setLoading(true);
      await deleteCourse(courseToDelete.id);
      setDataFetched(false);
      setDeleteConfirmOpen(false);
      setCourseToDelete(null);
    } catch (error) {
      console.error('Error deleting course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.duration || !formData.level) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      if (selectedCourse?.id) {
        await updateCourse(selectedCourse.id, {
          ...formData,
          updatedAt: new Date().toISOString()
        });
      } else {
        await createCourse({
          ...formData,
          createdAt: new Date().toISOString(),
          order: courses.length
        });
      }
      setDataFetched(false);
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoManagement = (course) => {
    setSelectedCourse({...course});
    setShowVideoDialog(true);
  };

  const handleProjectManagement = (course) => {
    setSelectedCourse({...course});
    setShowProjectDialog(true);
  };

  const handleSaveVideos = async (updatedCourse) => {
    try {
      await updateCourse(updatedCourse.id, updatedCourse);
      setDataFetched(false); // Refresh list
      setShowVideoDialog(false);
      setSelectedCourse(null);
    } catch (error) {
      console.error('Error updating course videos:', error);
    }
  };

  const handleSaveProjects = async (updatedCourse) => {
    try {
      await updateCourse(updatedCourse.id, updatedCourse);
      setDataFetched(false); // Refresh list
      setShowProjectDialog(false);
      setSelectedCourse(null);
    } catch (error) {
      console.error('Error updating course projects:', error);
    }
  };

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = levelFilter === 'all' || course.level === levelFilter;
      return matchesSearch && matchesLevel;
    });
  }, [courses, searchTerm, levelFilter]);

  const levels = useMemo(() => 
    [...new Set(courses.map(course => course.level))].filter(Boolean),
    [courses]
  );

  const handleEditCourse = (course) => {
    setFormData(course);
    setSelectedCourse(course);
    setOpenDialog(true);
  };

  const handleTogglePublish = async (course) => {
    try {
      setLoading(true);
      await updateCourse(course.id, {
        ...course,
        published: !course.published,
        updatedAt: new Date().toISOString()
      });
      setDataFetched(false); // Refresh list
    } catch (error) {
      console.error('Error toggling course publish status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditVideo = (course, video) => {
    setSelectedCourse(course);
    setShowVideoDialog(true);
    // You might want to add additional state to track the selected video
    // setSelectedVideo(video);
  };

  const handleAddVideo = (course) => {
    setSelectedCourse(course);
    setShowVideoDialog(true);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTogglePopular = async (course) => {
    try {
      setLoading(true);
      await updateCourse(course.id, {
        ...course,
        isPopular: !course.isPopular,
        updatedAt: new Date().toISOString()
      });
      setDataFetched(false); // Refresh list
    } catch (error) {
      console.error('Error toggling popular status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Styled Components
  const CourseCard = styled(Paper)(({ theme }) => ({
    height: '100%',
    padding: theme.spacing(2.5),
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    transition: 'all 0.2s ease-in-out',
    display: 'flex',
    flexDirection: 'column',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.palette.mode === 'light'
        ? '0 8px 24px rgba(140,149,159,0.2)'
        : '0 8px 24px rgba(0,0,0,0.4)',
    },
  }));

  const VideoList = styled(List)(({ theme }) => ({
    maxHeight: 200,
    overflowY: 'auto',
    marginTop: theme.spacing(2),
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.shape.borderRadius,
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

  const ActionButton = styled(Button)(({ theme }) => ({
    minWidth: 'auto',
    padding: theme.spacing(1),
    fontSize: '0.875rem',
    '& .MuiSvgIcon-root': {
      fontSize: '1.1rem',
    },
  }));

  const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
      backgroundColor: theme.palette.background.paper,
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
      },
      '&.Mui-focused': {
        backgroundColor: theme.palette.background.paper,
      },
    },
  }));

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <StyledTextField
          size="small"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Level</InputLabel>
          <Select
            value={levelFilter}
            label="Level"
            onChange={(e) => setLevelFilter(e.target.value)}
          >
            <MenuItem value="all">All Levels</MenuItem>
            {DIFFICULTY_LEVELS.map(level => (
              <MenuItem key={level.value} value={level.value}>
                {level.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Course
        </Button>
      </Box>

      <Box sx={{ position: 'relative', minHeight: '200px' }}>
        {loading && (
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 2
          }}>
            <CircularProgress />
          </Box>
        )}

        <Grid container spacing={3}>
          {filteredCourses
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((course) => (
              <Grid item xs={12} sm={6} md={4} key={course.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CourseCard>
                    <Box sx={{ position: 'relative' }}>
                      <IconButton
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          zIndex: 1,
                          backgroundColor: 'background.paper',
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePopular(course);
                        }}
                      >
                        {course.isPopular ? (
                          <Star sx={{ color: 'warning.main' }} />
                        ) : (
                          <StarBorder />
                        )}
                      </IconButton>
                    </Box>
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="h6" gutterBottom>
                        {course.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ mb: 2, minHeight: 60, overflow: 'hidden' }}
                      >
                        {course.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        <Chip
                          icon={<OndemandVideo fontSize="small" />}
                          label={`${course.videos?.length || 0} Videos`}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          icon={<Assignment fontSize="small" />}
                          label={`${course.projects?.length || 0} Projects`}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          icon={<AccessTime fontSize="small" />}
                          label={course.duration}
                          size="small"
                          variant="outlined"
                        />
                      </Box>

                      <Box sx={{ 
                        mt: 'auto',
                        display: 'flex',
                        gap: 1,
                        flexWrap: 'wrap',
                        justifyContent: 'flex-start',
                      }}>
                        <ActionButton
                          variant="outlined"
                          startIcon={<Edit />}
                          onClick={() => handleOpenDialog(course)}
                        >
                          Edit
                        </ActionButton>
                        <ActionButton
                          variant="outlined"
                          startIcon={<VideoLibrary />}
                          onClick={() => handleVideoManagement(course)}
                        >
                          Videos
                        </ActionButton>
                        <ActionButton
                          variant="outlined"
                          startIcon={<Assignment />}
                          onClick={() => handleProjectManagement(course)}
                        >
                          Projects
                        </ActionButton>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDeleteClick(course)}
                          sx={{ ml: 'auto' }}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Box>
                  </CourseCard>
                </motion.div>
              </Grid>
            ))}
        </Grid>

        <TablePagination
          component="div"
          count={filteredCourses.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[9, 18, 27]}
          sx={{ mt: 2 }}
        />
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedCourse ? 'Edit Course' : 'Add New Course'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Course Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <TextField
              fullWidth
              label="Image URL"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 8 weeks"
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Level</InputLabel>
                  <Select
                    value={formData.level || ''}
                    label="Level"
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  >
                    {DIFFICULTY_LEVELS.map((level) => (
                      <MenuItem key={level.value} value={level.value}>
                        {level.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDialog} 
            startIcon={<Close />}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
            disabled={loading}
          >
            {selectedCourse ? 'Update Course' : 'Create Course'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: 2,
            minWidth: '400px'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Delete color="error" />
            Confirm Deletion
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the course "{courseToDelete?.title}"? This action cannot be undone.
            All associated videos and projects will also be deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            variant="outlined"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Delete />}
          >
            Delete Course
          </Button>
        </DialogActions>
      </Dialog>

      <VideoManagement
        open={showVideoDialog}
        onClose={() => setShowVideoDialog(false)}
        course={selectedCourse}
        onSave={handleSaveVideos}
      />
      <ProjectManagement
        open={showProjectDialog}
        onClose={() => setShowProjectDialog(false)}
        course={selectedCourse}
        onSave={handleSaveProjects}
      />
    </Box>
  );
};

export default CourseManagement; 