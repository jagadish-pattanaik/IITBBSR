import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  InputAdornment
} from '@mui/material';
import { Search, Clear } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { ActivityTypes } from '../services/activityTracking';

const ActivityFilters = ({ filters, onFilterChange }) => {
  const handleChange = (field) => (event) => {
    onFilterChange({
      ...filters,
      [field]: event.target.value
    });
  };

  const handleClear = () => {
    onFilterChange({
      search: '',
      type: 'all',
      dateRange: 'all'
    });
  };

  return (
    <Box sx={{ mb: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search activities..."
            value={filters.search}
            onChange={handleChange('search')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
          />

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={filters.type}
              label="Type"
              onChange={handleChange('type')}
            >
              <MenuItem value="all">All</MenuItem>
              {Object.keys(ActivityTypes).map((type) => (
                <MenuItem key={type} value={type}>
                  {type.replace('_', ' ')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Date Range</InputLabel>
            <Select
              value={filters.dateRange}
              label="Date Range"
              onChange={handleChange('dateRange')}
            >
              <MenuItem value="all">All Time</MenuItem>
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
            </Select>
          </FormControl>

          <Tooltip title="Clear Filters">
            <IconButton onClick={handleClear} size="small">
              <Clear />
            </IconButton>
          </Tooltip>
        </Box>
      </motion.div>
    </Box>
  );
};

export default ActivityFilters; 