import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  getUnreadNotificationsCount,
  getRecentNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../services/notificationService';
import { playNotificationSound } from '../utils/soundEffects';
import { db } from '../services/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot 
} from 'firebase/firestore';

const NotificationContext = createContext();

export const useNotifications = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      try {
        const [recentNotifications, count] = await Promise.all([
          getRecentNotifications(currentUser.uid),
          getUnreadNotificationsCount(currentUser.uid)
        ]);
        setNotifications(recentNotifications);
        setUnreadCount(count);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = onSnapshot(
      query(
        collection(db, 'users', currentUser.uid, 'notifications'),
        where('read', '==', false),
        orderBy('timestamp', 'desc'),
        limit(1)
      ),
      (snapshot) => {
        if (!snapshot.empty && soundEnabled) {
          const notification = snapshot.docs[0].data();
          playNotificationSound(notification.type.toLowerCase());
        }
      }
    );

    return () => unsubscribe();
  }, [currentUser, soundEnabled]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(currentUser.uid, notificationId);
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(currentUser.uid);
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    soundEnabled,
    setSoundEnabled
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 