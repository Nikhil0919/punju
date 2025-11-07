import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider
} from '@mui/material';
import HolidayCalendar from '../../components/HolidayCalendar';
import axios from 'axios';

const TeacherDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [teacherInfo, setTeacherInfo] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        // Fetch teacher's classes/timetable
        const response = await axios.get(`http://localhost:5001/api/teacher/me`, { headers });
        setTeacherInfo(response.data);

        // Fetch teacher's timetable entries
        const timetableResponse = await axios.get(
          `http://localhost:5001/api/teacher/timetable`,
          { headers }
        );
        setClasses(timetableResponse.data);
      } catch (error) {
        console.error('Error fetching teacher data:', error);
      }
    };

    fetchTeacherData();
  }, []);

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Teacher Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Welcome, {user.fullName}
            </Typography>
            {teacherInfo && teacherInfo.sections && (
              <Typography variant="body1">
                Assigned Sections: {teacherInfo.sections.map(s => s.name).join(', ')}
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Teaching Schedule
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Time</TableCell>
                    {DAYS.map(day => (
                      <TableCell key={day}>{day}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {TIME_SLOTS.map(timeSlot => (
                    <TableRow key={timeSlot}>
                      <TableCell>{timeSlot}</TableCell>
                      {DAYS.map((day, index) => {
                        const class_ = classes.find(
                          t => t.startTime === timeSlot && t.dayOfWeek === index + 1
                        );
                        return (
                          <TableCell key={`${day}-${timeSlot}`}>
                            {class_ && (
                              <Box>
                                <Typography variant="subtitle2">
                                  {class_.subject}
                                </Typography>
                                <Typography variant="caption">
                                  {class_.section?.name}
                                </Typography>
                              </Box>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Holiday Calendar */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom component="div">
              Academic Calendar
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <HolidayCalendar />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TeacherDashboard;