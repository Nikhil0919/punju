import React from 'react';
import { Container, Grid, Paper, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper
            component={Link}
            to="/admin/users"
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              textDecoration: 'none',
              color: 'inherit',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <Typography variant="h6">User Management</Typography>
            <Typography variant="body2" color="text.secondary">
              Create and manage teacher and student accounts
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            component={Link}
            to="/admin/sections"
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              textDecoration: 'none',
              color: 'inherit',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <Typography variant="h6">Section Management</Typography>
            <Typography variant="body2" color="text.secondary">
              Create sections and assign students
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            component={Link}
            to="/admin/timetable"
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              textDecoration: 'none',
              color: 'inherit',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <Typography variant="h6">Timetable Management</Typography>
            <Typography variant="body2" color="text.secondary">
              Create and manage class schedules
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;