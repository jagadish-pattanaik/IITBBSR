import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

export const FilterBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  '& .MuiTextField-root, & .MuiFormControl-root': {
    backgroundColor: theme.palette.background.paper,
    minHeight: 40,
  },
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius,
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.background.paper,
    },
  },
  '& .MuiFormControl-root': {
    minWidth: 150,
  },
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
  },
})); 