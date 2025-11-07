const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const User = require('../models/User');
const Section = require('../models/Section');
const Timetable = require('../models/Timetable');

// Get student's own information including their section
router.get('/me', authenticateToken, authorizeRole(['student']), async (req, res) => {
    try {
        const student = await User.findById(req.user.id).select('-password');
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Find section that contains this student
        const section = await Section.findOne({ 
            students: req.user.id 
        });

        res.json({
            ...student.toObject(),
            section
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching student data', error: error.message });
    }
});

// Get student's timetable
router.get('/timetable', authenticateToken, authorizeRole(['student']), async (req, res) => {
    try {
        // Find the student's section first
        const section = await Section.findOne({ students: req.user.id });
        
        if (!section) {
            return res.status(404).json({ message: 'Student is not assigned to any section' });
        }

        const timetable = await Timetable.find({ section: section._id })
            .populate('teacher', 'name')
            .sort({ dayOfWeek: 1, startTime: 1 });
        
        res.json(timetable);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching timetable', error: error.message });
    }
});

module.exports = router;