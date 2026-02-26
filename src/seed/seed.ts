// // src/seed/seed.ts
// import { DataSource } from 'typeorm';
// import { Role } from '../roles/entities/role.entity';
// import { Permission } from '../permissions/entities/permission.entity';
// import { User } from '../users/entities/user.entity';
// import * as bcrypt from 'bcrypt';

// export async function seed(dataSource: DataSource) {
//   const roleRepo = dataSource.getRepository(Role);
//   const permRepo = dataSource.getRepository(Permission);
//   const userRepo = dataSource.getRepository(User);

//   // 1️⃣ PERMISSIONS
//   const permissionNames = [
//     'create_course',
//     'delete_course',
//     'manage_users',
//     'grade_student',
//     'watch_course',
//   ];
//   const permissions: Permission[] = [];

//   for (const name of permissionNames) {
//     let perm = await permRepo.findOne({ where: { name } });
//     if (!perm) {
//       perm = permRepo.create({ name });
//       await permRepo.save(perm);
//       console.log(`Permission created: ${name}`);
//     }
//     permissions.push(perm);
//   }

//   // 2️⃣ ADMIN ROLE
//   let adminRole = await roleRepo.findOne({
//     where: { name: 'admin' },
//     relations: ['permissions'],
//   });
//   if (!adminRole) {
//     adminRole = roleRepo.create({ name: 'admin', permissions });
//     await roleRepo.save(adminRole);
//     console.log('Admin role created ✅');
//   }

//   // 3️⃣ SUPERADMIN
//   const adminUsername = process.env.SUPER_ADMIN_USERNAME;
//   const adminPassword = process.env.SUPER_ADMIN_PASSWORD;

//   if (!adminUsername || !adminPassword) {
//     throw new Error(
//       'SUPER_ADMIN_USERNAME or SUPER_ADMIN_PASSWORD not set in .env',
//     );
//   }

//   const existingAdmin = await userRepo.findOne({
//     where: { username: adminUsername },
//     relations: ['role'],
//   });

//   if (!existingAdmin) {
//     const hashedPassword = await bcrypt.hash(adminPassword, 12);
//     const admin = userRepo.create({
//       username: adminUsername,
//       password: hashedPassword,
//       role: adminRole,
//     });
//     await userRepo.save(admin);
//     console.log('Super admin created ✅');
//   } else {
//     console.log('Super admin already exists ✔');
//   }

//   console.log('Seed finished successfully 🚀');
// }
// src/seed/seed.ts
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
