import { useState, useCallback, useEffect } from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';
import ReactPlayer from 'react-player';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const VideoPlayer = ({ videoUrl, courseId, videoId, onComplete }) => {
  const { currentUser } = useAuth();
  const [played, setPlayed] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const checkCompletion = async () => {
      if (!currentUser?.uid) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const userData = userDoc.data();
        const isCompleted = userData?.completedVideos?.[`${courseId}_${videoId}`];
        
        if (isCompleted) {
          setCompleted(true);
          setPlayed(1);
        }
      } catch (error) {
        console.error('Error checking video completion:', error);
      }
    };

    checkCompletion();
  }, [currentUser?.uid, courseId, videoId]);

  const handleProgress = useCallback(async ({ played }) => {
    setPlayed(played);
    
    // Mark video as completed when 90% watched
    if (played > 0.9 && !completed) {
      setCompleted(true);
      
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          'progress.videosWatched': increment(1)
        });

        // Call onComplete prop if provided
        if (onComplete) {
          onComplete(videoId);
        }
      } catch (error) {
        console.error('Error updating video progress:', error);
      }
    }
  }, [courseId, videoId, currentUser?.uid, completed, onComplete]);

  const handleVideoEnd = () => {
    if (onComplete && !completed) {
      onComplete(videoId);
      setCompleted(true);
    }
  };

  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      <ReactPlayer
        url={videoUrl}
        width="100%"
        height="auto"
        controls
        onProgress={handleProgress}
        style={{ aspectRatio: '16/9' }}
        onEnded={handleVideoEnd}
      />
      <Box sx={{ mt: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Progress: {Math.round(played * 100)}%
          {completed && " ✓ Completed"}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={played * 100}
          sx={{
            height: 4,
            borderRadius: 2,
            backgroundColor: 'rgba(0, 0, 203, 0.1)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: completed ? 'success.main' : 'primary.main',
            }
          }}
        />
      </Box>
    </Box>
  );
};

export default VideoPlayer; 