// import 'reflect-metadata';
// import { DataSource } from 'typeorm';
// import { User } from './users/entities/user.entity';
// import * as dotenv from 'dotenv';
// import { Course } from './courses/entities/course.entity';
// dotenv.config();

// export const AppDataSource = new DataSource({
//   type: 'postgres',
//   host: process.env.DB_HOST,
//   port: Number(process.env.DB_PORT),
//   username: process.env.DB_USERNAME,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_DATABASE,
//   entities: [User, Course],
//   synchronize: true,
// });
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const isProd = process.env.NODE_ENV === 'production';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  entities: isProd
    ? ['dist/**/*.entity.js']
    : ['src/**/*.entity.ts'],

  migrations: ['db/migrations/*.ts'],

  // migrations: isProd
  //   ? ['dist/migrations/*.js'] // production
  //   : ['db/migrations/*.ts'], // development

  synchronize: false,
});

export default AppDataSource;
