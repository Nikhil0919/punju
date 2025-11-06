const router = require('express').Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Placeholder route
router.get('/', authenticateToken, async (req, res) => {
    res.json({ message: 'Assignment routes working' });
});

module.exports = router;