import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { checkIsAdmin } from '../utils/adminCheck';
import LoadingScreen from './LoadingScreen';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { currentUser } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(adminOnly);

  useEffect(() => {
    if (adminOnly && currentUser) {
      checkIsAdmin(currentUser.uid)
        .then(result => {
          setIsAdmin(result);
          setLoading(false);
        })
        .catch(() => {
          setIsAdmin(false);
          setLoading(false);
        });
    }
  }, [adminOnly, currentUser]);

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return <LoadingScreen message="Checking permissions..." />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default ProtectedRoute; 