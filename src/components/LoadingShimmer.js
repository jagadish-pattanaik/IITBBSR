import { Box } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const ShimmerBox = styled(Box)(({ theme }) => ({
  background: `linear-gradient(90deg,
    ${theme.palette.background.paper} 25%,
    ${theme.palette.mode === 'light' ? '#f5f5f5' : '#333'} 37%,
    ${theme.palette.background.paper} 63%)`,
  backgroundSize: '200% 100%',
  animation: `${shimmer} 1.5s infinite linear`,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
}));

const LoadingShimmer = ({ width, height, variant = 'rectangular' }) => (
  <ShimmerBox
    sx={{
      width: width || '100%',
      height: height || '20px',
      borderRadius: variant === 'circular' ? '50%' : undefined,
    }}
  />
);

export default LoadingShimmer; 