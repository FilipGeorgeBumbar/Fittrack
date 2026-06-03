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
import crypto from 'crypto';

const router = express.Router();
const prisma = new PrismaClient();

// In-memory store for 2FA codes (simulating email/SMS)
const twoFactorCodes = new Map();

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

    // Silver Challenge: 3-Way Auth (2FA)
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    twoFactorCodes.set(email.trim().toLowerCase(), {
      code,
      user,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
    });

    console.log(`\n==============================================`);
    console.log(`[2FA CODE FOR ${user.email}]: ${code}`);
    console.log(`==============================================\n`);

    res.json({ requires2FA: true, email: user.email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/verify-2fa', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: 'Email and code are required.' });

    const emailKey = email.trim().toLowerCase();
    const entry = twoFactorCodes.get(emailKey);

    if (!entry || entry.code !== code.trim() || entry.expiresAt < Date.now()) {
      return res.status(401).json({ error: 'Invalid or expired 2FA code.' });
    }

    twoFactorCodes.delete(emailKey);
    res.json(authResponse(entry.user));
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

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const user = await findUserByEmail(email.trim().toLowerCase());
    if (user) {
      // 8-character hex token (e.g. 1A2B3C4D) - shorter for easier typing
      const resetToken = crypto.randomBytes(4).toString('hex').toUpperCase();
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken, resetTokenExpiry }
      });

      console.log(`\n==============================================`);
      console.log(`[PASSWORD RESET TOKEN FOR ${user.email}]:`);
      console.log(`${resetToken}`);
      console.log(`==============================================\n`);
    }

    res.json({ message: 'If the email exists, a password reset link has been sent.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) {
      return res.status(400).json({ error: 'Email, token, and new password are required.' });
    }

    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user || user.resetToken !== token || user.resetTokenExpiry < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired reset token.' });
    }

    if (newPassword.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters.' });
    }

    const hashed = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    res.json({ message: 'Password updated successfully. You can now log in.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
