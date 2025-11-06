const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// Login route
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt:', req.body.username);
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ username });
    console.log('User found:', user ? 'yes' : 'no');
    
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    console.log('Checking password...');
    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch ? 'yes' : 'no');
    
    if (!isMatch) {
      console.log('Password does not match');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { 
        id: user._id,
        role: user.role,
        username: user.username 
      },
      process.env.JWT_SECRET || '',
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        fullName: user.fullName
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user data' });
  }
});

module.exports = router;