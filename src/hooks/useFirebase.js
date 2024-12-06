import { db } from '../services/firebase';
import { 
  collection, 
  query, 
  getDocs,
  where,
  orderBy 
} from 'firebase/firestore';

// Cache for users data
let usersCache = null;
let lastFetchTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useFirebase = () => {
  const getCourses = async () => {
    try {
      const coursesRef = collection(db, 'courses');
      const q = query(coursesRef);
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (err) {
      console.error('Error getting courses:', err);
      throw err;
    }
  };

  const getUsers = async (forceRefresh = false) => {
    try {
      // Return cached data if available and not expired
      const now = Date.now();
      if (!forceRefresh && usersCache && lastFetchTime && (now - lastFetchTime < CACHE_DURATION)) {
        return usersCache;
      }

      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Ensure all required fields exist to prevent undefined errors
        name: doc.data().name || 'N/A',
        email: doc.data().email || 'N/A',
        year: doc.data().year || 'N/A',
        branch: doc.data().branch || 'N/A',
        progress: doc.data().progress || { videosWatched: 0, projectsSubmitted: 0 }
      }));

      // Update cache
      usersCache = users;
      lastFetchTime = now;

      return users;
    } catch (err) {
      console.error('Error getting users:', err);
      throw err;
    }
  };

  const getQuizzes = async () => {
    try {
      const quizzesRef = collection(db, 'quizzes');
      const snapshot = await getDocs(quizzesRef);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (err) {
      console.error('Error getting quizzes:', err);
      throw err;
    }
  };

  return {
    getCourses,
    getQuizzes,
    getUsers
  };
}; 