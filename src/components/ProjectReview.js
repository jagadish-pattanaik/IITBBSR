import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Link,
  Tooltip
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  GitHub,
  OpenInNew
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const ProjectReview = ({ submissions, onReview }) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Project Submissions
      </Typography>
      <List>
        {submissions.map((submission) => (
          <motion.div
            key={submission.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ListItem
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="subtitle1">
                      {submission.userName}
                    </Typography>
                    <Chip
                      label={submission.status}
                      color={
                        submission.status === 'pending'
                          ? 'warning'
                          : submission.status === 'approved'
                          ? 'success'
                          : 'error'
                      }
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                }
                secondary={
                  <>
                    <Typography variant="caption" display="block">
                      Project: {submission.projectTitle}
                    </Typography>
                    <Link
                      href={submission.githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ display: 'flex', alignItems: 'center', mt: 1 }}
                    >
                      <GitHub sx={{ fontSize: 16, mr: 0.5 }} />
                      View Repository
                      <OpenInNew sx={{ fontSize: 14, ml: 0.5 }} />
                    </Link>
                  </>
                }
              />
              <ListItemSecondaryAction>
                <Tooltip title="Approve">
                  <IconButton
                    color="success"
                    onClick={() => onReview(submission.id, 'approved')}
                    disabled={submission.status !== 'pending'}
                  >
                    <CheckCircle />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Reject">
                  <IconButton
                    color="error"
                    onClick={() => onReview(submission.id, 'rejected')}
                    disabled={submission.status !== 'pending'}
                  >
                    <Cancel />
                  </IconButton>
                </Tooltip>
              </ListItemSecondaryAction>
            </ListItem>
          </motion.div>
        ))}
        {submissions.length === 0 && (
          <Typography variant="body2" color="text.secondary" align="center">
            No pending submissions
          </Typography>
        )}
      </List>
    </Paper>
  );
};

export default ProjectReview; 