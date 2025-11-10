import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { createUser, getUsersByRole, deleteUser } from '../../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('student');
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    email: '',
    fullName: '',
    role: selectedRole
  });

  useEffect(() => {
    // Update newUser role when selectedRole changes
    setNewUser(prev => ({ ...prev, role: selectedRole }));
  }, [selectedRole]);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await getUsersByRole(selectedRole);
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, [selectedRole]);

  useEffect(() => {
    fetchUsers();
  }, [selectedRole, fetchUsers]);

  const handleCreateUser = async () => {
    try {
      // Validate required fields
      if (!newUser.username || !newUser.password || !newUser.email || !newUser.fullName) {
        alert('Please fill in all required fields');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newUser.email)) {
        alert('Please enter a valid email address');
        return;
      }

      // Ensure the role is set correctly before creating
      const userToCreate = {
        ...newUser,
        role: selectedRole // Use the currently selected role
      };

      console.log('Creating user:', userToCreate);
      const result = await createUser(userToCreate);
      console.log('User created:', result);

      setOpen(false);
      await fetchUsers(); // Refresh the user list
      
      // Reset form with current role
      setNewUser({
        username: '',
        password: '',
        email: '',
        fullName: '',
        role: selectedRole
      });

      alert('User created successfully!');
    } catch (error) {
      console.error('Error creating user:', error);
      alert(error.response?.data?.message || 'Error creating user. Please try again.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={selectedRole}
              label="Role"
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <MenuItem value="student">Students</MenuItem>
              <MenuItem value="teacher">Teachers</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" onClick={() => setOpen(true)}>
            Create New {selectedRole}
          </Button>
        </div>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Full Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeleteUser(user._id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={(e) => {
          e.preventDefault();
          handleCreateUser();
        }}>
          <DialogTitle>Create New {selectedRole}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Username"
              fullWidth
              required
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Password"
              type="password"
              fullWidth
              required
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Email"
              type="email"
              fullWidth
              required
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Full Name"
              fullWidth
              required
              value={newUser.fullName}
              onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
              sx={{ mb: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">Create</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default UserManagement;