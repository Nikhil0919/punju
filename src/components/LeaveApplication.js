import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';

const LeaveApplication = () => {
  const [leaves, setLeaves] = useState([]);
  const [formData, setFormData] = useState({
    reason: '',
    fromDate: null,
    toDate: null
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const fetchMyLeaves = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/leaves/my-leaves', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setLeaves(data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Validate dates
      if (!formData.fromDate || !formData.toDate) {
        setError('Please select both from and to dates');
        return;
      }

      if (new Date(formData.fromDate) > new Date(formData.toDate)) {
        setError('From date cannot be later than to date');
        return;
      }

      const response = await fetch('http://localhost:5001/api/leaves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          fromDate: formData.fromDate.toISOString(),
          toDate: formData.toDate.toISOString()
        })
      });

      if (response.ok) {
        setSuccess('Leave application submitted successfully');
        setFormData({
          reason: '',
          fromDate: null,
          toDate: null
        });
        fetchMyLeaves();
      } else {
        const data = await response.json();
        setError(data.message || 'Error submitting leave application');
      }
    } catch (error) {
      setError('Error submitting leave application');
      console.error('Error:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success.main';
      case 'rejected':
        return 'error.main';
      default:
        return 'warning.main';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Apply for Leave
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Reason for Leave"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                required
                multiline
                rows={3}
                sx={{ mb: 2 }}
              />
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="From Date"
                    value={formData.fromDate}
                    onChange={(date) => setFormData({ ...formData, fromDate: date })}
                    slotProps={{ textField: { fullWidth: true, required: true } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="To Date"
                    value={formData.toDate}
                    onChange={(date) => setFormData({ ...formData, toDate: date })}
                    slotProps={{ textField: { fullWidth: true, required: true } }}
                  />
                </Grid>
              </Grid>
              <Button
                type="submit"
                variant="contained"
                color="primary"
              >
                Submit Leave Application
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              My Leave Applications
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Reason</TableCell>
                    <TableCell>From Date</TableCell>
                    <TableCell>To Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Admin Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaves.map((leave) => (
                    <TableRow key={leave._id}>
                      <TableCell>{leave.reason}</TableCell>
                      <TableCell>{format(new Date(leave.fromDate), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{format(new Date(leave.toDate), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>
                        <Typography color={getStatusColor(leave.status)}>
                          {leave.status.toUpperCase()}
                        </Typography>
                      </TableCell>
                      <TableCell>{leave.adminRemarks || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LeaveApplication;