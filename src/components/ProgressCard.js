import { Box, Paper, Typography, LinearProgress } from '@mui/material';
import { motion } from 'framer-motion';

const ProgressCard = ({ title, value, total, icon, color }) => {
  const percentage = Math.round((value / total) * 100);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ color: color, mr: 2 }}>{icon}</Box>
          <Typography variant="h6">{title}</Typography>
        </Box>
        <Typography variant="h4" gutterBottom>
          {value}/{total}
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={percentage} 
          sx={{ 
            height: 8, 
            borderRadius: 4,
            backgroundColor: `${color}20`,
            '& .MuiLinearProgress-bar': {
              backgroundColor: color,
            }
          }} 
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {percentage}% Complete
        </Typography>
      </Paper>
    </motion.div>
  );
};

export default ProgressCard; 