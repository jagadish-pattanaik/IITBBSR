import { Card, CardContent, CardMedia, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';
import { cardVariants } from '../utils/animations';
import { CheckCircle } from '@mui/icons-material';

const CourseCard = ({ course, onClick, isCompleted }) => {
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
          cursor: 'pointer',
          position: 'relative',
          border: theme => isCompleted ? `2px solid ${theme.palette.success.main}` : 'none',
        }}
        onClick={onClick}
      >
        {isCompleted && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'success.main',
              borderRadius: '50%',
              p: 0.5,
              zIndex: 1,
            }}
          >
            <CheckCircle sx={{ color: 'white', fontSize: 20 }} />
          </Box>
        )}
        <CardMedia
          component="img"
          height="140"
          image={course.image}
          alt={course.title}
          sx={{
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" gutterBottom>
            {course.title}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {course.description}
          </Typography>
          <Box sx={{ 
            mt: 'auto', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{
                px: 1,
                py: 0.5,
                borderRadius: 1,
                bgcolor: 'action.hover',
              }}
            >
              {course.duration} • {course.level}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CourseCard; 