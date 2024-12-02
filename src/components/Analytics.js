import { Box, Grid, Paper, Typography } from '@mui/material';
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

const Analytics = ({ data }) => {
  const COLORS = ['#0000CB', '#FF4500', '#00C853', '#FFB300'];

  const courseEngagement = [
    { name: 'Web Development', students: 120 },
    { name: 'Python', students: 98 },
    { name: 'Data Science', students: 86 },
    { name: 'Machine Learning', students: 74 }
  ];

  const projectCompletion = [
    { name: 'Submitted', value: data.totalSubmissions },
    { name: 'Approved', value: data.approvedSubmissions },
    { name: 'Rejected', value: data.rejectedSubmissions },
    { name: 'Pending', value: data.pendingSubmissions }
  ];

  const StatCard = ({ title, value, description }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Paper sx={{ p: 3, height: '100%' }}>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h3" color="primary" gutterBottom>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Paper>
    </motion.div>
  );

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={data.totalUsers}
            description="Active users on the platform"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Courses"
            value={data.activeCourses}
            description="Currently running courses"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Projects Submitted"
            value={data.totalSubmissions}
            description="Total project submissions"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completion Rate"
            value={`${data.completionRate}%`}
            description="Average course completion"
          />
        </Grid>

        {/* Course Engagement Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Course Engagement
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={courseEngagement}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="students" fill="#0000CB" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Project Status Chart */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Project Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={projectCompletion}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {projectCompletion.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics; 