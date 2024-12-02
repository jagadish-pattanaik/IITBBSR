import { startOfToday, startOfWeek, startOfMonth, isWithinInterval } from 'date-fns';

export const filterActivities = (activities, filters) => {
  const now = new Date();

  return activities.filter(activity => {
    // Search filter
    const searchMatch = !filters.search || 
      activity.message.toLowerCase().includes(filters.search.toLowerCase());

    // Type filter
    const typeMatch = filters.type === 'all' || activity.type === filters.type;

    // Date range filter
    let dateMatch = true;
    if (filters.dateRange !== 'all' && activity.timestamp) {
      let start;
      switch (filters.dateRange) {
        case 'today':
          start = startOfToday();
          break;
        case 'week':
          start = startOfWeek(now);
          break;
        case 'month':
          start = startOfMonth(now);
          break;
        default:
          start = now;
      }
      dateMatch = isWithinInterval(activity.timestamp, { start, end: now });
    }

    return searchMatch && typeMatch && dateMatch;
  });
};

export const getDateRangeLabel = (dateRange) => {
  switch (dateRange) {
    case 'today':
      return 'Today';
    case 'week':
      return 'This Week';
    case 'month':
      return 'This Month';
    default:
      return 'All Time';
  }
}; 