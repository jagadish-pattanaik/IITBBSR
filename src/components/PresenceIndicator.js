import { useState, useEffect } from 'react';
import { Tooltip, Badge } from '@mui/material';
import { styled } from '@mui/material/styles';
import { formatDistanceToNow } from 'date-fns';
import { subscribeToUserPresence } from '../services/presence';

const StyledBadge = styled(Badge)(({ theme, online }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: online ? '#44b700' : '#bdbdbd',
    color: online ? '#44b700' : '#bdbdbd',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: online ? 'ripple 1.2s infinite ease-in-out' : 'none',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

const PresenceIndicator = ({ userId, children }) => {
  const [presence, setPresence] = useState({ online: false, lastSeen: null });

  useEffect(() => {
    const unsubscribe = subscribeToUserPresence(userId, setPresence);
    return () => unsubscribe();
  }, [userId]);

  const tooltipTitle = presence.online
    ? 'Online'
    : presence.lastSeen
    ? `Last seen ${formatDistanceToNow(presence.lastSeen, { addSuffix: true })}`
    : 'Offline';

  return (
    <Tooltip title={tooltipTitle} arrow>
      <StyledBadge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        variant="dot"
        online={presence.online}
      >
        {children}
      </StyledBadge>
    </Tooltip>
  );
};

export default PresenceIndicator; 