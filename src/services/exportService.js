import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { format } from 'date-fns';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

export const exportActivities = async (userId, format = 'csv', dateRange = null) => {
  try {
    const activitiesRef = collection(db, 'users', userId, 'activities');
    let q = query(activitiesRef, orderBy('timestamp', 'desc'));

    if (dateRange) {
      q = query(q, 
        where('timestamp', '>=', dateRange.start),
        where('timestamp', '<=', dateRange.end)
      );
    }

    const snapshot = await getDocs(q);
    const activities = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate()
    }));

    const formattedData = activities.map(activity => ({
      Date: format(activity.timestamp, 'yyyy-MM-dd HH:mm:ss'),
      Type: activity.type,
      Details: JSON.stringify(activity.data),
      Status: activity.status || 'completed'
    }));

    switch (format.toLowerCase()) {
      case 'csv':
        return exportToCSV(formattedData);
      case 'excel':
        return exportToExcel(formattedData);
      case 'json':
        return exportToJSON(formattedData);
      default:
        throw new Error('Unsupported export format');
    }
  } catch (error) {
    console.error('Error exporting activities:', error);
    throw error;
  }
};

const exportToCSV = (data) => {
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `activities_${format(new Date(), 'yyyy-MM-dd')}.csv`);
};

const exportToExcel = (data) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Activities');
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `activities_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};

const exportToJSON = (data) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  saveAs(blob, `activities_${format(new Date(), 'yyyy-MM-dd')}.json`);
}; 