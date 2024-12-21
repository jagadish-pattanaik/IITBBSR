import React, { useMemo, useState } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, TextField, InputAdornment } from '@mui/material';
import { FilterBar } from '../components/shared/SearchAndFilterBar';
import { Search } from '@mui/icons-material';

const QuizzesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const filteredQuizzes = useMemo(() => {
    return quizzes
      .filter(quiz => {
        const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Status filtering
        if (statusFilter === 'attempted') {
          return matchesSearch && userAttempts[quiz.id];
        }
        if (statusFilter === 'notAttempted') {
          return matchesSearch && !userAttempts[quiz.id];
        }
        return matchesSearch;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.title.localeCompare(b.title);
          case 'date':
            return new Date(b.endTime) - new Date(a.endTime);
          default:
            return 0;
        }
      });
  }, [quizzes, searchTerm, statusFilter, sortBy, userAttempts]);

  return (
    <Box sx={{ mb: 4 }}>
      <FilterBar>
        <TextField
          size="small"
          placeholder="Search quizzes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small">
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All Quizzes</MenuItem>
            <MenuItem value="attempted">Attempted</MenuItem>
            <MenuItem value="notAttempted">Not Attempted</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small">
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            label="Sort By"
            onChange={(e) => setSortBy(e.target.value)}
          >
            <MenuItem value="date">Latest First</MenuItem>
            <MenuItem value="name">Name</MenuItem>
          </Select>
        </FormControl>
      </FilterBar>
    </Box>
  );
};

export default QuizzesPage; 