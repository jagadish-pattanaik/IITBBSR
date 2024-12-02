import { format, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns';

export const groupActivitiesByDate = (activities) => {
  const groups = activities.reduce((acc, activity) => {
    const date = activity.timestamp.toDate();
    let groupKey;

    if (isToday(date)) {
      groupKey = 'Today';
    } else if (isYesterday(date)) {
      groupKey = 'Yesterday';
    } else if (isThisWeek(date)) {
      groupKey = 'This Week';
    } else if (isThisMonth(date)) {
      groupKey = 'This Month';
    } else {
      groupKey = format(date, 'MMMM yyyy');
    }

    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(activity);
    return acc;
  }, {});

  // Sort activities within each group
  Object.keys(groups).forEach(key => {
    groups[key].sort((a, b) => b.timestamp - a.timestamp);
  });

  return groups;
};

export const getGroupOrder = () => [
  'Today',
  'Yesterday',
  'This Week',
  'This Month',
  // Other months will be sorted automatically
]; 