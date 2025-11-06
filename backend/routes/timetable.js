const router = require('express').Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Get timetable for a section
router.get('/section/:sectionId', authenticateToken, async (req, res) => {
    try {
        const timetable = await Timetable.find({ section: req.params.sectionId })
            .populate('teacher', 'fullName')
            .populate('section', 'name');
        res.json(timetable);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching timetable', error: error.message });
    }
});

module.exports = router;