import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Skeleton,
  IconButton,
  Tooltip,
  Collapse
} from '@mui/material';
import {
  PlayCircleOutline,
  Assignment,
  Quiz,
  School,
  CheckCircle,
  Login,
  FileDownload,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ActivityTypes, getRecentActivities } from '../services/activityTracking';
import { listItemVariants } from '../utils/animations';
import ActivityFilters from './ActivityFilters';
import { startOfToday, startOfWeek, startOfMonth, isWithinInterval } from 'date-fns';
import ExportDialog from './ExportDialog';
import { groupActivitiesByDate, getGroupOrder } from '../utils/activityGrouping';

const activityIcons = {
  [ActivityTypes.VIDEO_WATCH]: <PlayCircleOutline color="primary" />,
  [ActivityTypes.PROJECT_SUBMIT]: <Assignment color="secondary" />,
  [ActivityTypes.QUIZ_COMPLETE]: <Quiz color="success" />,
  [ActivityTypes.COURSE_START]: <School color="info" />,
  [ActivityTypes.COURSE_COMPLETE]: <CheckCircle color="success" />,
  [ActivityTypes.LOGIN]: <Login color="action" />
};

const activityMessages = {
  [ActivityTypes.VIDEO_WATCH]: (data) => `Watched "${data.videoTitle}"`,
  [ActivityTypes.PROJECT_SUBMIT]: (data) => `Submitted project: ${data.projectTitle}`,
  [ActivityTypes.QUIZ_COMPLETE]: (data) => `Completed quiz with score: ${data.score}%`,
  [ActivityTypes.COURSE_START]: (data) => `Started course: ${data.courseTitle}`,
  [ActivityTypes.COURSE_COMPLETE]: (data) => `Completed course: ${data.courseTitle}`,
  [ActivityTypes.LOGIN]: () => 'Logged in'
};

const RecentActivity = ({ userId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    dateRange: 'all'
  });
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({
    Today: true,
    Yesterday: true,
    'This Week': false,
    'This Month': false
  });

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      const data = await getRecentActivities(userId);
      setActivities(data);
      setLoading(false);
    };

    fetchActivities();
  }, [userId]);

  const groupedActivities = useMemo(() => {
    const filtered = activities.filter(activity => {
      // Search filter
      const searchMatch = !filters.search || 
        activityMessages[activity.type](activity.data)
          .toLowerCase()
          .includes(filters.search.toLowerCase());

      // Type filter
      const typeMatch = filters.type === 'all' || activity.type === filters.type;

      // Date range filter
      let dateMatch = true;
      if (filters.dateRange !== 'all') {
        const now = new Date();
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
    return groupActivitiesByDate(filtered);
  }, [activities, filters]);

  const handleToggleGroup = (group) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  const renderActivityGroup = (groupName, activities) => (
    <Box key={groupName} sx={{ mb: 2 }}>
      <ListItem
        button
        onClick={() => handleToggleGroup(groupName)}
        sx={{
          backgroundColor: 'background.paper',
          borderRadius: 1,
          mb: 1
        }}
      >
        <ListItemText
          primary={groupName}
          secondary={`${activities.length} activities`}
        />
        {expandedGroups[groupName] ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={expandedGroups[groupName]} timeout="auto">
        <List sx={{ pl: 2 }}>
          <AnimatePresence>
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                variants={listItemVariants}
                initial="hidden"
                animate="visible"
                custom={index}
              >
                <ListItem>
                  <ListItemIcon>
                    {activityIcons[activity.type]}
                  </ListItemIcon>
                  <ListItemText
                    primary={activityMessages[activity.type](activity.data)}
                    secondary={formatDistanceToNow(activity.timestamp.toDate(), { addSuffix: true })}
                  />
                </ListItem>
              </motion.div>
            ))}
          </AnimatePresence>
        </List>
      </Collapse>
    </Box>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <ActivityFilters
          filters={filters}
          onFilterChange={setFilters}
        />
        <Tooltip title="Export Activities">
          <IconButton onClick={() => setShowExportDialog(true)}>
            <FileDownload />
          </IconButton>
        </Tooltip>
      </Box>

      {loading ? (
        <List>
          {[...Array(3)].map((_, index) => (
            <ListItem key={index}>
              <ListItemIcon>
                <Skeleton variant="circular" width={24} height={24} />
              </ListItemIcon>
              <ListItemText
                primary={<Skeleton width="60%" />}
                secondary={<Skeleton width="30%" />}
              />
            </ListItem>
          ))}
        </List>
      ) : Object.keys(groupedActivities).length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography color="text.secondary">
            {activities.length === 0 ? 'No recent activity' : 'No matching activities'}
          </Typography>
        </Box>
      ) : (
        <Box>
          {getGroupOrder().map(group => {
            if (groupedActivities[group]?.length > 0) {
              return renderActivityGroup(group, groupedActivities[group]);
            }
            return null;
          })}
          {Object.keys(groupedActivities)
            .filter(group => !getGroupOrder().includes(group))
            .sort((a, b) => new Date(b) - new Date(a))
            .map(group => renderActivityGroup(group, groupedActivities[group]))}
        </Box>
      )}

      <ExportDialog
        open={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        userId={userId}
      />
    </Box>
  );
};

export default RecentActivity; 