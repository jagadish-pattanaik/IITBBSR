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
  Skeleton
} from '@mui/material';
import { BarChart } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const UserList = ({ users, onViewUser }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Memoize the sorted and filtered users
  const displayUsers = useMemo(() => {
    return users
      .slice()
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }, [users]);

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

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
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
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        src={user.photoURL} 
                        alt={user.name}
                        sx={{ 
                          mr: 2,
                          width: 40,
                          height: 40
                        }}
                      />
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