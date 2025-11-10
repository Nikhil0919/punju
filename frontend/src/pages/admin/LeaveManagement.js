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
  Stack
} from '@mui/material';
import { format } from 'date-fns';
import { API_ENDPOINTS } from '../../config/api';

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
      const response = await fetch(API_ENDPOINTS.LEAVES_ALL, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
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
      const response = await fetch(API_ENDPOINTS.LEAVES_UPDATE(selectedLeave._id), {
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
    <Box sx={{ p: 3, backgroundColor: 'background.default', minHeight: '100vh' }}>
      {alertInfo.show && (
        <Alert 
          severity={alertInfo.severity} 
          sx={{ 
            mb: 2,
            borderRadius: 2,
            '& .MuiAlert-icon': {
              fontSize: '1.5rem'
            }
          }}
        >
          {alertInfo.message}
        </Alert>
      )}
      <Paper 
        sx={{ 
          p: 3,
          backdropFilter: 'blur(10px)',
          backgroundColor: 'background.paper',
        }}
      >
        <Typography 
          variant="h5" 
          gutterBottom 
          sx={{ 
            mb: 3,
            fontWeight: 600,
            color: 'primary.main',
          }}
        >
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
                <TableRow 
                  key={leave._id}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.04)',
                    },
                    transition: 'background-color 0.2s ease',
                  }}
                >
                  <TableCell sx={{ fontWeight: 500 }}>{leave.student.fullName}</TableCell>
                  <TableCell>{leave.reason}</TableCell>
                  <TableCell>{format(new Date(leave.fromDate), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{format(new Date(leave.toDate), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>
                    <Typography 
                      sx={{ 
                        py: 0.5, 
                        px: 1.5, 
                        borderRadius: '16px', 
                        display: 'inline-block',
                        fontSize: '0.875rem',
                        backgroundColor: `${getStatusColor(leave.status)}15`,
                        color: getStatusColor(leave.status),
                        fontWeight: 500,
                      }}
                    >
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
                            sx={{
                              minWidth: '100px',
                              fontSize: '0.875rem',
                              '&:hover': {
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 8px rgba(46, 125, 50, 0.25)',
                              },
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
                            sx={{
                              minWidth: '100px',
                              fontSize: '0.875rem',
                              '&:hover': {
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 8px rgba(211, 47, 47, 0.25)',
                              },
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
                        sx={{
                          minWidth: '120px',
                          fontSize: '0.875rem',
                          '&:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.04)',
                          },
                        }}
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

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1,
          fontWeight: 600,
          color: 'primary.main',
        }}>
          Add Remarks
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Status: <Typography component="span" sx={{ 
                color: getStatusColor(selectedLeave?.status),
                fontWeight: 600,
                backgroundColor: `${getStatusColor(selectedLeave?.status)}15`,
                px: 1.5,
                py: 0.5,
                borderRadius: '16px',
                fontSize: '0.875rem',
              }}>
                {selectedLeave?.status.toUpperCase()}
              </Typography>
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