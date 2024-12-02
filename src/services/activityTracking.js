import { db } from './firebase';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';

export const ActivityTypes = {
  VIDEO_WATCH: 'VIDEO_WATCH',
  PROJECT_SUBMIT: 'PROJECT_SUBMIT',
  QUIZ_COMPLETE: 'QUIZ_COMPLETE',
  COURSE_START: 'COURSE_START',
  COURSE_COMPLETE: 'COURSE_COMPLETE',
  LOGIN: 'LOGIN'
};

export const trackActivity = async (userId, activityType, data) => {
  try {
    const activityRef = collection(db, 'users', userId, 'activities');
    await addDoc(activityRef, {
      type: activityType,
      timestamp: serverTimestamp(),
      data
    });
  } catch (error) {
    console.error('Error tracking activity:', error);
  }
};

export const getRecentActivities = async (userId, limit = 10) => {
  try {
    const activitiesRef = collection(db, 'users', userId, 'activities');
    const q = query(
      activitiesRef,
      orderBy('timestamp', 'desc'),
      limit(limit)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching activities:', error);
    return [];
  }
}; 