import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PERMISSIONS = ['READ', 'WRITE', 'DELETE', 'ALL'];

const ROLE_PERMISSIONS = {
  Admin: ['READ', 'WRITE', 'DELETE', 'ALL'],
  'Normal User': ['READ', 'WRITE'],
};

export async function ensureRolesAndPermissions() {
  const permissionRecords = {};
  for (const name of PERMISSIONS) {
    permissionRecords[name] = await prisma.permission.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const roles = {};
  for (const [roleName, permNames] of Object.entries(ROLE_PERMISSIONS)) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });

    await prisma.role.update({
      where: { id: role.id },
      data: {
        permissions: {
          set: permNames.map((n) => ({ id: permissionRecords[n].id })),
        },
      },
    });

    roles[roleName] = await prisma.role.findUnique({
      where: { id: role.id },
      include: { permissions: true },
    });
  }

  return roles;
}

export function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
}

export async function findUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email },
    include: {
      role: { include: { permissions: true } },
    },
  });
}

export function buildTokenPayload(user) {
  return {
    sub: user.id,
    email: user.email,
    role: user.role.name,
    roleId: user.roleId,
    permissions: user.role.permissions.map((p) => p.name),
  };
}
