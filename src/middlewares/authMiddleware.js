import jwt from 'jsonwebtoken';
import { error } from '../utils/logger.js';

export function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token missing or invalid',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Simpan data user dari token ke request
    req.user = decoded; // misal: { id: 5, iat: ..., exp: ... }

    next();
  } catch (err) {
    error('JWT verification failed:', err.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
}

export default { authenticate };
