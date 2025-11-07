import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  MenuItem,
  Stack
} from '@mui/material';
import { format } from 'date-fns';

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [adminRemarks, setAdminRemarks] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [alertInfo, setAlertInfo] = useState({ show: false, severity: '', message: '' });

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/leaves/all', {
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

  const handleOpenDialog = (leave) => {
    setSelectedLeave(leave);
    setAdminRemarks(leave.adminRemarks || '');
    setSelectedStatus(leave.status);
    setOpenDialog(true);
  };

  const handleUpdateStatus = async (status = null) => {
    try {
      const finalStatus = status || selectedStatus;
      const response = await fetch(`http://localhost:5001/api/leaves/${selectedLeave._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: finalStatus,
          adminRemarks
        })
      });

      if (response.ok) {
        setAlertInfo({
          show: true,
          severity: 'success',
          message: `Leave application ${finalStatus} successfully`
        });
        fetchLeaves();
        setOpenDialog(false);
      } else {
        throw new Error('Failed to update leave status');
      }
    } catch (error) {
      console.error('Error updating leave status:', error);
      setAlertInfo({
        show: true,
        severity: 'error',
        message: 'Failed to update leave status. Please try again.'
      });
    }
    setTimeout(() => {
      setAlertInfo({ show: false, severity: '', message: '' });
    }, 3000);
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
      {alertInfo.show && (
        <Alert severity={alertInfo.severity} sx={{ mb: 2 }}>
          {alertInfo.message}
        </Alert>
      )}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Leave Applications
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>From Date</TableCell>
                <TableCell>To Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Admin Remarks</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaves.map((leave) => (
                <TableRow key={leave._id}>
                  <TableCell>{leave.student.fullName}</TableCell>
                  <TableCell>{leave.reason}</TableCell>
                  <TableCell>{format(new Date(leave.fromDate), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{format(new Date(leave.toDate), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>
                    <Typography color={getStatusColor(leave.status)}>
                      {leave.status.toUpperCase()}
                    </Typography>
                  </TableCell>
                  <TableCell>{leave.adminRemarks || '-'}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      {leave.status === 'pending' && (
                        <>
                          <Button
                            variant="contained"
                            size="small"
                            color="success"
                            onClick={() => {
                              setSelectedLeave(leave);
                              setAdminRemarks('');
                              handleUpdateStatus('approved');
                            }}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            color="error"
                            onClick={() => {
                              setSelectedLeave(leave);
                              setAdminRemarks('');
                              handleUpdateStatus('rejected');
                            }}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleOpenDialog(leave)}
                      >
                        Add Remarks
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Remarks</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body1" gutterBottom>
              Current Status: <strong>{selectedLeave?.status.toUpperCase()}</strong>
            </Typography>
            <TextField
              label="Admin Remarks"
              value={adminRemarks}
              onChange={(e) => setAdminRemarks(e.target.value)}
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateStatus} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeaveManagement;