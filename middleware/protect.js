import jwt from 'jsonwebtoken';
import db from '../config/db.js';

export async function protect(req, res, next) {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await db.query(
      'SELECT id, name, email FROM users WHERE id = $1',
      [decoded.id]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
}