import { useState, useEffect, useCallback } from 'react';
import { useFirebase } from '../hooks/useFirebase';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  Button,
  Stack,
  Grid,
  Card
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  People,
  Assignment,
  Refresh,
  School,
  Quiz
} from '@mui/icons-material';
import Header from '../components/Header';
import UserList from '../components/UserList';
import ProjectReview from '../components/ProjectReview';
import UserDetailsModal from '../components/UserDetailsModal';
import CourseManagement from '../components/admin/CourseManagement';
import QuizManagement from '../components/admin/QuizManagement';
import { collection, query, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { motion } from 'framer-motion';
import LoadingShimmer from '../components/LoadingShimmer';

const AdminContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(12),
  paddingBottom: theme.spacing(8),
}));

const DashboardCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '100%',
    height: '4px',
    background: `linear-gradient(90deg, 
      ${theme.palette.primary.main}, 
      ${theme.palette.primary.light})`,
    opacity: 0.8,
  },
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '3px 3px 0 0',
  },
  '& .MuiTab-root': {
    textTransform: 'none',
    minWidth: 0,
    padding: theme.spacing(2, 4),
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.palette.text.secondary,
    '&.Mui-selected': {
      color: theme.palette.primary.main,
    },
    '& .MuiSvgIcon-root': {
      marginBottom: 0,
      marginRight: theme.spacing(1),
    },
  },
}));

const TabPanel = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 0),
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.palette.mode === 'light'
      ? '0 8px 24px rgba(140,149,159,0.2)'
      : '0 8px 24px rgba(0,0,0,0.4)',
  },
  '& .MuiSvgIcon-root': {
    fontSize: 40,
    marginBottom: theme.spacing(1),
    color: theme.palette.primary.main,
  },
}));

const LoadingState = () => (
  <Box sx={{ width: '100%' }}>
    <Grid container spacing={3}>
      {[...Array(4)].map((_, i) => (
        <Grid item xs={12} sm={6} md={3} key={i}>
          <LoadingShimmer height={120} />
        </Grid>
      ))}
    </Grid>
    <Box sx={{ mt: 4 }}>
      <LoadingShimmer height={400} />
    </Box>
  </Box>
);

const AdminDashboard = ({ toggleColorMode }) => {
  const { getUsers } = useFirebase();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataFetched, setDataFetched] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch users and submissions in parallel
      const [usersData, submissionsSnapshot] = await Promise.all([
        getUsers(),
        getDocs(collection(db, 'submissions'))
      ]);

      setUsers(usersData || []);
      
      const submissionsData = submissionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSubmissions(submissionsData);

      setDataFetched(true);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [getUsers]);

  useEffect(() => {
    if (!dataFetched) {
      fetchData();
    }
  }, [fetchData, dataFetched]);

  const handleReviewSubmission = async (submissionId, status) => {
    try {
      const submissionRef = doc(db, 'submissions', submissionId);
      await updateDoc(submissionRef, {
        status,
        reviewedAt: serverTimestamp(),
        reviewedBy: {
          id: currentUser.uid,
          name: currentUser.displayName
        }
      });

      setSubmissions(prev => prev.map(sub => 
        sub.id === submissionId ? {
          ...sub,
          status,
          reviewedAt: new Date(),
          reviewedBy: {
            id: currentUser.uid,
            name: currentUser.displayName
          }
        } : sub
      ));
    } catch (error) {
      console.error('Error updating submission:', error);
      setError('Failed to update submission');
    }
  };

  const handleRefresh = () => {
    setDataFetched(false);
  };

  const tabs = [
    {
      label: 'Users',
      icon: <People />,
      component: <UserList users={users} onViewUser={setSelectedUser} />
    },
    {
      label: 'Courses',
      icon: <School />,
      component: <CourseManagement />
    },
    {
      label: 'Projects',
      icon: <Assignment />,
      component: <ProjectReview submissions={submissions} onReview={handleReviewSubmission} />
    },
    {
      label: 'Quizzes',
      icon: <Quiz />,
      component: <QuizManagement />
    }
  ];

  const statCards = [
    {
      icon: <People fontSize="large" />,
      title: 'Total Users',
      getValue: (data) => data.users.length,
    },
    {
      icon: <School fontSize="large" />,
      title: 'Active Courses',
      getValue: (data) => data.courses?.length || 0,
    },
    {
      icon: <Assignment fontSize="large" />,
      title: 'Pending Reviews',
      getValue: (data) => data.submissions.filter(s => s.status === 'pending').length,
    },
    {
      icon: <Quiz fontSize="large" />,
      title: 'Active Quizzes',
      getValue: (data) => data.quizzes?.length || 0,
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header toggleColorMode={toggleColorMode} />
      
      <AdminContainer>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Admin Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your platform's content and users
            </Typography>
          </Box>

          {/* Stats Overview */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {statCards.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <StatCard>
                  {stat.icon}
                  <Typography variant="h4" sx={{ mt: 1 }}>
                    {loading ? (
                      <LoadingShimmer width={60} height={40} />
                    ) : (
                      stat.getValue({ users, submissions })
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                </StatCard>
              </Grid>
            ))}
          </Grid>

          {/* Main Content */}
          <DashboardCard>
            <StyledTabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              {tabs.map((tab, index) => (
                <Tab
                  key={index}
                  icon={tab.icon}
                  label={tab.label}
                  id={`tab-${index}`}
                  aria-controls={`tabpanel-${index}`}
                />
              ))}
            </StyledTabs>

            {loading ? (
              <LoadingState />
            ) : (
              <TabPanel>
                {tabs[activeTab].component}
              </TabPanel>
            )}
          </DashboardCard>
        </motion.div>
      </AdminContainer>

      <UserDetailsModal
        open={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        user={selectedUser}
      />
    </Box>
  );
};

export default AdminDashboard; 