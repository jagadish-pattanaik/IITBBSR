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
  Chip,
  LinearProgress
} from '@mui/material';
import { 
  Close, 
  Email, 
  School, 
  Code,
  OndemandVideo,
  Assignment,
  Quiz,
  Timeline
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const UserDetailsModal = ({ open, onClose, user }) => {
  if (!user) return null;

  const progressStats = [
    {
      icon: <OndemandVideo />,
      label: 'Videos Watched',
      value: user.progress?.videosWatched || 0,
      total: 30,
      color: 'primary'
    },
    {
      icon: <Assignment />,
      label: 'Projects Submitted',
      value: user.progress?.projectsSubmitted || 0,
      total: 10,
      color: 'secondary'
    },
    {
      icon: <School />,
      label: 'Courses Completed',
      value: user.progress?.coursesCompleted || 0,
      total: 5,
      color: 'success'
    }
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">User Statistics</Typography>
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
                  primary="Graduating Year"
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <School sx={{ fontSize: 18, mr: 1 }} />
                      {user.graduatingYear}
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
            <Box sx={{ mt: 2 }}>
              {progressStats.map((stat, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {stat.icon}
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {stat.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                      {stat.value} / {stat.total}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(stat.value / stat.total) * 100}
                    color={stat.color}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Activity Timeline
            </Typography>
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Timeline sx={{ color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary" align="center">
                Joined on {new Date(user.createdAt?.seconds * 1000).toLocaleDateString()}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsModal; 