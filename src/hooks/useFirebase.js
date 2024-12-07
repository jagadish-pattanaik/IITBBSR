import { db } from '../services/firebase';
import { 
  collection, 
  query, 
  getDocs,
  where,
  orderBy,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp 
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

  // Admin Functions
  const createCourse = async (courseData) => {
    try {
      const coursesRef = collection(db, 'courses');
      const newCourse = {
        ...courseData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      const docRef = await addDoc(coursesRef, newCourse);
      return docRef.id;
    } catch (err) {
      console.error('Error creating course:', err);
      throw err;
    }
  };

  const addProjectToCourse = async (courseId, projectData) => {
    try {
      const projectsRef = collection(db, `courses/${courseId}/projects`);
      const newProject = {
        ...projectData,
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(projectsRef, newProject);
      return docRef.id;
    } catch (err) {
      console.error('Error adding project:', err);
      throw err;
    }
  };

  const createQuiz = async (quizData) => {
    try {
      const quizzesRef = collection(db, 'quizzes');
      await addDoc(quizzesRef, {
        ...quizData,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Error creating quiz:', err);
      throw err;
    }
  };

  const updateCourse = async (courseId, courseData) => {
    try {
      const courseRef = doc(db, 'courses', courseId);
      await updateDoc(courseRef, {
        ...courseData,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Error updating course:', err);
      throw err;
    }
  };

  const deleteCourse = async (courseId) => {
    try {
      await deleteDoc(doc(db, 'courses', courseId));
    } catch (err) {
      console.error('Error deleting course:', err);
      throw err;
    }
  };

  const updateQuiz = async (quizId, quizData) => {
    try {
      const quizRef = doc(db, 'quizzes', quizId);
      await updateDoc(quizRef, {
        ...quizData,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Error updating quiz:', err);
      throw err;
    }
  };

  const deleteQuiz = async (quizId) => {
    try {
      const quizRef = doc(db, 'quizzes', quizId);
      await deleteDoc(quizRef);
    } catch (err) {
      console.error('Error deleting quiz:', err);
      throw err;
    }
  };

  return {
    getCourses,
    getQuizzes,
    getUsers,
    // Admin functions
    createCourse,
    addProjectToCourse,
    createQuiz,
    updateCourse,
    deleteCourse,
    updateQuiz,
    deleteQuiz
  };
}; 