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
  Typography,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { Visibility, Star } from '@mui/icons-material';
import { motion } from 'framer-motion';

const UserList = ({ users, onViewUser }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((user) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar src={user.photoURL} alt={user.name} sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="subtitle2">{user.name}</Typography>
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
                      label={user.progress.videosWatched}
                      color="primary"
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={user.progress.projectsSubmitted}
                      color="secondary"
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Details">
                      <IconButton onClick={() => onViewUser(user.id)}>
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </motion.tr>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={users.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default UserList; 