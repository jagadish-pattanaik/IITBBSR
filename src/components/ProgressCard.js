import { Box, Paper, Typography, CircularProgress } from '@mui/material';
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
        
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <CircularProgress
            variant="determinate"
            value={percentage}
            size={80}
            thickness={4}
            sx={{
              color: color,
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              },
            }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant="caption"
              component="div"
              color="text.secondary"
              sx={{ fontWeight: 600 }}
            >
              {`${percentage}%`}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {value} of {total} completed
          </Typography>
        </Box>
      </Paper>
    </motion.div>
  );
};

export default ProgressCard; 