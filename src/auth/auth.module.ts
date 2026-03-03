// import { Module } from '@nestjs/common';
// import { JwtModule } from '@nestjs/jwt';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { AuthService } from './auth.service';
// import { AuthController } from './auth.controller';
// import { User } from 'src/users/entities/user.entity';
// import { AuthGuard } from './auth.guard';

// @Module({
//   imports: [
//     ConfigModule.forRoot({ isGlobal: true }),
//     TypeOrmModule.forFeature([User]),
//     JwtModule.registerAsync({
//       imports: [ConfigModule],
//       inject: [ConfigService],
//       useFactory: (config: ConfigService) => ({
//         secret: config.get<string>('JWT_SECRET') || 'default_secret',
//         signOptions: {
//           expiresIn: (config.get<string>('JWT_EXPIRES_IN') as any) || '1h',
//         },
//       }),
//     }),
//   ],
//   controllers: [AuthController],
//   providers: [AuthService, AuthGuard],
//   exports: [AuthGuard, JwtModule],
// })
// export class AuthModule {}

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from 'src/users/entities/user.entity';
import { AuthGuard } from './auth.guard';
import { GoogleStrategy } from './strategies/google.strategy';
import { GoogleAuthGuard } from './google.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const expiresInEnv = config.get<string>('JWT_EXPIRES_IN') || '3600'; // sekundda string
        return {
          secret: config.get<string>('JWT_SECRET') || 'default_secret',
          signOptions: {
            expiresIn: Number(expiresInEnv), // string → number
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, GoogleStrategy, GoogleAuthGuard],
  exports: [AuthGuard, JwtModule],
})
export class AuthModule {}
