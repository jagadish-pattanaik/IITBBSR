import { useState, useEffect } from 'react';
import { useFirebase } from '../hooks/useFirebase';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tab,
  Tabs,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  People,
  Assignment
} from '@mui/icons-material';
import Header from '../components/Header';
import UserList from '../components/UserList';
import ProjectReview from '../components/ProjectReview';
import UserDetailsModal from '../components/UserDetailsModal';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const { getUsers, getSubmissions, reviewProject, loading, error } = useFirebase();
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, submissionsData] = await Promise.all([
          getUsers(),
          getSubmissions()
        ]);
        setUsers(usersData);
        setSubmissions(submissionsData);
      } catch (err) {
        console.error('Error fetching admin data:', err);
      }
    };

    fetchData();
  }, [getUsers, getSubmissions]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleProjectReview = async (submissionId, status) => {
    try {
      await reviewProject(submissionId, status);
      setSubmissions(prev =>
        prev.map(sub =>
          sub.id === submissionId ? { ...sub, status } : sub
        )
      );
    } catch (err) {
      console.error('Error reviewing project:', err);
    }
  };

  const handleViewUser = (userId) => {
    const user = users.find(u => u.id === userId);
    setSelectedUser(user);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      
      <Container maxWidth="lg" sx={{ mt: 12, mb: 4, flex: 1 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
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
            <Tab icon={<People />} label="Users" />
            <Tab icon={<Assignment />} label="Project Reviews" />
          </Tabs>
        </Paper>

        <Box sx={{ mt: 3 }}>
          {activeTab === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <UserList users={users} onViewUser={handleViewUser} />
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
                onReview={handleProjectReview}
              />
            </motion.div>
          )}
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