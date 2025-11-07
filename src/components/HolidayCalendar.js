import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import { format } from 'date-fns';

const HolidayCalendar = () => {
  const [holidays, setHolidays] = useState([]);
  const [upcomingHolidays, setUpcomingHolidays] = useState([]);

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const [allHolidays, upcoming] = await Promise.all([
          fetch('http://localhost:5001/api/holidays', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }),
          fetch('http://localhost:5001/api/holidays/upcoming', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          })
        ]);

        const holidaysData = await allHolidays.json();
        const upcomingData = await upcoming.json();

        setHolidays(holidaysData);
        setUpcomingHolidays(upcomingData);
      } catch (error) {
        console.error('Error fetching holidays:', error);
      }
    };

    fetchHolidays();
  }, []);

  const getTypeColor = (type) => {
    switch (type) {
      case 'academic':
        return 'primary';
      case 'national':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Upcoming Holidays
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {upcomingHolidays.map((holiday) => (
            <Paper
              key={holiday._id}
              sx={{
                p: 2,
                minWidth: 200,
                display: 'flex',
                flexDirection: 'column',
                gap: 1
              }}
            >
              <Typography variant="subtitle1">{holiday.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {format(new Date(holiday.startDate), 'dd MMM yyyy')}
                {' - '}
                {format(new Date(holiday.endDate), 'dd MMM yyyy')}
              </Typography>
              <Chip
                label={holiday.type}
                size="small"
                color={getTypeColor(holiday.type)}
              />
            </Paper>
          ))}
        </Box>
      </Box>

      <Typography variant="h6" gutterBottom>
        All Holidays
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Type</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {holidays.map((holiday) => (
              <TableRow key={holiday._id}>
                <TableCell>{holiday.title}</TableCell>
                <TableCell>{holiday.description}</TableCell>
                <TableCell>
                  {format(new Date(holiday.startDate), 'dd MMM yyyy')}
                </TableCell>
                <TableCell>
                  {format(new Date(holiday.endDate), 'dd MMM yyyy')}
                </TableCell>
                <TableCell>
                  <Chip
                    label={holiday.type}
                    size="small"
                    color={getTypeColor(holiday.type)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default HolidayCalendar;