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

        section.students = studentIds;
        await section.save();

        res.json({ message: 'Students assigned successfully' });
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

// Get all sections
router.get('/sections', adminAuth, async (req, res) => {
    try {
        const sections = await Section.find()
            .populate('students', 'fullName username')
            .populate('teachers', 'fullName username');
        res.json(sections);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sections', error: error.message });
    }
});

// Delete user
router.delete('/users/:userId', adminAuth, async (req, res) => {
    try {
        const { userId } = req.params;
        await User.findByIdAndDelete(userId);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
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