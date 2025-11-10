const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const Timetable = require('../models/Timetable');

// Middleware to check if user is admin
const adminAuth = [authenticateToken, authorizeRole(['admin'])];

// Get timetable for a section
router.get('/section/:sectionId', authenticateToken, async (req, res) => {
    try {
        const timetable = await Timetable.find({ section: req.params.sectionId })
            .populate('teacher', 'fullName username')
            .populate('section', 'name');
        res.json(timetable);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching timetable', error: error.message });
    }
});

// Create new timetable entry
router.post('/', adminAuth, async (req, res) => {
    try {
        const { section, teacher, subject, dayOfWeek, startTime, endTime, room } = req.body;

        // Check for time conflicts
        const conflicts = await Timetable.find({
            $or: [
                { section, dayOfWeek, startTime },
                { teacher, dayOfWeek, startTime },
                {
                    section,
                    dayOfWeek,
                    startTime: { $lt: endTime },
                    endTime: { $gt: startTime }
                },
                {
                    teacher,
                    dayOfWeek,
                    startTime: { $lt: endTime },
                    endTime: { $gt: startTime }
                }
            ]
        });

        if (conflicts.length > 0) {
            return res.status(400).json({
                message: 'Time slot conflicts with existing schedule'
            });
        }

        const timetableEntry = new Timetable({
            section,
            teacher,
            subject,
            dayOfWeek,
            startTime,
            endTime,
            room
        });

        await timetableEntry.save();
        
        const savedEntry = await Timetable.findById(timetableEntry._id)
            .populate('teacher', 'fullName username')
            .populate('section', 'name');

        res.status(201).json(savedEntry);
    } catch (error) {
        res.status(500).json({ message: 'Error creating timetable entry', error: error.message });
    }
});

// Update timetable entry
router.put('/:id', adminAuth, async (req, res) => {
    try {
        const { section, teacher, subject, dayOfWeek, startTime, endTime, room } = req.body;

        // Check for conflicts excluding current entry
        const conflicts = await Timetable.find({
            _id: { $ne: req.params.id },
            $or: [
                { section, dayOfWeek, startTime },
                { teacher, dayOfWeek, startTime },
                {
                    section,
                    dayOfWeek,
                    startTime: { $lt: endTime },
                    endTime: { $gt: startTime }
                },
                {
                    teacher,
                    dayOfWeek,
                    startTime: { $lt: endTime },
                    endTime: { $gt: startTime }
                }
            ]
        });

        if (conflicts.length > 0) {
            return res.status(400).json({
                message: 'Time slot conflicts with existing schedule'
            });
        }

        const updatedEntry = await Timetable.findByIdAndUpdate(
            req.params.id,
            {
                section,
                teacher,
                subject,
                dayOfWeek,
                startTime,
                endTime,
                room
            },
            { new: true }
        ).populate('teacher', 'fullName username')
         .populate('section', 'name');

        if (!updatedEntry) {
            return res.status(404).json({ message: 'Timetable entry not found' });
        }

        res.json(updatedEntry);
    } catch (error) {
        res.status(500).json({ message: 'Error updating timetable entry', error: error.message });
    }
});

// Delete timetable entry
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const deletedEntry = await Timetable.findByIdAndDelete(req.params.id);
        if (!deletedEntry) {
            return res.status(404).json({ message: 'Timetable entry not found' });
        }
        res.json({ message: 'Timetable entry deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting timetable entry', error: error.message });
    }
});

module.exports = router;