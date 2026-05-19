import { verifyToken } from '../auth/jwt.js';

export function extractBearerToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) {
    return header.slice(7);
  }
  return null;
}

export function authenticateRequest(req) {
  const token = extractBearerToken(req);
  if (!token) return null;
  return verifyToken(token);
}

export function requireAuth(req, res, next) {
  const payload = authenticateRequest(req);
  if (!payload) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  req.auth = payload;
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    const payload = authenticateRequest(req);
    if (!payload) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!roles.includes(payload.role)) {
      return res.status(403).json({ error: 'Insufficient privileges.' });
    }
    req.auth = payload;
    next();
  };
}
