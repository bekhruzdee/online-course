import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../common/enums/role.enum';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as path from 'path';

const loadedEnv = dotenv.config({ path: path.resolve(process.cwd(), '.env') }).parsed ?? process.env;

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

  const upsertGoogleUser = async (
    username: string | undefined,
    label: string,
  ) => {
    if (!username) {
      console.log(`⚠ ${label} skipped: missing username in .env`);
      return;
    }

    const existingUser = await userRepo.findOne({ where: { username } });

    if (!existingUser) {
      const created = userRepo.create({
        username,
        role: Role.STUDENT,
        provider: 'google',
        providerId: username,
      });
      await userRepo.save(created);
      console.log(`✅ ${label} created: ${username}`);
      return;
    }

    existingUser.role = Role.STUDENT;
    existingUser.provider = 'google';
    existingUser.providerId = username;
    await userRepo.save(existingUser);
    console.log(`🔄 ${label} updated: ${username}`);
  };

  // 1️⃣ SUPERADMIN
  const superAdminUsername = loadedEnv.SUPER_ADMIN_USERNAME;
  const superAdminPassword = loadedEnv.SUPER_ADMIN_PASSWORD;
  await upsertUserWithPassword(
    superAdminUsername,
    superAdminPassword,
    Role.ADMIN,
    'Superadmin',
  );

  const defaultTeachers = [
    {
      username: loadedEnv.TEACHER_SHIRIN_USERNAME,
      password: loadedEnv.TEACHER_SHIRIN_PASSWORD,
      label: 'Teacher-1',
    },
    {
      username: loadedEnv.TEACHER_TOUKA_USERNAME,
      password: loadedEnv.TEACHER_TOUKA_PASSWORD,
      label: 'Teacher-2',
    },
  ];

  for (const t of defaultTeachers) {
    await upsertUserWithPassword(t.username, t.password, Role.TEACHER, t.label);
  }

  const googleUsers = [
    {
      username: loadedEnv.GOOGLE_USER_1_USERNAME,
      label: 'Google-User-1',
    },
    {
      username: loadedEnv.GOOGLE_USER_2_USERNAME,
      label: 'Google-User-2',
    },
  ];

  for (const user of googleUsers) {
    await upsertGoogleUser(user.username, user.label);
  }

  console.log('🚀 Seeder finished successfully');
}
