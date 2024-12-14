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
  Stack
} from '@mui/material';
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

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header toggleColorMode={toggleColorMode} />
      
      <Container maxWidth="lg" sx={{ mt: 12, mb: 4, flex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Admin Dashboard</Typography>
          <Button
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 4 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        <Paper sx={{ mb: 4 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
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

        <Box sx={{ position: 'relative' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            tabs[activeTab].component
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