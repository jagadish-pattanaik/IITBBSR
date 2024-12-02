import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion } from 'framer-motion';
import { ActivityTypes } from '../services/activityTracking';
import { getActivityStats } from '../services/analytics';

const COLORS = ['#0000CB', '#FF4500', '#00C853', '#FFB300', '#9C27B0', '#607D8B'];

const ActivityAnalytics = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getActivityStats(userId);
        setStats(data);
      } catch (error) {
        console.error('Error fetching activity stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const activityByType = Object.entries(stats.byType).map(([type, count]) => ({
    name: type.replace('_', ' '),
    value: count
  }));

  const activityByDay = stats.byDay.map(item => ({
    name: item.day,
    activities: item.count
  }));

  return (
    <Grid container spacing={3}>
      {/* Summary Cards */}
      <Grid item xs={12} md={4}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Total Activities
            </Typography>
            <Typography variant="h3" color="primary">
              {stats.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Last 30 days
            </Typography>
          </Paper>
        </motion.div>
      </Grid>

      <Grid item xs={12} md={4}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Most Active Day
            </Typography>
            <Typography variant="h3" color="secondary">
              {stats.mostActiveDay.count}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Activities on {stats.mostActiveDay.date}
            </Typography>
          </Paper>
        </motion.div>
      </Grid>

      <Grid item xs={12} md={4}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Activity Streak
            </Typography>
            <Typography variant="h3" color="success.main">
              {stats.currentStreak}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Days in a row
            </Typography>
          </Paper>
        </motion.div>
      </Grid>

      {/* Activity Distribution Chart */}
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 3, height: 400 }}>
          <Typography variant="h6" gutterBottom>
            Activity Distribution
          </Typography>
          <ResponsiveContainer>
            <BarChart data={activityByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="activities" fill="#0000CB" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Activity Types Chart */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, height: 400 }}>
          <Typography variant="h6" gutterBottom>
            Activity Types
          </Typography>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={activityByType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {activityByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default ActivityAnalytics; 