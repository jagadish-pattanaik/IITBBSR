import { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Avatar,
  IconButton,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Search,
  Visibility,
  AdminPanelSettings,
  School,
  Assignment,
  Assessment,
  PlayArrow,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  '& .MuiTableCell-root': {
    borderColor: theme.palette.divider,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    transform: 'translateX(4px)',
  },
}));

const SearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    height: '40px',
    borderRadius: theme.shape.borderRadius,
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.background.paper,
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: '8px 14px',
  },
}));

const ProgressChip = styled(Chip)(({ theme, value }) => {
  const getColor = () => {
    if (value >= 80) return theme.palette.success;
    if (value >= 50) return theme.palette.warning;
    return theme.palette.error;
  };

  return {
    backgroundColor: getColor().main + '20',
    color: getColor().main,
    border: `1px solid ${getColor().main}`,
    fontWeight: 500,
  };
});

const FilterSelect = styled(FormControl)(({ theme }) => ({
  minWidth: 120,
  '& .MuiOutlinedInput-root': {
    height: '40px',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}));

const FiltersContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const UserList = ({ users, onViewUser }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('rank');
  const [filterYear, setFilterYear] = useState('all');
  const [filterBranch, setFilterBranch] = useState('all');

  const calculateProgress = (user) => {
    const totalVideos = 30; // Example total
    const totalProjects = 10;
    const completed = (user.progress?.videosWatched || 0) + 
                     (user.progress?.projectsSubmitted || 0);
    const total = totalVideos + totalProjects;
    return Math.round((completed / total) * 100);
  };

  const calculateRank = (user) => {
    const courseWeight = 3;
    const projectWeight = 2;
    const videoWeight = 1;

    return (
      (Object.keys(user.completedCourses || {}).length * courseWeight) +
      ((user.progress?.projectsSubmitted || 0) * projectWeight) +
      ((user.progress?.videosWatched || 0) * videoWeight)
    );
  };

  const filteredUsers = users.filter(user =>
    (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterYear === 'all' || user.year === filterYear) &&
    (filterBranch === 'all' || user.branch === filterBranch)
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    switch (sortBy) {
      case 'rank':
        return calculateRank(b) - calculateRank(a);
      case 'name':
        return (a.name || '').localeCompare(b.name || '');
      default:
        return 0;
    }
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      <FiltersContainer>
        <SearchField
          sx={{ 
            flex: 1,
            '& .MuiInputAdornment-root': {
              height: '40px',
              marginRight: '-8px',
            },
          }}
          variant="outlined"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
          }}
        />
        
        <FilterSelect size="small">
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            label="Sort By"
          >
            <MenuItem value="rank">Rank</MenuItem>
            <MenuItem value="name">Name</MenuItem>
          </Select>
        </FilterSelect>

        <FilterSelect size="small">
          <InputLabel>Year</InputLabel>
          <Select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            label="Year"
          >
            <MenuItem value="all">All Years</MenuItem>
            <MenuItem value="1">1st Year</MenuItem>
            <MenuItem value="2">2nd Year</MenuItem>
            <MenuItem value="3">3rd Year</MenuItem>
            <MenuItem value="4">4th Year</MenuItem>
          </Select>
        </FilterSelect>

        <FilterSelect size="small">
          <InputLabel>Branch</InputLabel>
          <Select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            label="Branch"
          >
            <MenuItem value="all">All Branches</MenuItem>
            <MenuItem value="CSE">CSE</MenuItem>
            <MenuItem value="ECE">ECE</MenuItem>
            <MenuItem value="ME">ME</MenuItem>
            <MenuItem value="CE">CE</MenuItem>
            {/* Add more branches as needed */}
          </Select>
        </FilterSelect>
      </FiltersContainer>

      <StyledTableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Stats</TableCell>
              <TableCell align="right">Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <AnimatePresence>
              {sortedUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    component={StyledTableRow}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ position: 'relative' }}>
                          <Avatar src={user.photoURL} alt={user.name}>
                            {user.name?.charAt(0)}
                          </Avatar>
                          <Chip
                            label={`#${
                              users
                                .sort((a, b) => calculateRank(b) - calculateRank(a))
                                .findIndex(u => u.id === user.id) + 1
                            }`}
                            color="primary"
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: -10,
                              left: -10,
                              height: '22px',
                              minWidth: '22px',
                              '& .MuiChip-label': {
                                px: 1,
                                fontSize: '0.75rem',
                              },
                            }}
                          />
                        </Box>
                        <Box>
                          <Typography variant="subtitle2">
                            {user.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Tooltip title="Courses Completed">
                          <Chip
                            icon={<School fontSize="small" />}
                            label={Object.keys(user.completedCourses || {}).length}
                            size="small"
                            variant="outlined"
                          />
                        </Tooltip>
                        <Tooltip title="Projects Submitted">
                          <Chip
                            icon={<Assignment fontSize="small" />}
                            label={user.progress?.projectsSubmitted || 0}
                            size="small"
                            variant="outlined"
                          />
                        </Tooltip>
                        <Tooltip title="Videos Watched">
                          <Chip
                            icon={<PlayArrow fontSize="small" />}
                            label={user.progress?.videosWatched || 0}
                            size="small"
                            variant="outlined"
                          />
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Stats">
                        <IconButton 
                          onClick={() => onViewUser(user)}
                          size="small"
                        >
                          <Assessment />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </motion.tr>
                ))}
            </AnimatePresence>
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={sortedUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </StyledTableContainer>
    </Box>
  );
};

export default UserList; 