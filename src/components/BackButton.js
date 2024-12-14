import { Button, Box } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ mb: 3 }}>
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          onClick={() => navigate(-1)}
          startIcon={<ArrowBack />}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'action.hover',
              transform: 'translateX(-4px)',
            },
            transition: 'transform 0.3s ease',
            fontWeight: 500,
            textTransform: 'none',
            fontSize: '1rem'
          }}
        >
          Back
        </Button>
      </motion.div>
    </Box>
  );
};

export default BackButton; 