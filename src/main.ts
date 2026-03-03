// import { NestFactory, Reflector } from '@nestjs/core';
// import { AppModule } from './app.module';
// import helmet from 'helmet';
// import rateLimit from 'express-rate-limit';
// import cookieParser from 'cookie-parser';
// import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
// import { SanitizePipe } from './common/pipes/sanitize.pipe';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);

//   // 🛡 Helmet — HTTP xavfsizlik headerlari
//   app.use(helmet());

//   // 🚫 Rate limiting — DDoS/brute-force himoyasi
//   app.use(
//     rateLimit({
//       windowMs: 15 * 60 * 1000,
//       limit: 100,
//       message: 'Too many requests, please try again later.',
//     }),
//   );

//   app.use(cookieParser());

//   app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

//   app.useGlobalPipes(
//     new SanitizePipe(),
//     new ValidationPipe({
//       whitelist: true,
//       forbidNonWhitelisted: true,
//       transform: true,
//     }),
//   );

//   const PORT = process.env.PORT || 3000;
//   await app.listen(PORT);
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// }

// bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { SanitizePipe } from './common/pipes/sanitize.pipe';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express'; // ← muhim!

async function bootstrap() {
  // NestExpressApplication tipini majburiy ishlatamiz
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Statik fayllarni frontend papkasidan xizmat qilamiz (prefixsiz)
  app.useStaticAssets(join(__dirname, '..', 'frontend'));

  // Agar /frontend prefixini saqlamoqchi bo'lsangiz:
  // app.useStaticAssets(join(__dirname, '..', 'frontend'), { prefix: '/frontend/' });

  app.use(helmet());

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 daqiqa
      limit: 100,
      message: 'Juda ko‘p so‘rov, keyinroq urinib ko‘ring.',
    }),
  );

  app.use(cookieParser());

  // Agar global serializer kerak bo'lsa, lekin redirect bo'lgan joylarda muammo chiqmasligi uchun
  // app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.useGlobalPipes(
    new SanitizePipe(),
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);
  console.log(`🚀 Server http://localhost:${PORT} da ishlamoqda`);
}

bootstrap();