import { useState } from 'react';
import { db, storage } from '../services/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc,
  orderBy,
  limit 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useLoadingError } from './useLoadingError';
import { trackActivity, ActivityTypes } from '../services/activityTracking';

export const useFirebase = () => {
  const {
    loading,
    error,
    withLoading,
    handleError
  } = useLoadingError();

  const getCourses = async () => {
    return withLoading(async () => {
      try {
        const coursesRef = collection(db, 'courses');
        const q = query(coursesRef, orderBy('order'));
        const querySnapshot = await getDocs(q);
        const courses = [];
        querySnapshot.forEach((doc) => {
          courses.push({ id: doc.id, ...doc.data() });
        });
        return courses;
      } catch (err) {
        handleError(err);
        throw err;
      }
    });
  };

  const getQuizzes = async () => {
    return withLoading(async () => {
      try {
        const now = new Date();
        const quizzesRef = collection(db, 'quizzes');
        const q = query(quizzesRef, where('endTime', '>', now));
        const querySnapshot = await getDocs(q);
        const quizzes = [];
        querySnapshot.forEach((doc) => {
          quizzes.push({ id: doc.id, ...doc.data() });
        });
        return quizzes;
      } catch (err) {
        handleError(err);
        throw err;
      }
    });
  };

  const updateVideoProgress = async (userId, courseId, videoId, progress) => {
    return withLoading(async () => {
      try {
        const progressRef = doc(db, 'users', userId, 'progress', `${courseId}_${videoId}`);
        await updateDoc(progressRef, {
          progress,
          lastUpdated: new Date()
        });
        
        // Track video watch activity
        if (progress === 100) {
          await trackActivity(userId, ActivityTypes.VIDEO_WATCH, {
            courseId,
            videoId,
            videoTitle: 'Video Title' // Replace with actual video title
          });
        }
      } catch (err) {
        handleError(err);
        throw err;
      }
    });
  };

  const submitProject = async (userId, courseId, projectId, githubLink) => {
    return withLoading(async () => {
      try {
        const submissionRef = doc(db, 'submissions', `${userId}_${courseId}_${projectId}`);
        await updateDoc(submissionRef, {
          githubLink,
          submittedAt: new Date(),
          status: 'pending'
        });

        // Track project submission activity
        await trackActivity(userId, ActivityTypes.PROJECT_SUBMIT, {
          courseId,
          projectId,
          projectTitle: 'Project Title' // Replace with actual project title
        });
      } catch (err) {
        handleError(err);
        throw err;
      }
    });
  };

  return {
    loading,
    error,
    getCourses,
    getQuizzes,
    updateVideoProgress,
    submitProject
  };
}; 