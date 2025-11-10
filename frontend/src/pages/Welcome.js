import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Paper, Typography } from '@mui/material';
import punujLogo from '../assets/punju-logo.png';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.02)',
            },
          }}
          onClick={() => navigate('/login')}
        >
          <img
            src={punujLogo}
            alt="Punju University Logo"
            style={{
              width: '100%',
              maxWidth: '500px',
              height: 'auto',
              marginBottom: '2rem',
            }}
          />
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 600,
              color: '#1a73e8',
              textAlign: 'center',
            }}
          >
            Welcome to Punju University
          </Typography>
          <Typography
            variant="subtitle1"
            color="textSecondary"
            sx={{
              textAlign: 'center',
              mt: 1,
            }}
          >
            Click to proceed to login
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default Welcome;