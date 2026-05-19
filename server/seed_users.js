import { PrismaClient } from '@prisma/client';
import { hashPassword } from './src/auth/password.js';
import { ensureRolesAndPermissions } from './src/auth/roles.js';

const prisma = new PrismaClient();

async function main() {
  console.log('--- CURĂȚARE ȘI SINCRONIZARE UTILIZATORI (DOAR CEI 6 ALEȘI) ---');

  const roles = await ensureRolesAndPermissions();
  const adminRole = roles['Admin'];
  const userRole = roles['Normal User'];

  const allowedEmails = [
    'filipbumbar@email.com',
    'staff@email.com',
    'johndoe@email.com',
    'jackswagger@email.com',
    'tonybarbaro@email.com',
    'gordonjohnson@email.com',
  ];

  const deleteResult = await prisma.user.deleteMany({
    where: { email: { notIn: allowedEmails } },
  });
  console.log(`🗑️ S-au șters ${deleteResult.count} utilizatori vechi.`);

  const users = [
    { name: 'Filip Bumbar', email: 'filipbumbar@email.com', password: 'Srsiaf23', roleId: adminRole.id },
    { name: 'Staff', email: 'staff@email.com', password: 'AdminUser', roleId: adminRole.id },
    { name: 'John Doe', email: 'johndoe@email.com', password: 'user', roleId: userRole.id },
    { name: 'Jack Swagger', email: 'jackswagger@email.com', password: 'user', roleId: userRole.id },
    { name: 'Tony Barbaro', email: 'tonybarbaro@email.com', password: 'user', roleId: userRole.id },
    { name: 'Gordon Johnson', email: 'gordonjohnson@email.com', password: 'user', roleId: userRole.id },
  ];

  for (const u of users) {
    const hashed = await hashPassword(u.password);
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, password: hashed, roleId: u.roleId, isSuspicious: false },
      create: {
        name: u.name,
        email: u.email,
        password: hashed,
        roleId: u.roleId,
        isSuspicious: false,
      },
    });
    console.log(`✅ Activat: ${u.name} (${u.email})`);
  }

  console.log('\n✨ GATA! Parolele sunt hash-uite (bcrypt).');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
