import { Card, CardContent, CardMedia, Typography, Box, LinearProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { cardVariants } from '../utils/animations';

const CourseCard = ({ course, onClick }) => {
  return (
    <motion.div
      whileHover="hover"
      whileTap="tap"
      variants={cardVariants}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        sx={{ 
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer'
        }}
        onClick={onClick}
      >
        <CardMedia
          component="img"
          height="140"
          image={course.image}
          alt={course.title}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" gutterBottom>
            {course.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {course.description}
          </Typography>
          <Box sx={{ mt: 'auto' }}>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              Progress: {course.progress || 0}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={course.progress || 0}
              sx={{ 
                height: 6, 
                borderRadius: 3,
                backgroundColor: 'rgba(0, 0, 203, 0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: 'primary.main',
                }
              }}
            />
          </Box>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              {course.duration} • {course.level}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CourseCard; 