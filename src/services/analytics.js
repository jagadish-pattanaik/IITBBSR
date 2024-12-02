import { db } from './firebase';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  startOfDay,
  endOfDay,
  Timestamp
} from 'firebase/firestore';
import {
  startOfDay as dateStartOfDay,
  endOfDay as dateEndOfDay,
  subDays,
  format,
  eachDayOfInterval
} from 'date-fns';

export const getActivityStats = async (userId) => {
  try {
    const thirtyDaysAgo = subDays(new Date(), 30);
    const activitiesRef = collection(db, 'users', userId, 'activities');
    const q = query(
      activitiesRef,
      where('timestamp', '>=', Timestamp.fromDate(thirtyDaysAgo)),
      orderBy('timestamp', 'desc')
    );

    const snapshot = await getDocs(q);
    const activities = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate()
    }));

    // Calculate total activities
    const total = activities.length;

    // Calculate activities by type
    const byType = activities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      return acc;
    }, {});

    // Calculate activities by day
    const byDay = {};
    activities.forEach(activity => {
      const day = format(activity.timestamp, 'yyyy-MM-dd');
      byDay[day] = (byDay[day] || 0) + 1;
    });

    // Format activities by day for chart
    const days = eachDayOfInterval({
      start: thirtyDaysAgo,
      end: new Date()
    });

    const byDayArray = days.map(day => ({
      day: format(day, 'MMM dd'),
      count: byDay[format(day, 'yyyy-MM-dd')] || 0
    }));

    // Find most active day
    const mostActiveDay = Object.entries(byDay)
      .reduce((max, [date, count]) => {
        return count > max.count ? { date, count } : max;
      }, { date: '', count: 0 });

    // Calculate current streak
    let currentStreak = 0;
    let currentDate = new Date();

    while (byDay[format(currentDate, 'yyyy-MM-dd')]) {
      currentStreak++;
      currentDate = subDays(currentDate, 1);
    }

    return {
      total,
      byType,
      byDay: byDayArray,
      mostActiveDay: {
        date: format(new Date(mostActiveDay.date), 'MMM dd'),
        count: mostActiveDay.count
      },
      currentStreak
    };
  } catch (error) {
    console.error('Error calculating activity stats:', error);
    throw error;
  }
}; 