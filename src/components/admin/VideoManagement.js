import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Box,
  Typography,
  Divider
} from '@mui/material';
import {
  Delete,
  Add,
  Save,
  Close
} from '@mui/icons-material';

const VideoManagement = ({ open, onClose, course, onSave }) => {
  const [videos, setVideos] = useState(course?.videos || []);
  const [newVideo, setNewVideo] = useState({
    title: '',
    url: '',
    duration: ''
  });

  useEffect(() => {
    if (course) {
      setVideos(course.videos || []);
    }
  }, [course]);

  const handleAddVideo = () => {
    if (!newVideo.title || !newVideo.url) return;
    
    setVideos([...videos, { ...newVideo, id: Date.now().toString() }]);
    setNewVideo({ title: '', url: '', duration: '' });
  };

  const handleRemoveVideo = (videoId) => {
    setVideos(videos.filter(video => video.id !== videoId));
  };

  const handleSave = () => {
    onSave({ ...course, videos });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Manage Videos - {course?.title}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Add New Video
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Title"
              value={newVideo.title}
              onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
              size="small"
            />
            <TextField
              label="Video URL"
              value={newVideo.url}
              onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
              size="small"
              fullWidth
            />
            <TextField
              label="Duration"
              value={newVideo.duration}
              onChange={(e) => setNewVideo({ ...newVideo, duration: e.target.value })}
              size="small"
              placeholder="e.g., 10:30"
            />
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddVideo}
            >
              Add
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          Course Videos
        </Typography>
        <List>
          {videos.map((video, index) => (
            <ListItem key={video.id}>
              <ListItemText
                primary={`${index + 1}. ${video.title}`}
                secondary={`Duration: ${video.duration}`}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  color="error"
                  onClick={() => handleRemoveVideo(video.id)}
                >
                  <Delete />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          {videos.length === 0 && (
            <Typography color="text.secondary" align="center">
              No videos added yet
            </Typography>
          )}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} startIcon={<Close />}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          startIcon={<Save />}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VideoManagement; 