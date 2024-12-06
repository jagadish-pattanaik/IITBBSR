import { useState, useEffect, useCallback } from 'react';
import { useFirebase } from '../hooks/useFirebase';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import {
  People,
  Assignment,
  Refresh,
  School
} from '@mui/icons-material';
import Header from '../components/Header';
import UserList from '../components/UserList';
import ProjectReview from '../components/ProjectReview';
import UserDetailsModal from '../components/UserDetailsModal';
import { motion } from 'framer-motion';
import CourseManagement from '../components/admin/CourseManagement';

const AdminDashboard = ({ toggleColorMode }) => {
  const { getUsers } = useFirebase();
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (loading) return; // Prevent multiple fetches

    try {
      setLoading(true);
      setError(null);
      
      const usersData = await getUsers();
      console.log('Fetched users data:', usersData);
      
      if (Array.isArray(usersData)) {
        setUsers(usersData);
      } else {
        console.error('Users data is not an array:', usersData);
        setUsers([]);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Failed to load data. Please try again.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [getUsers]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleRetry = () => {
    fetchData();
  };

  const tabs = [
    { icon: <People />, label: 'Users', component: <UserList users={users} onViewUser={setSelectedUser} /> },
    { icon: <School />, label: 'Courses', component: <CourseManagement /> },
    { icon: <Assignment />, label: 'Projects', component: <ProjectReview submissions={submissions} onReview={() => {}} /> }
  ];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <Header toggleColorMode={toggleColorMode} />
      
      <Container maxWidth="lg" sx={{ mt: 12, mb: 4, flex: 1, position: 'relative' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Admin Dashboard
          </Typography>
          <Button
            startIcon={<Refresh />}
            onClick={fetchData}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 4 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={handleRetry}
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        <Paper sx={{ mb: 4 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
          >
            {tabs.map((tab, index) => (
              <Tab 
                key={index}
                icon={tab.icon} 
                label={tab.label}
              />
            ))}
          </Tabs>
        </Paper>

        <Box sx={{ mt: 3, position: 'relative' }}>
          <Box sx={{ opacity: loading ? 0.5 : 1, transition: 'opacity 0.3s' }}>
            {tabs[activeTab].component}
          </Box>
        </Box>
      </Container>

      <UserDetailsModal
        open={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        user={selectedUser}
      />
    </Box>
  );
};

export default AdminDashboard; 