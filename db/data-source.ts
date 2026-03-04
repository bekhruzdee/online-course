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
import { User } from 'src/users/entities/user.entity';
import { Course } from 'src/courses/entities/course.entity';
import { Lesson } from 'src/lessons/entities/lesson.entity';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';
import * as dotenv from 'dotenv';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  entities: [User, Course, Lesson, Enrollment],

  migrations: isProd
    ? ['dist/migrations/*.js'] // production
    : ['db/migrations/*.ts'], // development

  synchronize: false,
});

export default AppDataSource;
