import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../common/enums/role.enum';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
dotenv.config();

export async function seed(dataSource: DataSource) {
  const userRepo = dataSource.getRepository(User);

  // 1️⃣ SUPERADMIN
  const superAdminUsername = process.env.SUPER_ADMIN_USERNAME || 'superadmin';
  const superAdminPassword =
    process.env.SUPER_ADMIN_PASSWORD || 'supersecure123';

  const existingSuperAdmin = await userRepo.findOne({
    where: { username: superAdminUsername },
  });

  if (!existingSuperAdmin) {
    const hashedPassword = await bcrypt.hash(superAdminPassword, 12);
    const superAdmin = userRepo.create({
      username: superAdminUsername,
      password: hashedPassword,
      role: Role.ADMIN,
    });
    await userRepo.save(superAdmin);
    console.log('✅ Superadmin created');
  } else {
    console.log('✔ Superadmin already exists');
  }

  // 2️⃣ DEFAULT TEACHERS
  const defaultTeachers = [
    { username: 'Shirin', password: 'Shirin123!' },
    { username: 'Touka', password: 'Touka123!' },
  ];

  for (const t of defaultTeachers) {
    const existingTeacher = await userRepo.findOne({
      where: { username: t.username },
    });
    if (!existingTeacher) {
      const hashedPassword = await bcrypt.hash(t.password, 12);
      const teacher = userRepo.create({
        username: t.username,
        password: hashedPassword,
        role: Role.TEACHER,
      });
      await userRepo.save(teacher);
      console.log(`✅ Teacher created: ${t.username}`);
    } else {
      console.log(`✔ Teacher already exists: ${t.username}`);
    }
  }

  console.log('🚀 Seeder finished successfully');
}
