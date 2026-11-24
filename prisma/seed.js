import 'dotenv/config';
import prisma, { disconnectDB } from './prisma.js';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

async function main() {
  const username = 'admin';
  const plainPassword = 'admin123';

  console.log(`Meng-hash password "${plainPassword}" dengan bcrypt (${SALT_ROUNDS} salt rounds)...`);
  const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);

  const user = await prisma.users.upsert({
    where: { username },
    update: {
      password: hashedPassword,
    },
    create: {
      username,
      password: hashedPassword,
    },
  });

  console.log(`\n✅ Berhasil menyimpan user ke Supabase:`);
  console.log(`   ID       : ${user.id}`);
  console.log(`   Username : ${user.username}`);
  console.log(`   Password : ${plainPassword} (Disimpan sebagai Hash Bcrypt di Supabase)`);
  console.log(`   Hash DB  : ${user.password}`);
}

main()
  .catch((e) => {
    console.error('❌ Gagal seeding user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await disconnectDB();
  });
