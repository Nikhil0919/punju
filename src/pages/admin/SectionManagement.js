import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Checkbox
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { 
  createSection, 
  getSections, 
  assignStudentsToSection, 
  deleteSection, 
  removeStudentFromSection, 
  getSectionStudents,
  getAvailableTeachers,
  assignTeachersToSection,
  removeTeacherFromSection
} from '../../services/api';

const SectionManagement = () => {
  const [sections, setSections] = useState([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [addStudentsDialogOpen, setAddStudentsDialogOpen] = useState(false);
  const [removeStudentsDialogOpen, setRemoveStudentsDialogOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [newSection, setNewSection] = useState({
    name: '',
    gradeLevel: '',
    academicYear: ''
  });
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [addTeachersDialogOpen, setAddTeachersDialogOpen] = useState(false);
  const [removeTeachersDialogOpen, setRemoveTeachersDialogOpen] = useState(false);

  // Fetch sections and available students
  const fetchSections = async () => {
    try {
      const data = await getSections();
      setSections(data);
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  const fetchAvailableStudents = useCallback(async () => {
    if (!selectedSection?._id) return;

    try {
      // Get unassigned students from the backend
      const response = await getSectionStudents(selectedSection._id);
      const unassignedStudents = response.availableStudents || [];
      
      console.log('Available students:', unassignedStudents.length);
      
      // Update available students
      setAvailableStudents(unassignedStudents);
      
      // Clear any selections of students that are no longer available
      setSelectedStudents(prev => 
        prev.filter(selectedId =>
          unassignedStudents.some(student => student._id === selectedId)
        )
      );
    } catch (error) {
      console.error('Error fetching available students:', error);
      setAvailableStudents([]);
    }
  }, [selectedSection?._id]);

  useEffect(() => {
    fetchSections();
  }, []);

  useEffect(() => {
    if (addStudentsDialogOpen && selectedSection?._id) {
      // Only fetch data when dialog opens, don't clear selections
      fetchAvailableStudents();
      // Get current section students
      getSectionStudents(selectedSection._id)
        .then(students => {
          if (students) {
            setSelectedSection(prev => ({
              ...prev,
              students: Array.isArray(students) ? students : []
            }));
          }
        })
        .catch(error => {
          console.error('Error fetching section students:', error);
        });
    }
  }, [addStudentsDialogOpen, selectedSection?._id, fetchAvailableStudents]);

  useEffect(() => {
    const fetchSectionStudentDetails = async () => {
      try {
        if (!selectedSection?._id) return;

        console.log('Fetching students for section:', selectedSection._id);
        const students = await getSectionStudents(selectedSection._id);
        console.log('Fetched students:', students);

        if (Array.isArray(students)) {
          setSelectedSection(prev => ({
            ...prev,
            students: students
          }));
        } else {
          console.error('Received invalid students data:', students);
          setSelectedSection(prev => ({
            ...prev,
            students: []
          }));
        }
      } catch (error) {
        console.error('Error fetching section students:', error);
        setSelectedSection(prev => ({
          ...prev,
          students: []
        }));
      }
    };

    // Reset selected students and fetch new data when dialog opens
    if (removeStudentsDialogOpen && selectedSection?._id) {
      setSelectedStudents([]);
      setSelectedSection(prev => ({ ...prev, students: [] })); // Initialize empty array
      fetchSectionStudentDetails();
    }
  }, [removeStudentsDialogOpen, selectedSection?._id]);

  // Handle section creation
  const handleCreateSection = async () => {
    try {
      await createSection(newSection);
      setCreateDialogOpen(false);
      setNewSection({ name: '', gradeLevel: '', academicYear: '' });
      fetchSections();
    } catch (error) {
      console.error('Error creating section:', error);
    }
  };

  // Handle adding students to section
  const handleAddStudents = async () => {
    if (!selectedStudents.length) {
      alert('Please select students to add');
      return;
    }

    if (!selectedSection?._id) {
      alert('No section selected');
      return;
    }

    // Convert any student objects to IDs
    const studentIds = selectedStudents.map(student => 
      typeof student === 'string' ? student : student._id
    );

    try {
      console.log('Adding students:', studentIds, 'to section:', selectedSection._id);
      await assignStudentsToSection(selectedSection._id, studentIds);
      
      // Get updated section data with detailed student information
      const sectionData = await getSectionStudents(selectedSection._id);
      if (sectionData) {
        setSelectedSection(prev => ({
          ...prev,
          students: sectionData.sectionStudents || []
        }));
      }

      // Close dialog only after successful update
      setAddStudentsDialogOpen(false);
      
      // Clear selections only after dialog is closed
      setSelectedStudents([]);
      
      // Refresh data
      await Promise.all([
        fetchSections(),
        fetchAvailableStudents()
      ]);
      
      alert('Students added successfully');
    } catch (error) {
      console.error('Error assigning students:', error);
      alert('Error adding students: ' + (error.response?.data?.message || error.message));
    }
  };

  // Handle removing students from section
  const handleRemoveStudents = async () => {
    if (!selectedStudents.length) {
      alert('Please select students to remove');
      return;
    }

    const confirmMessage = `Are you sure you want to remove ${selectedStudents.length} student(s) from this section?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      // Remove each selected student one by one
      const removePromises = selectedStudents.map(async (student) => {
        // Make sure we have the correct student ID format
        const studentId = typeof student === 'string' ? student : student._id;
        console.log('Removing student:', studentId, 'from section:', selectedSection._id);
        try {
          await removeStudentFromSection(selectedSection._id, studentId.toString());
        } catch (error) {
          console.error(`Failed to remove student ${studentId}:`, error);
          throw error;
        }
      });

      await Promise.all(removePromises);
      
      // Close dialog and clear selections
      setRemoveStudentsDialogOpen(false);
      setSelectedStudents([]);
      
      // Refresh sections data
      const sections = await getSections();
      const updatedSection = sections.find(s => s._id === selectedSection._id);
      
      if (updatedSection) {
        // Get detailed student data for the section
        const sectionData = await getSectionStudents(selectedSection._id);
        setSelectedSection({
          ...updatedSection,
          students: sectionData.sectionStudents || []
        });
      }
      
      // Update available students list
      await fetchAvailableStudents();
      
      alert('Students have been removed. They can now be assigned to other sections if needed.');
    } catch (error) {
      console.error('Error removing students:', error);
      alert('Error removing students: ' + (error.response?.data?.message || error.message));
    }
  };

  // Handle student selection
  const handleStudentToggle = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  // Load section data when remove dialog opens
  useEffect(() => {
    if (removeStudentsDialogOpen && selectedSection?._id) {
      const fetchSectionData = async () => {
        try {
          // Get fresh section data with students
          const sections = await getSections();
          const currentSection = sections.find(s => s._id === selectedSection._id);
          
          if (currentSection) {
            // Get detailed student data
            const response = await getSectionStudents(selectedSection._id);
            const sectionStudents = response.sectionStudents || [];
            
            setSelectedSection(prev => ({
              ...currentSection,
              students: sectionStudents
            }));
          }
          
          // Reset selections when dialog opens
          setSelectedStudents([]);
        } catch (error) {
          console.error('Error fetching section data:', error);
        }
      };
      
      fetchSectionData();
    }
  }, [removeStudentsDialogOpen, selectedSection?._id]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <Typography variant="h6">Sections</Typography>
          <Button 
            variant="contained" 
            onClick={() => setCreateDialogOpen(true)}
          >
            Create New Section
          </Button>
        </div>

        <List>
          {sections.map((section) => (
            <ListItem key={section._id}>
              <ListItemText 
                primary={section.name}
                secondary={`Grade ${section.gradeLevel} - ${section.academicYear}`}
              />
              <ListItemSecondaryAction>
                <IconButton 
                  edge="end" 
                  aria-label="add students"
                  onClick={() => {
                    setSelectedSection(section);
                    setAddStudentsDialogOpen(true);
                  }}
                  style={{ marginRight: 8 }}
                >
                  <PersonAddIcon />
                </IconButton>
                <IconButton 
                  edge="end" 
                  aria-label="manage students"
                  onClick={() => {
                    setSelectedSection(section);
                    setRemoveStudentsDialogOpen(true);
                  }}
                  style={{ marginRight: 8 }}
                >
                  <PersonAddIcon style={{ transform: 'rotate(45deg)' }} />
                </IconButton>
                <IconButton 
                  edge="end" 
                  aria-label="delete section"
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to delete this section? This action cannot be undone.')) {
                      try {
                        await deleteSection(section._id);
                        await fetchSections();
                        await fetchAvailableStudents();
                      } catch (error) {
                        console.error('Error deleting section:', error);
                      }
                    }
                  }}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Create Section Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Create New Section</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Section Name"
            fullWidth
            value={newSection.name}
            onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Grade Level"
            type="number"
            fullWidth
            value={newSection.gradeLevel}
            onChange={(e) => setNewSection({ ...newSection, gradeLevel: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Academic Year"
            fullWidth
            value={newSection.academicYear}
            onChange={(e) => setNewSection({ ...newSection, academicYear: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateSection}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Add Students Dialog */}
      <Dialog 
        open={addStudentsDialogOpen} 
        onClose={() => setAddStudentsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Students to {selectedSection?.name}</DialogTitle>
        <DialogContent>
          <List>
            {availableStudents.map((student) => (
              <ListItem 
                key={student._id}
                dense
              >
                <ListItemButton
                  onClick={() => handleStudentToggle(student._id)}
                  disabled={selectedSection?.students?.some(s => 
                    (typeof s === 'object' ? s._id : s) === student._id
                  )}
                >
                  <Checkbox
                    edge="start"
                    checked={selectedStudents.includes(student._id)}
                    tabIndex={-1}
                    disableRipple
                    sx={{ marginRight: 2 }}
                  />
                  <ListItemText
                    primary={student.fullName || student.username}
                    secondary={student.email}
                  />
                </ListItemButton>
              </ListItem>
            ))}
            {availableStudents.length === 0 && (
              <ListItem>
                <ListItemText 
                  primary={
                    selectedSection?.students?.length > 0 
                      ? "No more students available to add" 
                      : "Loading available students..."
                  } 
                />
              </ListItem>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddStudentsDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddStudents} 
            variant="contained" 
            color="primary"
            disabled={selectedStudents.length === 0}
          >
            Add Selected Students ({selectedStudents.length})
          </Button>
        </DialogActions>
      </Dialog>

      {/* Remove Students Dialog */}
      <Dialog 
        open={removeStudentsDialogOpen} 
        onClose={() => setRemoveStudentsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Remove Students from {selectedSection?.name}</DialogTitle>
        <DialogContent>
          {removeStudentsDialogOpen && !selectedSection?.students && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              Loading students...
            </div>
          )}
          <List>
            {selectedSection?.students?.map((student) => (
              <ListItem 
                key={typeof student === 'object' ? student._id : student}
                dense
                button
                onClick={() => handleStudentToggle(typeof student === 'object' ? student._id : student)}
              >
                <Checkbox
                  edge="start"
                  checked={selectedStudents.includes(typeof student === 'object' ? student._id : student)}
                  tabIndex={-1}
                  disableRipple
                  sx={{ marginRight: 2 }}
                />
                <ListItemText
                  primary={typeof student === 'object' ? (student.fullName || student.username) : student}
                  secondary={typeof student === 'object' ? student.email : ''}
                />
              </ListItem>
            ))}
            {(!selectedSection?.students || selectedSection.students.length === 0) && (
              <ListItem>
                <ListItemText primary="No students in this section" />
              </ListItem>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveStudentsDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleRemoveStudents}
            color="error"
            variant="contained"
            disabled={selectedStudents.length === 0}
          >
            Remove Selected Students ({selectedStudents.length})
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SectionManagement;