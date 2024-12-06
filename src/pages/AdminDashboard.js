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
  Refresh
} from '@mui/icons-material';
import Header from '../components/Header';
import UserList from '../components/UserList';
import ProjectReview from '../components/ProjectReview';
import UserDetailsModal from '../components/UserDetailsModal';
import { motion } from 'framer-motion';

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

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header toggleColorMode={toggleColorMode} />
      
      <Container maxWidth="lg" sx={{ mt: 12, mb: 4, flex: 1 }}>
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
              <Button color="inherit" size="small" onClick={fetchData}>
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
            <Tab 
              icon={<People />} 
              label={`Users (${users.length})`} 
            />
            <Tab 
              icon={<Assignment />} 
              label={`Project Reviews (${submissions.length})`} 
            />
          </Tabs>
        </Paper>

        <Box sx={{ mt: 3, position: 'relative' }}>
          {loading && (
            <Box 
              sx={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                zIndex: 1
              }}
            >
              <CircularProgress />
            </Box>
          )}
          
          <Box sx={{ opacity: loading ? 0.5 : 1 }}>
            {activeTab === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <UserList 
                  users={users} 
                  onViewUser={setSelectedUser}
                />
              </motion.div>
            )}
            
            {activeTab === 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <ProjectReview
                  submissions={submissions}
                  onReview={() => {}}
                />
              </motion.div>
            )}
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