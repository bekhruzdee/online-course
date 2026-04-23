import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../common/enums/role.enum';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
dotenv.config();

export async function seed(dataSource: DataSource) {
  const userRepo = dataSource.getRepository(User);

  const upsertUserWithPassword = async (
    username: string | undefined,
    plainPassword: string | undefined,
    role: Role,
    label: string,
  ) => {
    if (!username || !plainPassword) {
      console.log(`⚠ ${label} skipped: missing username or password in .env`);
      return;
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 12);
    const existingUser = await userRepo.findOne({ where: { username } });

    if (!existingUser) {
      const created = userRepo.create({
        username,
        password: hashedPassword,
        role,
      });
      await userRepo.save(created);
      console.log(`✅ ${label} created: ${username}`);
      return;
    }

    existingUser.password = hashedPassword;
    existingUser.role = role;
    await userRepo.save(existingUser);
    console.log(`🔄 ${label} updated: ${username}`);
  };

  // 1️⃣ SUPERADMIN
  const superAdminUsername = process.env.SUPER_ADMIN_USERNAME;
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;
  await upsertUserWithPassword(
    superAdminUsername,
    superAdminPassword,
    Role.ADMIN,
    'Superadmin',
  );

  const defaultTeachers = [
    {
      username: process.env.TEACHER_SHIRIN_USERNAME ?? 'Shirin',
      password: process.env.TEACHER_SHIRIN_PASSWORD,
      label: 'Teacher-1',
    },
    {
      username: process.env.TEACHER_TOUKA_USERNAME ?? 'Touka',
      password: process.env.TEACHER_TOUKA_PASSWORD,
      label: 'Teacher-2',
    },
  ];

  for (const t of defaultTeachers) {
    await upsertUserWithPassword(t.username, t.password, Role.TEACHER, t.label);
  }

  console.log('🚀 Seeder finished successfully');
}
