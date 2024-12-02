import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const checkIsAdmin = async (userId) => {
  try {
    const adminRef = doc(db, 'admins', userId);
    const adminDoc = await getDoc(adminRef);
    return adminDoc.exists();
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

export const requireAdmin = async (userId) => {
  const isAdmin = await checkIsAdmin(userId);
  if (!isAdmin) {
    throw new Error('Unauthorized: Admin access required');
  }
  return true;
}; 