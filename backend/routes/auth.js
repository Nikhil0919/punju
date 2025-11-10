const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// Login route
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt received:', req.body);
    console.log('Headers:', req.headers);
    
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      console.log('Missing username or password');
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find user - case insensitive username search
    let user;
    try {
      user = await User.findOne({
        username: { $regex: new RegExp(`^${username}$`, 'i') }
      });
    } catch (err) {
      console.error('Database error when finding user:', err);
      return res.status(500).json({ message: 'Server error while finding user' });
    }
    
    console.log('Login attempt details:', {
      attemptedUsername: username,
      userFound: user ? 'yes' : 'no',
      userRole: user?.role,
      userId: user?._id,
      hashedPassword: user?.password ? 'exists' : 'missing'
    });
    
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Check password
    let isMatch = false;
    try {
      console.log('Checking password...');
      isMatch = await user.comparePassword(password);
      console.log('Password comparison result:', isMatch ? 'match' : 'no match');
    } catch (err) {
      console.error('Error comparing passwords:', err);
      return res.status(500).json({ message: 'Server error while verifying password' });
    }
    
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