const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const User = require('../models/User');
const Section = require('../models/Section');
const Timetable = require('../models/Timetable');

// Get teacher's own information including assigned sections
router.get('/me', authenticateToken, authorizeRole(['teacher']), async (req, res) => {
    try {
        const teacher = await User.findById(req.user.id).select('-password');
        
        // Find sections where this teacher is assigned
        const sections = await Section.find({ 
            teachers: req.user.id 
        });

        res.json({
            ...teacher.toObject(),
            sections
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching teacher data', error: error.message });
    }
});

// Get teacher's timetable
router.get('/timetable', authenticateToken, authorizeRole(['teacher']), async (req, res) => {
    try {
        const timetable = await Timetable.find({ teacher: req.user.id })
            .populate('section', 'name')
            .sort({ dayOfWeek: 1, startTime: 1 });
        
        res.json(timetable);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching timetable', error: error.message });
    }
});

module.exports = router;