import { db } from './firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  orderBy, 
  limit 
} from 'firebase/firestore';

export const subscribeToActivities = (userId, callback) => {
  const activitiesRef = collection(db, 'users', userId, 'activities');
  const q = query(
    activitiesRef,
    orderBy('timestamp', 'desc'),
    limit(20)
  );

  return onSnapshot(q, (snapshot) => {
    const activities = [];
    snapshot.forEach((doc) => {
      activities.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      });
    });
    callback(activities);
  });
};

export const subscribeToNotifications = (userId, callback) => {
  const notificationsRef = collection(db, 'users', userId, 'notifications');
  const q = query(
    notificationsRef,
    where('read', '==', false),
    orderBy('timestamp', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = [];
    snapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      });
    });
    callback(notifications);
  });
}; 