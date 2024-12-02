import { AppBar, Toolbar, Button, IconButton, Box, useTheme } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBell from './NotificationBell';
import NotificationSound from './NotificationSound';

const Header = ({ toggleColorMode }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <AppBar position="fixed" color="inherit" elevation={0}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Box
            component="img"
            src="/logo.png"
            alt="Progresso"
            sx={{ height: 40, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          />
        </motion.div>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <NotificationBell />
          <NotificationSound />
          <AnimatePresence mode="wait">
            <motion.div
              key={theme.palette.mode}
              initial={{ opacity: 0, rotate: -180 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              <IconButton onClick={toggleColorMode} color="inherit">
                {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </motion.div>
          </AnimatePresence>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outlined"
              color="primary"
              onClick={() => window.open('https://official-website.com', '_blank')}
            >
              Official Website
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/login')}
            >
              Login / Sign Up
            </Button>
          </motion.div>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 