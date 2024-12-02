import { useState, useCallback } from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';
import ReactPlayer from 'react-player';
import { useAuth } from '../contexts/AuthContext';
import { useFirebase } from '../hooks/useFirebase';

const VideoPlayer = ({ videoUrl, courseId, videoId, onProgress }) => {
  const { currentUser } = useAuth();
  const { updateVideoProgress } = useFirebase();
  const [played, setPlayed] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const handleProgress = useCallback(({ played }) => {
    setPlayed(played);
    if (played > 0.9 && !loaded) { // Mark as completed when 90% watched
      setLoaded(true);
      updateVideoProgress(currentUser.uid, courseId, videoId, 100);
      onProgress && onProgress(videoId);
    }
  }, [courseId, videoId, currentUser, updateVideoProgress, loaded, onProgress]);

  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      <ReactPlayer
        url={videoUrl}
        width="100%"
        height="auto"
        controls
        onProgress={handleProgress}
        style={{ aspectRatio: '16/9' }}
      />
      <Box sx={{ mt: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Progress: {Math.round(played * 100)}%
        </Typography>
        <LinearProgress
          variant="determinate"
          value={played * 100}
          sx={{
            height: 4,
            borderRadius: 2,
            backgroundColor: 'rgba(0, 0, 203, 0.1)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: 'primary.main',
            }
          }}
        />
      </Box>
    </Box>
  );
};

export default VideoPlayer; 