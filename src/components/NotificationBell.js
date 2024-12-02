import { useState } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Notifications,
  CheckCircle,
  Error,
  Info
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const notificationIcons = {
  success: <CheckCircle color="success" />,
  error: <Error color="error" />,
  info: <Info color="info" />
};

const NotificationBell = () => {
  const { notifications, unreadCount } = useNotifications();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error">
          <Notifications />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 320, maxHeight: 400 }
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">Notifications</Typography>
        </Box>

        <List sx={{ p: 0 }}>
          <AnimatePresence>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <ListItem
                    sx={{
                      borderBottom: 1,
                      borderColor: 'divider',
                      bgcolor: notification.read ? 'transparent' : 'action.hover'
                    }}
                  >
                    <ListItemIcon>
                      {notificationIcons[notification.type]}
                    </ListItemIcon>
                    <ListItemText
                      primary={notification.message}
                      secondary={formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                    />
                  </ListItem>
                </motion.div>
              ))
            ) : (
              <ListItem>
                <ListItemText
                  primary="No notifications"
                  sx={{ textAlign: 'center', color: 'text.secondary' }}
                />
              </ListItem>
            )}
          </AnimatePresence>
        </List>
      </Menu>
    </>
  );
};

export default NotificationBell; 