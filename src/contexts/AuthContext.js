import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../services/firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp 
} from 'firebase/firestore';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const createUserDocument = async (user) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        await setDoc(userRef, {
          email: user.email,
          name: user.displayName,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
          year: null,
          branch: null,
          role: 'user',
          progress: {
            videosWatched: 0,
            projectsSubmitted: 0
          }
        });
        return true; // New user
      }
      return false; // Existing user
    } catch (error) {
      console.error('Error creating user document:', error);
      return false;
    }
  };

  const googleSignIn = async () => {
    try {
      console.log('Starting Google Sign In...');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('Sign in successful:', user.email);

      const isNewUser = await createUserDocument(user);
      return { isNewUser, user };
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      console.log('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          await createUserDocument(user);
        } catch (error) {
          console.error('Error in auth state change:', error);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    googleSignIn,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 