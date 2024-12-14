import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  CircularProgress,
  Divider
} from '@mui/material';
import { EmojiEvents, Workspace } from '@mui/icons-material';
import { useFirebase } from '../hooks/useFirebase';

const LeaderboardDialog = ({ open, onClose, quizId, userAttempt }) => {
  const { getQuizLeaderboard } = useFirebase();
  const [loading, setLoading] = useState(true);
  const [rankings, setRankings] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!open) return;
      
      try {
        setLoading(true);
        const data = await getQuizLeaderboard(quizId);
        setRankings(data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [quizId, open, getQuizLeaderboard]);

  const renderRankItem = (rank, index) => {
    const isTop3 = index < 3;
    const isCurrentUser = rank.userId === userAttempt?.userId;

    return (
      <ListItem
        key={rank.userId}
        sx={{
          bgcolor: isCurrentUser ? 'action.selected' : 'transparent',
          borderRadius: 1
        }}
      >
        <ListItemAvatar>
          {isTop3 ? (
            <Avatar sx={{ 
              bgcolor: ['#FFD700', '#C0C0C0', '#CD7F32'][index]
            }}>
              <EmojiEvents />
            </Avatar>
          ) : (
            <Avatar>{index + 1}</Avatar>
          )}
        </ListItemAvatar>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography>{rank.userName}</Typography>
              {isCurrentUser && (
                <Chip size="small" label="You" color="primary" />
              )}
            </Box>
          }
          secondary={`Score: ${rank.score} points • Time: ${Math.floor(rank.timeSpent / 60)}:${String(rank.timeSpent % 60).padStart(2, '0')}`}
        />
      </ListItem>
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Leaderboard</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : rankings.length > 0 ? (
          <List>
            {rankings.map((rank, index) => (
              <Box key={rank.userId}>
                {index === 3 && (
                  <Divider sx={{ my: 2 }}>
                    <Chip label="Other Rankings" />
                  </Divider>
                )}
                {renderRankItem(rank, index)}
              </Box>
            ))}
          </List>
        ) : (
          <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
            No attempts yet
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LeaderboardDialog; 