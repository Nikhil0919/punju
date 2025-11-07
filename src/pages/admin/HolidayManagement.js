import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';

const HolidayManagement = () => {
  const [holidays, setHolidays] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: null,
    endDate: null,
    type: 'academic'
  });

  // Fetch holidays
  const fetchHolidays = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/holidays', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setHolidays(data);
    } catch (error) {
      console.error('Error fetching holidays:', error);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleOpenDialog = (holiday = null) => {
    if (holiday) {
      setSelectedHoliday(holiday);
      setFormData({
        title: holiday.title,
        description: holiday.description,
        startDate: new Date(holiday.startDate),
        endDate: new Date(holiday.endDate),
        type: holiday.type
      });
    } else {
      setSelectedHoliday(null);
      setFormData({
        title: '',
        description: '',
        startDate: null,
        endDate: null,
        type: 'academic'
      });
    }
    setOpenDialog(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = selectedHoliday
        ? `http://localhost:5001/api/holidays/${selectedHoliday._id}`
        : 'http://localhost:5001/api/holidays';
      
      const method = selectedHoliday ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchHolidays();
        setOpenDialog(false);
      }
    } catch (error) {
      console.error('Error saving holiday:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this holiday?')) {
      try {
        const response = await fetch(`http://localhost:5001/api/holidays/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          fetchHolidays();
        }
      } catch (error) {
        console.error('Error deleting holiday:', error);
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Holiday Management</Typography>
        <Button variant="contained" onClick={() => handleOpenDialog()}>
          Add Holiday
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {holidays.map((holiday) => (
              <TableRow key={holiday._id}>
                <TableCell>{holiday.title}</TableCell>
                <TableCell>{holiday.description}</TableCell>
                <TableCell>{format(new Date(holiday.startDate), 'dd/MM/yyyy')}</TableCell>
                <TableCell>{format(new Date(holiday.endDate), 'dd/MM/yyyy')}</TableCell>
                <TableCell>{holiday.type}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(holiday)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(holiday._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedHoliday ? 'Edit Holiday' : 'Add Holiday'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
              required
            />
            <DatePicker
              label="Start Date"
              value={formData.startDate}
              onChange={(date) => setFormData({ ...formData, startDate: date })}
              renderInput={(params) => <TextField {...params} fullWidth margin="normal" required />}
            />
            <DatePicker
              label="End Date"
              value={formData.endDate}
              onChange={(date) => setFormData({ ...formData, endDate: date })}
              renderInput={(params) => <TextField {...params} fullWidth margin="normal" required />}
            />
            <TextField
              select
              fullWidth
              label="Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              margin="normal"
              required
            >
              <MenuItem value="academic">Academic</MenuItem>
              <MenuItem value="national">National</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedHoliday ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HolidayManagement;