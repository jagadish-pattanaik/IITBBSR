import { Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme } from '@mui/material/styles';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';

// Import pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import CoursePage from './pages/CoursePage';
import AdminDashboard from './pages/AdminDashboard';
import QuizSection from './pages/QuizSection';
import AllCourses from './pages/AllCourses';
import AllQuizzes from './pages/AllQuizzes';
import QuizPage from './pages/QuizPage';
import QuizResult from './pages/QuizResult';

// Import providers and components
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';

function App() {
  const location = useLocation();
  const [mode, setMode] = useState(() => {
    // Get theme from localStorage or default to 'light'
    return localStorage.getItem('theme') || 'light';
  });

  const toggleColorMode = useCallback(() => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newMode); // Save to localStorage
      return newMode;
    });
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      const systemTheme = e.matches ? 'dark' : 'light';
      if (!localStorage.getItem('theme')) {
        setMode(systemTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === 'light' ? '#0047B3' : '#1976D2',
            light: mode === 'light' ? '#0066FF' : '#409EFF',
            dark: mode === 'light' ? '#003380' : '#0D47A1',
          },
          secondary: {
            main: '#F85149',
            light: '#FF6B6B',
            dark: '#D32F2F',
          },
          background: {
            default: mode === 'light' ? '#FFFFFF' : '#0D1117',
            paper: mode === 'light' ? '#F6F8FA' : '#161B22',
          },
          text: {
            primary: mode === 'light' ? '#24292F' : '#E6EDF3',
            secondary: mode === 'light' ? '#57606A' : '#8B949E',
          },
          action: {
            active: mode === 'light' ? '#24292F' : '#E6EDF3',
            hover: mode === 'light' ? 'rgba(0, 71, 179, 0.04)' : 'rgba(25, 118, 210, 0.08)',
          },
        },
        typography: {
          fontFamily: '"Poppins", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: {
            fontSize: '2.5rem',
            fontWeight: 600,
            lineHeight: 1.2,
          },
          h2: {
            fontSize: '2rem',
            fontWeight: 600,
            lineHeight: 1.3,
          },
          h3: {
            fontSize: '1.5rem',
            fontWeight: 600,
            lineHeight: 1.4,
          },
          body1: {
            fontSize: '1rem',
            lineHeight: 1.5,
          },
          button: {
            textTransform: 'none',
            fontWeight: 600,
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 6,
                padding: '6px 16px',
                transition: 'all 0.2s ease-in-out',
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  transform: 'translateY(-1px)',
                },
              },
              contained: {
                color: '#FFFFFF',
                boxShadow: mode === 'light' 
                  ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                  : '0 1px 3px 0 rgba(0, 0, 0, 0.3)',
                '&:hover': {
                  boxShadow: mode === 'light'
                    ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    : '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
                },
              },
              outlined: {
                borderWidth: '1.5px',
                '&:hover': {
                  borderWidth: '1.5px',
                },
              },
              containedPrimary: {
                background: mode === 'light'
                  ? 'linear-gradient(45deg, #0047B3, #0052CC)'
                  : 'linear-gradient(45deg, #1976D2, #2196F3)',
                '&:hover': {
                  background: mode === 'light'
                    ? 'linear-gradient(45deg, #003380, #0047B3)'
                    : 'linear-gradient(45deg, #0D47A1, #1976D2)',
                },
              },
              outlinedPrimary: {
                color: mode === 'light' ? '#0047B3' : '#1976D2',
                borderColor: mode === 'light' ? '#0047B3' : '#1976D2',
                '&:hover': {
                  backgroundColor: mode === 'light' 
                    ? 'rgba(0, 71, 179, 0.04)' 
                    : 'rgba(25, 118, 210, 0.08)',
                  borderColor: mode === 'light' ? '#003380' : '#0D47A1',
                },
              },
              textPrimary: {
                color: mode === 'light' ? '#0047B3' : '#1976D2',
                '&:hover': {
                  backgroundColor: mode === 'light' 
                    ? 'rgba(0, 71, 179, 0.04)' 
                    : 'rgba(25, 118, 210, 0.08)',
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                border: `1px solid ${mode === 'light' ? '#D0D7DE' : '#30363D'}`,
                boxShadow: mode === 'light' 
                  ? '0 3px 6px rgba(140,149,159,0.15)'
                  : '0 3px 6px rgba(0,0,0,0.3)',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundColor: mode === 'light' ? '#FFFFFF' : '#161B22',
                borderBottom: `1px solid ${mode === 'light' ? '#D0D7DE' : '#30363D'}`,
                boxShadow: 'none',
              },
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                backgroundColor: mode === 'light' ? '#F6F8FA' : '#161B22',
                borderRight: `1px solid ${mode === 'light' ? '#D0D7DE' : '#30363D'}`,
              },
            },
          },
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                overflowX: 'hidden',
              },
            },
          },
          MuiContainer: {
            styleOverrides: {
              root: {
                '@media (min-width: 600px)': {
                  paddingLeft: '24px',
                  paddingRight: '24px',
                },
              },
            },
          },
        },
        shape: {
          borderRadius: 6,
        },
        shadows: [
          'none',
          '0 1px 2px rgba(0, 0, 0, 0.07)',
          // ... you can define more shadow levels if needed
        ],
      }),
    [mode]
  );

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <ScrollToTop />
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home toggleColorMode={toggleColorMode} />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard toggleColorMode={toggleColorMode} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/course/:courseId"
                element={
                  <ProtectedRoute>
                    <CoursePage toggleColorMode={toggleColorMode} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard toggleColorMode={toggleColorMode} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quizzes"
                element={
                  <ProtectedRoute>
                    <AllQuizzes toggleColorMode={toggleColorMode} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/courses"
                element={
                  <ProtectedRoute>
                    <AllCourses toggleColorMode={toggleColorMode} />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/quiz/:quizId" 
                element={
                  <ProtectedRoute>
                    <QuizPage toggleColorMode={toggleColorMode} />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/quiz/:quizId/result/:attemptId" 
                element={
                  <ProtectedRoute>
                    <QuizResult toggleColorMode={toggleColorMode} />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </AnimatePresence>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
