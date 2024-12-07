import { useState, useMemo } from 'react';
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
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Skeleton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack
} from '@mui/material';
import { BarChart, Search } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const UserList = ({ users, onViewUser }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [loadedAvatars, setLoadedAvatars] = useState({});

  // Get unique years and branches for filters
  const years = useMemo(() => [...new Set(users.map(user => user.year))].filter(Boolean), [users]);
  const branches = useMemo(() => [...new Set(users.map(user => user.branch))].filter(Boolean), [users]);

  // Calculate user ranks based on progress
  const rankedUsers = useMemo(() => {
    return users
      .map(user => ({
        ...user,
        totalScore: (user.progress?.coursesCompleted || 0) * 1000 + 
                   (user.progress?.projectsSubmitted || 0) * 100 + 
                   (user.progress?.videosWatched || 0)
      }))
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((user, index) => ({
        ...user,
        rank: index + 1
      }));
  }, [users]);

  // Update displayUsers to maintain rank while filtering
  const displayUsers = useMemo(() => {
    return rankedUsers
      .filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesYear = yearFilter === 'all' || user.year === yearFilter;
        const matchesBranch = branchFilter === 'all' || user.branch === branchFilter;
        return matchesSearch && matchesYear && matchesBranch;
      });
  }, [rankedUsers, searchTerm, yearFilter, branchFilter]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const currentPageUsers = displayUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleImageLoad = (userId) => {
    setLoadedAvatars(prev => ({
      ...prev,
      [userId]: true
    }));
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Box sx={{ p: 2 }}>
        <Stack spacing={2}>
          <TextField
            fullWidth
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />
            }}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Year</InputLabel>
              <Select
                value={yearFilter}
                label="Year"
                onChange={(e) => setYearFilter(e.target.value)}
              >
                <MenuItem value="all">All Years</MenuItem>
                {years.map(year => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Branch</InputLabel>
              <Select
                value={branchFilter}
                label="Branch"
                onChange={(e) => setBranchFilter(e.target.value)}
              >
                <MenuItem value="all">All Branches</MenuItem>
                {branches.map(branch => (
                  <MenuItem key={branch} value={branch}>{branch}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Stack>
      </Box>

      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Year</TableCell>
              <TableCell>Branch</TableCell>
              <TableCell align="center">Videos Watched</TableCell>
              <TableCell align="center">Projects</TableCell>
              <TableCell align="center">Stats</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <AnimatePresence mode="wait">
              {currentPageUsers.map((user) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  component={TableRow}
                  sx={{ '&:hover': { backgroundColor: 'action.hover' } }}
                >
                  <TableCell width={80}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600,
                        color: user.rank <= 3 ? 'primary.main' : 'text.secondary',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      #{user.rank}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        src={loadedAvatars[user.id] ? user.photoURL : undefined} 
                        alt={user.name}
                        sx={{ 
                          mr: 2,
                          width: 40,
                          height: 40,
                          bgcolor: user.rank <= 3 ? 'primary.main' : 'grey.400',
                          fontSize: '1rem',
                          border: user.rank <= 3 ? 2 : 0,
                          borderColor: 'primary.main'
                        }}
                      >
                        {!loadedAvatars[user.id] && (
                          <>
                            <img 
                              src={user.photoURL} 
                              alt=""
                              style={{ display: 'none' }}
                              onLoad={() => handleImageLoad(user.id)}
                            />
                            {getInitials(user.name)}
                          </>
                        )}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">
                          {user.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{user.year}</TableCell>
                  <TableCell>{user.branch}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={user.progress?.videosWatched || 0}
                      color="primary"
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={user.progress?.projectsSubmitted || 0}
                      color="secondary"
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Statistics">
                      <IconButton 
                        onClick={() => onViewUser(user)}
                        size="small"
                        color="primary"
                      >
                        <BarChart />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={displayUsers.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default UserList; 