import { db } from '../services/firebase';
import { 
  collection, 
  query, 
  getDocs,
  where,
  orderBy,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
  arrayUnion
} from 'firebase/firestore';

// Cache for users data
let usersCache = null;
let lastFetchTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Add at the top with other cache variables
let quizzesCache = null;
let quizzesFetchTime = null;
const QUIZ_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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

  const getQuizzes = async (forceRefresh = false) => {
    try {
      // Return cached data if available and not expired
      const now = Date.now();
      if (!forceRefresh && quizzesCache && quizzesFetchTime && 
          (now - quizzesFetchTime < QUIZ_CACHE_DURATION)) {
        return quizzesCache;
      }

      // Get all quizzes
      const quizzesSnapshot = await getDocs(collection(db, 'quizzes'));
      const quizzes = [];

      // Process each quiz
      for (const quizDoc of quizzesSnapshot.docs) {
        const quizData = {
          id: quizDoc.id,
          ...quizDoc.data()
        };

        // If it's an internal quiz, get its questions
        if (quizData.type === 'internal') {
          const questionsSnapshot = await getDocs(
            query(collection(db, 'quizQuestions'), where('quizId', '==', quizDoc.id))
          );
          quizData.questions = questionsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
        }

        quizzes.push(quizData);
      }

      // Update cache
      quizzesCache = quizzes;
      quizzesFetchTime = now;

      return quizzes;
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      throw error;
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

  // Add function to invalidate cache
  const invalidateQuizzesCache = () => {
    quizzesCache = null;
    quizzesFetchTime = null;
  };

  const createQuiz = async (quizData) => {
    try {
      const batch = writeBatch(db);
      
      // Create quiz document
      const quizRef = doc(collection(db, 'quizzes'));
      const quizWithoutQuestions = {
        title: quizData.title,
        description: quizData.description,
        type: quizData.type,
        link: quizData.link || '',
        endTime: quizData.endTime,
        duration: Number(quizData.duration),
        level: quizData.level,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: {
          id: quizData.createdBy.id,
          name: quizData.createdBy.name
        },
        totalPoints: quizData.type === 'internal' ? 
          quizData.questions.reduce((sum, q) => sum + q.points, 0) : 0,
        totalQuestions: quizData.type === 'internal' ? quizData.questions.length : 0
      };
      
      batch.set(quizRef, quizWithoutQuestions);

      // Create questions if internal quiz
      if (quizData.type === 'internal' && quizData.questions?.length) {
        const questionsRef = collection(db, 'quizQuestions');
        quizData.questions.forEach((question) => {
          const questionDoc = doc(questionsRef);
          batch.set(questionDoc, {
            quizId: quizRef.id,
            ...question,
            createdAt: serverTimestamp()
          });
        });
      }

      await batch.commit();
      
      // Invalidate cache after successful creation
      invalidateQuizzesCache();
      
      // Return the new quiz data along with its ID
      return {
        id: quizRef.id,
        ...quizWithoutQuestions,
        questions: quizData.questions || []
      };
    } catch (error) {
      console.error('Error creating quiz:', error);
      throw error;
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
      const batch = writeBatch(db);
      
      // Update quiz document
      const quizRef = doc(db, 'quizzes', quizId);
      const quizUpdate = {
        title: quizData.title,
        description: quizData.description,
        type: quizData.type,
        link: quizData.link || '',
        endTime: quizData.endTime,
        duration: Number(quizData.duration),
        level: quizData.level,
        updatedAt: serverTimestamp(),
        totalPoints: quizData.type === 'internal' ? 
          quizData.questions.reduce((sum, q) => sum + q.points, 0) : 0,
        totalQuestions: quizData.type === 'internal' ? quizData.questions.length : 0
      };
      
      batch.update(quizRef, quizUpdate);

      // Delete existing questions
      const questionsSnapshot = await getDocs(
        query(collection(db, 'quizQuestions'), where('quizId', '==', quizId))
      );
      questionsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Add new questions if internal quiz
      if (quizData.type === 'internal' && quizData.questions?.length) {
        const questionsRef = collection(db, 'quizQuestions');
        quizData.questions.forEach((question) => {
          const questionDoc = doc(questionsRef);
          batch.set(questionDoc, {
            quizId: quizId,
            ...question,
            createdAt: serverTimestamp()
          });
        });
      }

      await batch.commit();
      
      // Invalidate cache after successful update
      invalidateQuizzesCache();
      
      // Return updated quiz data
      return {
        id: quizId,
        ...quizUpdate,
        questions: quizData.questions || []
      };
    } catch (error) {
      console.error('Error updating quiz:', error);
      throw error;
    }
  };

  const getQuizWithQuestions = async (quizId) => {
    try {
      // Get quiz data
      const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
      if (!quizDoc.exists()) return null;

      // Get questions
      const questionsSnapshot = await getDocs(
        query(collection(db, 'quizQuestions'), where('quizId', '==', quizId))
      );
      
      const questions = questionsSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .sort((a, b) => a.questionNumber - b.questionNumber);

      return {
        id: quizDoc.id,
        ...quizDoc.data(),
        questions
      };
    } catch (error) {
      console.error('Error fetching quiz with questions:', error);
      throw error;
    }
  };

  const deleteQuiz = async (quizId) => {
    try {
      const batch = writeBatch(db);
      
      // Delete quiz document
      batch.delete(doc(db, 'quizzes', quizId));

      // Delete associated questions
      const questionsSnapshot = await getDocs(
        query(collection(db, 'quizQuestions'), where('quizId', '==', quizId))
      );
      questionsSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      
      // Invalidate cache after successful deletion
      invalidateQuizzesCache();
    } catch (error) {
      console.error('Error deleting quiz:', error);
      throw error;
    }
  };

  const checkAnswer = (question, userAnswer) => {
    if (!userAnswer) return false;
    
    switch (question.type) {
      case 'mcq':
      case 'boolean':
        return userAnswer === question.options.find(opt => opt.isCorrect)?.text;
      
      case 'text':
        const correctText = question.answer;
        return question.caseSensitive ? 
          userAnswer === correctText :
          userAnswer.toLowerCase() === correctText.toLowerCase();
      
      case 'number':
        const correctNum = parseFloat(question.answer);
        const userNum = parseFloat(userAnswer);
        if (isNaN(correctNum) || isNaN(userNum)) return false;
        const tolerance = Math.abs(correctNum * question.tolerance);
        return Math.abs(userNum - correctNum) <= tolerance;
      
      default:
        return false;
    }
  };

  const submitQuizAttempt = async (attemptData) => {
    try {
      const batch = writeBatch(db);
      
      // Get quiz questions to calculate score
      const questionsSnapshot = await getDocs(
        query(collection(db, 'quizQuestions'), where('quizId', '==', attemptData.quizId))
      );
      
      const questions = questionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculate score
      let score = 0;
      questions.forEach(question => {
        if (checkAnswer(question, attemptData.answers[question.id])) {
          score += question.points;
        }
      });

      // Create attempt document
      const attemptRef = doc(collection(db, 'quizAttempts'));
      batch.set(attemptRef, {
        ...attemptData,
        score,
        submittedAt: serverTimestamp()
      });

      // Update leaderboard
      const leaderboardRef = doc(db, 'quizLeaderboard', attemptData.quizId);
      batch.set(leaderboardRef, {
        rankings: arrayUnion({
          userId: attemptData.userId,
          score,
          timeSpent: attemptData.timeSpent,
          submittedAt: serverTimestamp()
        })
      }, { merge: true });

      await batch.commit();
      return { attemptId: attemptRef.id, score };
    } catch (error) {
      console.error('Error submitting quiz attempt:', error);
      throw error;
    }
  };

  const getQuizResult = async (quizId, attemptId) => {
    try {
      const [attemptDoc, quizDoc, questionsSnapshot] = await Promise.all([
        getDoc(doc(db, 'quizAttempts', attemptId)),
        getDoc(doc(db, 'quizzes', quizId)),
        getDocs(query(collection(db, 'quizQuestions'), where('quizId', '==', quizId)))
      ]);

      if (!attemptDoc.exists() || !quizDoc.exists()) {
        throw new Error('Quiz result not found');
      }

      const attempt = attemptDoc.data();
      const quiz = quizDoc.data();
      const questions = questionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return {
        quiz,
        questions,
        attempt
      };
    } catch (error) {
      console.error('Error fetching quiz result:', error);
      throw error;
    }
  };

  const getQuizLeaderboard = async (quizId) => {
    try {
      const leaderboardDoc = await getDoc(doc(db, 'quizLeaderboard', quizId));
      if (!leaderboardDoc.exists()) return [];

      const { rankings } = leaderboardDoc.data();
      
      // Sort by score (desc) and time (asc)
      return rankings.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.timeSpent - b.timeSpent;
      });
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  };

  const getUserQuizAttempts = async (userId) => {
    try {
      const attemptsSnapshot = await getDocs(
        query(collection(db, 'quizAttempts'), where('userId', '==', userId))
      );
      
      return attemptsSnapshot.docs.reduce((acc, doc) => {
        acc[doc.data().quizId] = {
          id: doc.id,
          ...doc.data()
        };
        return acc;
      }, {});
    } catch (error) {
      console.error('Error fetching user quiz attempts:', error);
      throw error;
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
    deleteQuiz,
    getQuizWithQuestions,
    submitQuizAttempt,
    getQuizResult,
    getQuizLeaderboard,
    getUserQuizAttempts,
    invalidateQuizzesCache
  };
}; 