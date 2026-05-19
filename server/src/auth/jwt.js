import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fittrack-dev-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30m';

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function getTokenExpirySeconds() {
  const match = /^(\d+)([smhd])$/.exec(JWT_EXPIRES_IN);
  if (!match) return 1800;
  const value = Number(match[1]);
  const unit = match[2];
  const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
  return value * (multipliers[unit] || 60);
}
