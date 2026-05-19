import express from 'express';
import { PrismaClient } from '@prisma/client';
import { hashPassword, verifyPassword, needsRehash } from '../auth/password.js';
import { signToken, getTokenExpirySeconds } from '../auth/jwt.js';
import {
  ensureRolesAndPermissions,
  sanitizeUser,
  findUserByEmail,
  buildTokenPayload,
} from '../auth/roles.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

function authResponse(user) {
  const token = signToken(buildTokenPayload(user));
  return {
    token,
    expiresIn: getTokenExpirySeconds(),
    user: sanitizeUser(user),
  };
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, roleName } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }

    if (password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters.' });
    }

    const roles = await ensureRolesAndPermissions();
    const role = roles[roleName || 'Normal User'];
    if (!role) {
      return res.status(400).json({ error: 'Invalid role selected.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists.' });
    }

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashed,
        roleId: role.id,
      },
      include: { role: { include: { permissions: true } } },
    });

    res.status(201).json(authResponse(user));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, roleName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await findUserByEmail(email.trim().toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    if (roleName && user.role.name !== roleName) {
      return res.status(403).json({ error: `You do not have ${roleName} privileges.` });
    }

    if (await needsRehash(user.password)) {
      await prisma.user.update({
        where: { id: user.id },
        data: { password: await hashPassword(password) },
      });
    }

    res.json(authResponse(user));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/refresh', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.auth.sub },
      include: { role: { include: { permissions: true } } },
    });

    if (!user) {
      return res.status(401).json({ error: 'User no longer exists.' });
    }

    res.json(authResponse(user));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.auth.sub },
      include: { role: { include: { permissions: true } } },
    });

    if (!user) {
      return res.status(401).json({ error: 'User no longer exists.' });
    }

    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/logout', (_req, res) => {
  res.json({ message: 'Logged out successfully.' });
});

export default router;
