import { db } from './firebase';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';

export const NotificationType = {
  ACHIEVEMENT: 'ACHIEVEMENT',
  REMINDER: 'REMINDER',
  ANNOUNCEMENT: 'ANNOUNCEMENT',
  COURSE_UPDATE: 'COURSE_UPDATE',
  FEEDBACK: 'FEEDBACK'
};

export const createNotification = async (userId, type, data) => {
  try {
    const notificationsRef = collection(db, 'users', userId, 'notifications');
    await addDoc(notificationsRef, {
      type,
      data,
      read: false,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (userId, notificationId) => {
  try {
    const notificationRef = doc(db, 'users', userId, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true,
      readAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (userId) => {
  try {
    const notificationsRef = collection(db, 'users', userId, 'notifications');
    const unreadQuery = query(notificationsRef, where('read', '==', false));
    const snapshot = await getDocs(unreadQuery);

    const updatePromises = snapshot.docs.map(doc =>
      updateDoc(doc.ref, {
        read: true,
        readAt: serverTimestamp()
      })
    );

    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

export const getUnreadNotificationsCount = async (userId) => {
  try {
    const notificationsRef = collection(db, 'users', userId, 'notifications');
    const unreadQuery = query(notificationsRef, where('read', '==', false));
    const snapshot = await getDocs(unreadQuery);
    return snapshot.size;
  } catch (error) {
    console.error('Error getting unread notifications count:', error);
    throw error;
  }
};

export const getRecentNotifications = async (userId) => {
  try {
    const notificationsRef = collection(db, 'users', userId, 'notifications');
    const recentQuery = query(
      notificationsRef,
      orderBy('timestamp', 'desc')
    );
    const snapshot = await getDocs(recentQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate()
    }));
  } catch (error) {
    console.error('Error getting recent notifications:', error);
    throw error;
  }
}; 