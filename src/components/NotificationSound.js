import { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemText,
  Switch,
  Tooltip
} from '@mui/material';
import { VolumeUp, VolumeOff } from '@mui/icons-material';
import { useNotifications } from '../contexts/NotificationContext';
import { playNotificationSound } from '../utils/soundEffects';

const NotificationSound = () => {
  const { soundEnabled, setSoundEnabled } = useNotifications();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleToggleSound = () => {
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) {
      playNotificationSound('default'); // Play test sound when enabling
    }
  };

  const handleTestSound = (type) => {
    playNotificationSound(type);
  };

  return (
    <>
      <Tooltip title={soundEnabled ? 'Sound On' : 'Sound Off'}>
        <IconButton color="inherit" onClick={handleClick}>
          {soundEnabled ? <VolumeUp /> : <VolumeOff />}
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem>
          <ListItemText primary="Notification Sound" />
          <Switch
            edge="end"
            checked={soundEnabled}
            onChange={handleToggleSound}
          />
        </MenuItem>
        <MenuItem onClick={() => handleTestSound('default')}>
          <ListItemText primary="Test Default Sound" />
        </MenuItem>
        <MenuItem onClick={() => handleTestSound('achievement')}>
          <ListItemText primary="Test Achievement Sound" />
        </MenuItem>
        <MenuItem onClick={() => handleTestSound('message')}>
          <ListItemText primary="Test Message Sound" />
        </MenuItem>
        <MenuItem onClick={() => handleTestSound('warning')}>
          <ListItemText primary="Test Warning Sound" />
        </MenuItem>
      </Menu>
    </>
  );
};

export default NotificationSound; 