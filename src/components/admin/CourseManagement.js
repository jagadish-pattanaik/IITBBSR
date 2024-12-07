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
  DialogContentText
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  VideoLibrary,
  Assignment,
  Save,
  Close,
  Refresh,
  Search
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useFirebase } from '../../hooks/useFirebase';
import VideoManagement from './VideoManagement';
import ProjectManagement from './ProjectManagement';

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

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Stack spacing={2}>
          <TextField
            fullWidth
            placeholder="Search courses by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />
            }}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Level</InputLabel>
              <Select
                value={levelFilter}
                label="Level"
                onChange={(e) => setLevelFilter(e.target.value)}
              >
                <MenuItem value="all">All Levels</MenuItem>
                {levels.map(level => (
                  <MenuItem key={level} value={level}>{level}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              Add Course
            </Button>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ position: 'relative', minHeight: '200px' }}>
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 2
            }}
          >
            <CircularProgress />
          </Box>
        )}

        <Box sx={{ opacity: loading ? 0.5 : 1, transition: 'opacity 0.3s' }}>
          <Grid container spacing={3}>
            {filteredCourses.map((course) => (
              <Grid item xs={12} sm={6} md={4} key={course.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {course.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {course.description}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Chip label={course.level} size="small" />
                        <Chip label={course.duration} size="small" />
                      </Stack>
                    </CardContent>
                    <Divider />
                    <CardActions>
                      <Tooltip title="Edit Course">
                        <IconButton onClick={() => handleOpenDialog(course)}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Manage Videos">
                        <IconButton onClick={() => handleVideoManagement(course)}>
                          <VideoLibrary />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Manage Projects">
                        <IconButton onClick={() => handleProjectManagement(course)}>
                          <Assignment />
                        </IconButton>
                      </Tooltip>
                      <Box sx={{ flexGrow: 1 }} />
                      <Tooltip title="Delete Course">
                        <IconButton 
                          color="error"
                          onClick={() => handleDeleteClick(course)}
                          disabled={loading}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </CardActions>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>
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