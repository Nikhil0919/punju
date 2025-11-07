const router = require('express').Router();
const User = require('../models/User');
const Section = require('../models/Section');
const Timetable = require('../models/Timetable');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Middleware to check if user is admin
const adminAuth = [authenticateToken, authorizeRole(['admin'])];

// Create new user (student/teacher)
router.post('/users', adminAuth, async (req, res) => {
    try {
        const { username, password, email, role, fullName } = req.body;
        
        if (role === 'admin') {
            return res.status(403).json({ message: 'Cannot create admin users through this endpoint' });
        }

        const newUser = new User({
            username,
            password,
            email,
            role,
            fullName
        });

        await newUser.save();
        res.status(201).json({ message: 'User created successfully', userId: newUser._id });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'Username or email already exists' });
        } else {
            res.status(500).json({ message: 'Error creating user', error: error.message });
        }
    }
});

// Get all users by role
router.get('/users/:role', adminAuth, async (req, res) => {
    try {
        const { role } = req.params;
        if (!['student', 'teacher'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role specified' });
        }

        const users = await User.find({ role }).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});

// Get available teachers for a section
router.get('/sections/:sectionId/available-teachers', adminAuth, async (req, res) => {
    try {
        const teachers = await User.find({ role: 'teacher' })
            .select('fullName username email');
        
        res.json({
            availableTeachers: teachers
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching teachers', error: error.message });
    }
});

// Assign teachers to section
router.post('/sections/:sectionId/teachers', adminAuth, async (req, res) => {
    try {
        const { sectionId } = req.params;
        const { teacherIds } = req.body;

        const section = await Section.findById(sectionId);
        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }

        // Verify all teachers exist
        const teachers = await User.find({ 
            _id: { $in: teacherIds },
            role: 'teacher'
        });

        if (teachers.length !== teacherIds.length) {
            return res.status(400).json({ message: 'One or more teacher IDs are invalid' });
        }

        // Update section's teachers
        section.teachers = [...new Set([...section.teachers, ...teacherIds])];
        await section.save();

        // Return updated section with populated teacher data
        const updatedSection = await Section.findById(sectionId)
            .populate('teachers', 'fullName username email');

        res.json({ message: 'Teachers assigned successfully', section: updatedSection });
    } catch (error) {
        res.status(500).json({ message: 'Error assigning teachers', error: error.message });
    }
});

// Remove teacher from section
router.delete('/sections/:sectionId/teachers/:teacherId', adminAuth, async (req, res) => {
    try {
        const { sectionId, teacherId } = req.params;
        
        const section = await Section.findById(sectionId);
        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }

        // Check if teacher exists
        const teacher = await User.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Remove teacher from section
        section.teachers = section.teachers.filter(id => id.toString() !== teacherId);
        await section.save();

        // Return updated section with populated teacher data
        const updatedSection = await Section.findById(sectionId)
            .populate('teachers', 'fullName username email');

        res.json({ message: 'Teacher removed successfully', section: updatedSection });
    } catch (error) {
        res.status(500).json({ message: 'Error removing teacher', error: error.message });
    }
});

// Create new section
router.post('/sections', adminAuth, async (req, res) => {
    try {
        const { name, gradeLevel, academicYear } = req.body;
        const newSection = new Section({
            name,
            gradeLevel,
            academicYear
        });

        await newSection.save();
        res.status(201).json({ message: 'Section created successfully', sectionId: newSection._id });
    } catch (error) {
        res.status(500).json({ message: 'Error creating section', error: error.message });
    }
});

// Assign students to section
router.post('/sections/:sectionId/students', adminAuth, async (req, res) => {
    try {
        const { sectionId } = req.params;
        const { studentIds } = req.body;

        const section = await Section.findById(sectionId);
        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }

        // Verify all students exist and aren't already in the section
        const students = await User.find({ 
            _id: { $in: studentIds },
            role: 'student'
        });

        if (students.length !== studentIds.length) {
            return res.status(400).json({ message: 'One or more student IDs are invalid' });
        }

        // Initialize students array if it doesn't exist
        if (!section.students) {
            section.students = [];
        }

        // Filter out students that are already in the section
        const newStudentIds = studentIds.filter(id => 
            !section.students.some(existingId => existingId.toString() === id.toString())
        );

        if (newStudentIds.length === 0) {
            return res.status(400).json({ message: 'All selected students are already in this section' });
        }

        // Add the new students to the section
        section.students = [...section.students, ...newStudentIds];
        await section.save();

        // Return updated section with populated student data
        const updatedSection = await Section.findById(sectionId)
            .populate('students', 'username fullName email');

        res.json({
            message: 'Students assigned successfully',
            section: updatedSection
        });
    } catch (error) {
        res.status(500).json({ message: 'Error assigning students', error: error.message });
    }
});

// Create/Update timetable entry
router.post('/timetable', adminAuth, async (req, res) => {
    try {
        const { sectionId, teacherId, subject, dayOfWeek, startTime, endTime } = req.body;

        // Check for time conflicts
        const existingSlot = await Timetable.findOne({
            section: sectionId,
            dayOfWeek,
            $or: [
                {
                    startTime: { $lt: endTime },
                    endTime: { $gt: startTime }
                }
            ]
        });

        if (existingSlot) {
            return res.status(400).json({ message: 'Time slot conflicts with existing schedule' });
        }

        const timetableEntry = new Timetable({
            section: sectionId,
            teacher: teacherId,
            subject,
            dayOfWeek,
            startTime,
            endTime
        });

        await timetableEntry.save();
        res.status(201).json({ message: 'Timetable entry created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating timetable entry', error: error.message });
    }
});

// Get all sections with populated data
router.get('/sections', adminAuth, async (req, res) => {
    try {
        const sections = await Section.find()
            .populate('students', 'fullName username email')
            .populate('teachers', 'fullName username');
        res.json(sections);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sections', error: error.message });
    }
});

  // Get students in a section
router.get('/sections/:sectionId/students', adminAuth, async (req, res) => {
    try {
        const section = await Section.findById(req.params.sectionId)
            .populate('students', 'fullName username email');
        
        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }
        
        // Get all sections to identify assigned students
        const allSections = await Section.find();
        const assignedStudentIds = new Set(
            allSections.flatMap(sect => 
                sect.students.map(id => id.toString())
            )
        );
        
        // Get all students who are either unassigned or in the current section
        const availableStudents = await User.find({
            $or: [
                { _id: { $nin: Array.from(assignedStudentIds) } },
                { _id: { $in: section.students } }
            ],
            role: 'student'
        }).select('fullName username email');
        
        res.json({
            sectionStudents: section.students || [],
            availableStudents: availableStudents
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching section students', error: error.message });
    }
});// Delete user
router.delete('/users/:userId', adminAuth, async (req, res) => {
    try {
        const { userId } = req.params;
        await User.findByIdAndDelete(userId);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
});

// Remove student from section
router.delete('/sections/:sectionId/students/:studentId', adminAuth, async (req, res) => {
    try {
        const { sectionId, studentId } = req.params;
        
        // Find the section
        const section = await Section.findById(sectionId);
        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }

        // Check if student exists
        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Check if student is actually in the section
        if (!section.students.some(id => id.toString() === studentId)) {
            return res.status(400).json({ message: 'Student is not in this section' });
        }

        // Remove student from section
        section.students = section.students.filter(id => id.toString() !== studentId);
        await section.save();

        // Return updated section with populated student data
        const updatedSection = await Section.findById(sectionId)
            .populate('students', 'username fullName email');

        res.json({
            message: 'Student removed successfully',
            section: updatedSection
        });
    } catch (error) {
        res.status(500).json({ message: 'Error removing student', error: error.message });
    }
});

// Delete section
router.delete('/sections/:sectionId', adminAuth, async (req, res) => {
    try {
        const { sectionId } = req.params;
        await Section.findByIdAndDelete(sectionId);
        await Timetable.deleteMany({ section: sectionId });
        res.json({ message: 'Section and related timetable entries deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting section', error: error.message });
    }
});

module.exports = router;