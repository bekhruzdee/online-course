// src/seed/seed.ts
import { DataSource } from 'typeorm';
import { Role } from '../roles/entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

export async function seed(dataSource: DataSource) {
  const roleRepo = dataSource.getRepository(Role);
  const permRepo = dataSource.getRepository(Permission);
  const userRepo = dataSource.getRepository(User);

  // 1️⃣ PERMISSIONS
  const permissionNames = [
    'create_course',
    'delete_course',
    'manage_users',
    'grade_student',
    'watch_course',
  ];
  const permissions: Permission[] = [];

  for (const name of permissionNames) {
    let perm = await permRepo.findOne({ where: { name } });
    if (!perm) {
      perm = permRepo.create({ name });
      await permRepo.save(perm);
      console.log(`Permission created: ${name}`);
    }
    permissions.push(perm);
  }

  // 2️⃣ ADMIN ROLE
  let adminRole = await roleRepo.findOne({
    where: { name: 'admin' },
    relations: ['permissions'],
  });
  if (!adminRole) {
    adminRole = roleRepo.create({ name: 'admin', permissions });
    await roleRepo.save(adminRole);
    console.log('Admin role created ✅');
  }

  // 3️⃣ SUPERADMIN
  const adminUsername = process.env.SUPER_ADMIN_USERNAME;
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    throw new Error(
      'SUPER_ADMIN_USERNAME or SUPER_ADMIN_PASSWORD not set in .env',
    );
  }

  const existingAdmin = await userRepo.findOne({
    where: { username: adminUsername },
    relations: ['role'],
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    const admin = userRepo.create({
      username: adminUsername,
      password: hashedPassword,
      role: adminRole,
    });
    await userRepo.save(admin);
    console.log('Super admin created ✅');
  } else {
    console.log('Super admin already exists ✔');
  }

  console.log('Seed finished successfully 🚀');
}
