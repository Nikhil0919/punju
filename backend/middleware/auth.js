const jwt = require('jsonwebtoken');

/**
 * Authenticate JWT token.
 * - Allows OPTIONS through (preflight requests)
 * - Returns 401 when Authorization header is missing for actual requests
 * - Returns 401/403 for expired/invalid tokens
 */
const authenticateToken = (req, res, next) => {
  try {
    // Allow preflight requests to pass through without auth
    if (req.method === 'OPTIONS') {
      return next();
    }

    // Get Authorization header (case-insensitive)
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header is missing' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      return res.status(401).json({ message: 'Authorization header format must be: Bearer <token>' });
    }

    const token = parts[1];
    if (!token) {
      return res.status(401).json({ message: 'Bearer token is missing' });
    }

    // Verify token (throws on invalid/expired)
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    return next();
  } catch (error) {
    console.error('Authentication error:', error && error.message ? error.message : error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: 'Invalid token' });
    }
    return res.status(500).json({ message: 'Internal server error during authentication' });
  }
};

const authorizeRole = (roles) => {
  return (req, res, next) => {
    // NOTE: If you call authorizeRole on routes that are not protected by authenticateToken,
    // make sure req.user exists. This guard ensures a clear 401 if someone forgot to authenticate.
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRole
};
