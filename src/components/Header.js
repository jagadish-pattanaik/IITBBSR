import { AppBar, Toolbar, Button, IconButton, Box, useTheme } from '@mui/material';
import { Brightness4, Brightness7, Dashboard, Logout, Home, AdminPanelSettings } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { checkIsAdmin } from '../utils/adminCheck';
import { useState, useEffect, useCallback } from 'react';

const Header = ({ toggleColorMode }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout, isAdmin } = useAuth();
  const isHomePage = location.pathname === '/';
  const isDashboardPage = location.pathname === '/dashboard';
  const isAdminPage = location.pathname === '/admin';
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLogoLoad = useCallback(() => {
    setLogoLoaded(true);
    setLogoError(false);
  }, []);

  const handleLogoError = useCallback(() => {
    setLogoError(true);
    setLogoLoaded(true);
  }, []);

  const handleAuthAction = () => {
    if (currentUser) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <AppBar position="fixed" color="inherit" elevation={0}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <motion.div
            initial={false}
            animate={{ 
              opacity: logoLoaded ? 1 : 0,
              scale: logoLoaded ? 1 : 0.95
            }}
            transition={{ duration: 0.2 }}
          >
            <Box
              component="img"
              src={logoError ? '/default-logo.png' : '/logo.png'}
              alt="Progresso"
              sx={{ 
                height: 40, 
                cursor: 'pointer',
                visibility: logoLoaded ? 'visible' : 'hidden'
              }}
              onClick={() => navigate('/')}
              onLoad={handleLogoLoad}
              onError={handleLogoError}
            />
          </motion.div>
          
          {!isHomePage && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                startIcon={<Home />}
                onClick={() => navigate('/')}
                sx={{ ml: 2 }}
                color="inherit"
              >
                Home
              </Button>
            </motion.div>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <IconButton onClick={toggleColorMode} color="inherit">
            {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
          
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

          {currentUser ? (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {isAdmin && !isAdminPage && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<AdminPanelSettings />}
                    onClick={() => navigate('/admin')}
                  >
                    Admin Panel
                  </Button>
                </motion.div>
              )}

              {isAdmin && isAdminPage && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<Dashboard />}
                    onClick={() => navigate('/dashboard')}
                  >
                    My Dashboard
                  </Button>
                </motion.div>
              )}

              {!isDashboardPage && !isAdmin && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<Dashboard />}
                    onClick={() => navigate('/dashboard')}
                  >
                    Dashboard
                  </Button>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Logout />}
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </motion.div>
            </Box>
          ) : (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={handleAuthAction}
              >
                Login / Sign Up
              </Button>
            </motion.div>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 