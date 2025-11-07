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

const StudentDashboard = () => {
  const [timetable, setTimetable] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        // Fetch student's section and timetable
        const response = await axios.get(`http://localhost:5001/api/student/me`, { headers });
        setStudentInfo(response.data);

        if (response.data.section) {
          const timetableResponse = await axios.get(
            `http://localhost:5001/api/timetable/section/${response.data.section._id}`,
            { headers }
          );
          setTimetable(timetableResponse.data);
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
      }
    };

    fetchStudentData();
  }, []);

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Student Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Welcome, {user.fullName}
            </Typography>
            {studentInfo && studentInfo.section && (
              <Typography variant="body1">
                Section: {studentInfo.section.name}
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Class Timetable
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
                        const class_ = timetable.find(
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
                                  {class_.teacher?.fullName}
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

export default StudentDashboard;