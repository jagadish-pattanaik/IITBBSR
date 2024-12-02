import { db } from './firebase';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { subDays, format, eachDayOfInterval } from 'date-fns';

export const getPresenceStats = async () => {
  const presenceRef = collection(db, 'presence');
  const thirtyDaysAgo = subDays(new Date(), 30);

  try {
    // Get currently online users
    const onlineQuery = query(presenceRef, where('online', '==', true));
    const onlineSnapshot = await getDocs(onlineQuery);
    const onlineCount = onlineSnapshot.size;

    // Get active users in last 24 hours
    const recentQuery = query(
      presenceRef,
      where('lastSeen', '>=', Timestamp.fromDate(subDays(new Date(), 1)))
    );
    const recentSnapshot = await getDocs(recentQuery);
    const recentCount = recentSnapshot.size;

    // Get daily active users for the last 30 days
    const dailyActiveUsers = {};
    const allUsersQuery = query(
      presenceRef,
      where('lastSeen', '>=', Timestamp.fromDate(thirtyDaysAgo))
    );
    const allUsersSnapshot = await getDocs(allUsersQuery);

    allUsersSnapshot.forEach(doc => {
      const date = format(doc.data().lastSeen.toDate(), 'yyyy-MM-dd');
      dailyActiveUsers[date] = (dailyActiveUsers[date] || 0) + 1;
    });

    // Format data for charts
    const days = eachDayOfInterval({
      start: thirtyDaysAgo,
      end: new Date()
    });

    const dailyActiveData = days.map(day => ({
      date: format(day, 'MMM dd'),
      users: dailyActiveUsers[format(day, 'yyyy-MM-dd')] || 0
    }));

    return {
      currentlyOnline: onlineCount,
      activeToday: recentCount,
      dailyActive: dailyActiveData,
      totalUsers: allUsersSnapshot.size
    };
  } catch (error) {
    console.error('Error fetching presence stats:', error);
    throw error;
  }
}; 