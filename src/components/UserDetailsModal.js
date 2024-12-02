import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Avatar,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';
import { Close, Email, School, Code } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const MotionDialog = motion(Dialog);

const UserDetailsModal = ({ open, onClose, user }) => {
  if (!user) return null;

  return (
    <MotionDialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.3 }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">User Details</Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            src={user.photoURL}
            alt={user.name}
            sx={{ width: 80, height: 80, mr: 2 }}
          />
          <Box>
            <Typography variant="h5">{user.name}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Email sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Academic Information
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText
                  primary="Year"
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <School sx={{ fontSize: 18, mr: 1 }} />
                      {user.year}
                    </Box>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Branch"
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <Code sx={{ fontSize: 18, mr: 1 }} />
                      {user.branch}
                    </Box>
                  }
                />
              </ListItem>
            </List>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Progress Overview
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText
                  primary="Videos Watched"
                  secondary={
                    <Chip
                      label={user.progress.videosWatched}
                      color="primary"
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Projects Submitted"
                  secondary={
                    <Chip
                      label={user.progress.projectsSubmitted}
                      color="secondary"
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Quizzes Completed"
                  secondary={
                    <Chip
                      label={user.progress.quizzesTaken}
                      color="success"
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  }
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>

        {/* Add more sections as needed */}
      </DialogContent>
    </MotionDialog>
  );
};

export default UserDetailsModal; 