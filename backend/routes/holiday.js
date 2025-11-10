const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const Holiday = require('../models/Holiday');

// Admin Routes

// Create a new holiday
router.post('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { title, description, startDate, endDate, type } = req.body;

    // Validate dates
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ message: 'Start date cannot be after end date' });
    }

    const holiday = new Holiday({
      title,
      description,
      startDate,
      endDate,
      type
    });

    await holiday.save();
    res.status(201).json(holiday);
  } catch (error) {
    res.status(500).json({ message: 'Error creating holiday', error: error.message });
  }
});

// Get all holidays
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { month, year, type } = req.query;
    let query = {};

    // Filter by month and year if provided
    if (month && year) {
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0);
      query.startDate = { $lte: endOfMonth };
      query.endDate = { $gte: startOfMonth };
    }

    // Filter by type if provided
    if (type) {
      query.type = type;
    }

    const holidays = await Holiday.find(query)
      .sort({ startDate: 1 });
    
    res.json(holidays);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching holidays', error: error.message });
  }
});

// Update a holiday (admin only)
router.put('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { title, description, startDate, endDate, type } = req.body;

    // Validate dates
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ message: 'Start date cannot be after end date' });
    }

    const holiday = await Holiday.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        startDate,
        endDate,
        type
      },
      { new: true }
    );

    if (!holiday) {
      return res.status(404).json({ message: 'Holiday not found' });
    }

    res.json(holiday);
  } catch (error) {
    res.status(500).json({ message: 'Error updating holiday', error: error.message });
  }
});

// Delete a holiday (admin only)
router.delete('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const holiday = await Holiday.findByIdAndDelete(req.params.id);
    
    if (!holiday) {
      return res.status(404).json({ message: 'Holiday not found' });
    }

    res.json({ message: 'Holiday deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting holiday', error: error.message });
  }
});

// Get upcoming holidays
router.get('/upcoming', authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    const holidays = await Holiday.find({
      endDate: { $gte: today }
    })
    .sort({ startDate: 1 })
    .limit(5);

    res.json(holidays);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching upcoming holidays', error: error.message });
  }
});

// Get holiday statistics for the current academic year
router.get('/statistics', authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    const currentYear = today.getFullYear();
    // Academic year starts from July
    const academicYearStart = new Date(today.getMonth() < 6 ? currentYear - 1 : currentYear, 6, 1);
    const academicYearEnd = new Date(today.getMonth() < 6 ? currentYear : currentYear + 1, 5, 30);

    const holidays = await Holiday.find({
      startDate: { $gte: academicYearStart },
      endDate: { $lte: academicYearEnd }
    });

    const statistics = {
      academic: 0,
      national: 0,
      other: 0,
      totalDays: 0
    };

    holidays.forEach(holiday => {
      const days = Math.ceil((holiday.endDate - holiday.startDate) / (1000 * 60 * 60 * 24)) + 1;
      statistics[holiday.type] = (statistics[holiday.type] || 0) + 1;
      statistics.totalDays += days;
    });

    res.json(statistics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching holiday statistics', error: error.message });
  }
});

module.exports = router;