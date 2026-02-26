// import 'reflect-metadata';
// import { DataSource } from 'typeorm';
// import { User } from './users/entities/user.entity';
// import { Role } from './roles/entities/role.entity';
// import { Permission } from './permissions/entities/permission.entity';
// import * as dotenv from 'dotenv';
// dotenv.config();

// export const AppDataSource = new DataSource({
//   type: 'postgres',
//   host: process.env.DB_HOST,
//   port: Number(process.env.DB_PORT),
//   username: process.env.DB_USERNAME,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_DATABASE,
//   entities: [User, Role, Permission],
//   synchronize: true,
// });

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './users/entities/user.entity';
import * as dotenv from 'dotenv';
import { Course } from './courses/entities/course.entity';
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [User, Course], 
  synchronize: true,
});