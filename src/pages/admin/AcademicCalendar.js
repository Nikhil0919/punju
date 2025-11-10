import React from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import HolidayManagement from './HolidayManagement';
import HolidayCalendar from '../../components/HolidayCalendar';

const AcademicCalendar = () => {
  const [stats, setStats] = React.useState({
    academic: 0,
    national: 0,
    totalDays: 0
  });

  React.useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/holidays/statistics', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
    };

    fetchStatistics();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Academic Calendar Management
      </Typography>

      <Grid container spacing={3}>
        {/* Holiday Management Section */}
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <HolidayManagement />
          </Paper>
        </Grid>

        {/* Calendar Preview Section */}
        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Calendar Preview
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              This is how students and teachers will see the calendar
            </Typography>
            <HolidayCalendar />
          </Paper>
        </Grid>

        {/* Holiday Statistics Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Calendar Overview
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
                  <Typography variant="h6">Academic Holidays</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body2">Current Academic Year</Typography>
                    <Typography variant="h4">{stats.academic}</Typography>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, backgroundColor: 'secondary.light', color: 'secondary.contrastText' }}>
                  <Typography variant="h6">National Holidays</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body2">Current Academic Year</Typography>
                    <Typography variant="h4">{stats.national}</Typography>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, backgroundColor: 'info.light', color: 'info.contrastText' }}>
                  <Typography variant="h6">Total Holiday Days</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body2">Current Academic Year</Typography>
                    <Typography variant="h4">{stats.totalDays}</Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AcademicCalendar;