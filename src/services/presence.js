import { db, rtdb } from './firebase';
import { 
  doc, 
  setDoc, 
  serverTimestamp,
  onSnapshot,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { ref, onDisconnect } from 'firebase/database';

const PRESENCE_COLLECTION = 'presence';
const OFFLINE_THRESHOLD = 2 * 60 * 1000; // 2 minutes

export const initializePresence = async (userId) => {
  const userPresenceRef = doc(db, PRESENCE_COLLECTION, userId);

  // Set initial online status
  await setDoc(userPresenceRef, {
    online: true,
    lastSeen: serverTimestamp(),
    userId
  });

  // Set up disconnect hook
  await onDisconnect(userPresenceRef).update({
    online: false,
    lastSeen: serverTimestamp()
  });

  // Update lastSeen periodically while online
  setInterval(() => {
    setDoc(userPresenceRef, {
      online: true,
      lastSeen: serverTimestamp(),
      userId
    }, { merge: true });
  }, 30000); // Every 30 seconds
};

export const subscribeToUserPresence = (userId, callback) => {
  const presenceRef = doc(db, PRESENCE_COLLECTION, userId);
  return onSnapshot(presenceRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      const lastSeen = data.lastSeen?.toDate();
      const isOffline = lastSeen && (Date.now() - lastSeen.getTime() > OFFLINE_THRESHOLD);
      
      callback({
        online: data.online && !isOffline,
        lastSeen
      });
    }
  });
};

export const getOnlineUsers = async () => {
  const presenceRef = collection(db, PRESENCE_COLLECTION);
  const q = query(
    presenceRef,
    where('online', '==', true)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    userId: doc.id,
    ...doc.data(),
    lastSeen: doc.data().lastSeen?.toDate()
  }));
}; 