import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { CoursesModule } from './courses/courses.module';
import { Course } from './courses/entities/course.entity';
import { LessonsModule } from './lessons/lessons.module';
import { Lesson } from './lessons/entities/lesson.entity';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { Enrollment } from './enrollments/entities/enrollment.entity';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL || 'info',
        redact: {
          paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'req.body.password',
            'req.body.access_token',
            'req.body.refresh_token',
            'res.headers["set-cookie"]',
          ],
          censor: '[REDACTED]',
        },
        serializers: {
          req(req) {
            return {
              id: req.id,
              method: req.method,
              url: req.url,
              remoteAddress: req.remoteAddress,
              remotePort: req.remotePort,
            };
          },
          res(res) {
            return {
              statusCode: res.statusCode,
            };
          },
        },
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  singleLine: true,
                  colorize: true,
                  translateTime: 'SYS:standard',
                },
              }
            : undefined,
      },
    }),

    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [User, Course, Lesson, Enrollment],
        synchronize: false,
      }),
    }),

    AuthModule,
    UsersModule,
    CoursesModule,
    LessonsModule,
    EnrollmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
