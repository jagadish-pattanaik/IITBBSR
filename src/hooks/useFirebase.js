import { db } from '../services/firebase';
import { 
  collection, 
  query, 
  getDocs, 
  orderBy 
} from 'firebase/firestore';

export const useFirebase = () => {
  const getCourses = async () => {
    try {
      const coursesRef = collection(db, 'courses');
      const q = query(coursesRef, orderBy('order'));
      const snapshot = await getDocs(q);
      
      const courses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return courses;
    } catch (err) {
      console.error('Error getting courses:', err);
      throw err;
    }
  };

  const getQuizzes = async () => {
    try {
      const now = new Date();
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
    getQuizzes
  };
}; 