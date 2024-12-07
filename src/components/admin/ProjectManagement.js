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

const ProjectManagement = ({ open, onClose, course, onSave }) => {
  const [projects, setProjects] = useState(course?.projects || []);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    requirements: ''
  });

  useEffect(() => {
    if (course) {
      setProjects(course.projects || []);
    }
  }, [course]);

  const handleAddProject = () => {
    if (!newProject.title || !newProject.description) return;
    
    setProjects([
      ...projects,
      {
        ...newProject,
        id: Date.now().toString(),
        requirements: newProject.requirements.split('\n').filter(r => r.trim())
      }
    ]);
    setNewProject({ title: '', description: '', requirements: '' });
  };

  const handleRemoveProject = (projectId) => {
    setProjects(projects.filter(project => project.id !== projectId));
  };

  const handleSave = () => {
    onSave({ ...course, projects });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Manage Projects - {course?.title}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Add New Project
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Title"
              value={newProject.title}
              onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
            />
            <TextField
              label="Description"
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              multiline
              rows={2}
            />
            <TextField
              label="Requirements (one per line)"
              value={newProject.requirements}
              onChange={(e) => setNewProject({ ...newProject, requirements: e.target.value })}
              multiline
              rows={3}
              placeholder="Enter each requirement on a new line"
            />
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddProject}
            >
              Add Project
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          Course Projects
        </Typography>
        <List>
          {projects.map((project, index) => (
            <ListItem key={project.id}>
              <ListItemText
                primary={`${index + 1}. ${project.title}`}
                secondary={
                  <>
                    <Typography variant="body2">{project.description}</Typography>
                    {Array.isArray(project.requirements) && project.requirements.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Requirements:
                        </Typography>
                        <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
                          {project.requirements.map((req, i) => (
                            <li key={i}><Typography variant="caption">{req}</Typography></li>
                          ))}
                        </ul>
                      </Box>
                    )}
                  </>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  color="error"
                  onClick={() => handleRemoveProject(project.id)}
                >
                  <Delete />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          {projects.length === 0 && (
            <Typography color="text.secondary" align="center">
              No projects added yet
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

export default ProjectManagement; 