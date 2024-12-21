import { AppBar, Toolbar, IconButton, Box, Button, Avatar, Menu, MenuItem, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { Brightness4, Brightness7, Dashboard, Logout, Home, AdminPanelSettings } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { checkIsAdmin } from '../utils/adminCheck';
import { useState, useEffect, useCallback } from 'react';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  transition: 'all 0.3s ease',
  backdropFilter: 'blur(8px)',
  backgroundColor: theme.palette.mode === 'light' 
    ? 'rgba(255, 255, 255, 0.8)'
    : 'rgba(22, 27, 34, 0.8)',
}));

const StyledToolbar = styled(Toolbar)({
  display: 'flex',
  justifyContent: 'space-between',
  padding: '8px 24px',
});

const NavButton = styled(Button)(({ theme }) => ({
  margin: '0 8px',
  padding: '6px 16px',
  color: theme.palette.mode === 'light' ? theme.palette.primary.main : theme.palette.primary.light,
  '&:hover': {
    backgroundColor: theme.palette.mode === 'light' 
      ? 'rgba(26, 115, 232, 0.04)'
      : 'rgba(130, 177, 255, 0.08)',
  },
  '&.MuiButton-contained': {
    color: '#FFFFFF',
    backgroundColor: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  cursor: 'pointer',
  border: `2px solid ${theme.palette.divider}`,
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const ThemeToggle = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.primary,
  marginLeft: '8px',
  padding: '8px',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'light'
      ? 'rgba(208, 215, 222, 0.32)'
      : 'rgba(48, 54, 61, 0.48)',
  },
}));

const Header = ({ toggleColorMode }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, googleSignIn, logout, isAdmin } = useAuth();
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

  const handleAuthAction = async () => {
    if (currentUser) {
      navigate('/dashboard');
    } else {
      try {
        const result = await googleSignIn();
        if (result.isAdmin) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Login error:', error);
      }
    }
  };

  return (
    <StyledAppBar position="fixed" color="inherit" elevation={0}>
      <StyledToolbar>
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
              <NavButton
                startIcon={<Home />}
                onClick={() => navigate('/')}
                sx={{ ml: 2 }}
                color="inherit"
              >
                Home
              </NavButton>
            </motion.div>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <ThemeToggle onClick={toggleColorMode} color="inherit">
            {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </ThemeToggle>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <NavButton
              variant="outlined"
              color="primary"
              onClick={() => window.open('https://official-website.com', '_blank')}
            >
              Official Website
            </NavButton>
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
                  <NavButton
                    variant="outlined"
                    color="primary"
                    startIcon={<AdminPanelSettings />}
                    onClick={() => navigate('/admin')}
                  >
                    Admin Panel
                  </NavButton>
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
                  <NavButton
                    variant="outlined"
                    color="primary"
                    startIcon={<Dashboard />}
                    onClick={() => navigate('/dashboard')}
                  >
                    My Dashboard
                  </NavButton>
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
                  <NavButton
                    variant="outlined"
                    color="primary"
                    startIcon={<Dashboard />}
                    onClick={() => navigate('/dashboard')}
                  >
                    Dashboard
                  </NavButton>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <NavButton
                  variant="contained"
                  color="primary"
                  startIcon={<Logout />}
                  onClick={handleLogout}
                  sx={{
                    color: '#FFFFFF',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  }}
                >
                  Logout
                </NavButton>
              </motion.div>
            </Box>
          ) : (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <NavButton
                variant="contained"
                color="primary"
                onClick={handleAuthAction}
              >
                {currentUser ? 'Go to Dashboard' : 'Login with Google'}
              </NavButton>
            </motion.div>
          )}
        </Box>
      </StyledToolbar>
    </StyledAppBar>
  );
};

export default Header; 