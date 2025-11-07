const router = require('express').Router();
const Leave = require('../models/Leave');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Submit a leave request (student only)
router.post('/', authenticateToken, authorizeRole(['student']), async (req, res) => {
  try {
    const { reason, fromDate, toDate } = req.body;

    // Validate required fields
    if (!reason || !fromDate || !toDate) {
      return res.status(400).json({ message: 'Please provide reason, from date, and to date' });
    }

    // Validate dates
    const fromDateObj = new Date(fromDate);
    const toDateObj = new Date(toDate);

    if (isNaN(fromDateObj.getTime()) || isNaN(toDateObj.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    if (fromDateObj > toDateObj) {
      return res.status(400).json({ message: 'From date cannot be later than to date' });
    }

    const leave = new Leave({
      student: req.user.id,
      reason,
      fromDate: fromDateObj,
      toDate: toDateObj
    });

    await leave.save();
    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: 'Error submitting leave request', error: error.message });
  }
});

// Get my leave requests (student)
router.get('/my-leaves', authenticateToken, authorizeRole(['student']), async (req, res) => {
  try {
    const leaves = await Leave.find({ student: req.user.id })
      .sort({ submittedAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leave requests', error: error.message });
  }
});

// Get all leave requests (admin only)
router.get('/all', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate('student', 'username fullName')
      .sort({ submittedAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leave requests', error: error.message });
  }
});

// Update leave status (admin only)
router.put('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { status, adminRemarks } = req.body;
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status, adminRemarks },
      { new: true }
    ).populate('student', 'username fullName');
    
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: 'Error updating leave request', error: error.message });
  }
});

module.exports = router;