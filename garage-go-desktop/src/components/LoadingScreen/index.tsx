import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { Build } from '@mui/icons-material';

export const LoadingScreen: React.FC = () => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
      gap: 2,
    }}
  >
    <Box
      sx={{
        bgcolor: 'white',
        borderRadius: '50%',
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 1,
      }}
    >
      <Build sx={{ fontSize: 40, color: 'primary.main' }} />
    </Box>
    <CircularProgress size={40} sx={{ color: 'white' }} />
    <Typography variant="h6" color="white" fontWeight={700}>
      Garage Go
    </Typography>
    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
      جاري التحميل...
    </Typography>
  </Box>
);
