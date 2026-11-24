import 'dotenv/config';
import prisma, { disconnectDB } from './prisma.js';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Script untuk mengecek dan meng-hash semua password user di database
 * yang masih berbentuk plain text (belum berawalan hash $2b$ atau $2a$)
 */
async function hashExistingPasswords() {
  console.log('Memeriksa password user di database Supabase...');

  const users = await prisma.users.findMany();
  let updatedCount = 0;

  for (const user of users) {
    const isAlreadyBcrypt = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');

    if (!isAlreadyBcrypt) {
      console.log(`Meng-hash password plain text untuk user: ${user.username}...`);
      const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);

      await prisma.users.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });
      updatedCount++;
    }
  }

  if (updatedCount === 0) {
    console.log('✅ Semua user di database sudah memiliki password yang di-hash (Bcrypt).');
  } else {
    console.log(`✅ Berhasil meng-hash ${updatedCount} password user yang sebelumnya plain text.`);
  }
}

hashExistingPasswords()
  .catch((e) => {
    console.error('❌ Gagal memeriksa/meng-hash password:', e);
    process.exit(1);
  })
  .finally(async () => {
    await disconnectDB();
  });
