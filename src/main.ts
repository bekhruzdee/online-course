// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import helmet from 'helmet';
// import rateLimit from 'express-rate-limit';
// import cookieParser from 'cookie-parser';
// import { CsrfExceptionFilter } from './common/filters/csrf.filters';
// import { ValidationPipe } from '@nestjs/common';
// import { SanitizePipe } from './common/pipes/sanitize.pipe';

// // ⚠️ csurf CommonJS moduli, shuning uchun require ishlatiladi
// const csurf = require('csurf');

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);

//   // 🛡 Helmet — HTTP xavfsizlik headerlari
//   app.use(helmet());

//   // 🚫 Rate limiting — DDoS/brute-force himoyasi
//   app.use(
//     rateLimit({
//       windowMs: 15 * 60 * 1000, // 15 minutes
//       limit: 100, // 100 requests per 15 min per IP
//       message: 'Too many requests, please try again later.',
//     }),
//   );

//   // 🍪 Cookie parser — cookie o‘qish uchun
//   app.use(cookieParser());

//   // 🧿 CSRF himoya — token cookie orqali
//   app.use(csurf({ cookie: true }));

//   // ⚠️ CSRF xatolarni JSON tarzda qaytarish uchun Express-style error handler
//   app.use((err, req, res, next) => {
//     if (err.code === 'EBADCSRFTOKEN') {
//       return res.status(403).json({
//         statusCode: 403,
//         success: false,
//         message: 'CSRF token is missing or invalid ❌',
//         path: req.url,
//       });
//     }
//     next(err);
//   });

//   // 🔹 NestJS ExceptionFilter lar uchun (agar kerak bo‘lsa)
//   app.useGlobalFilters(new CsrfExceptionFilter());

//   app.useGlobalPipes(
//     new SanitizePipe(), // 1) XSS sanitizatsiya
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
import { ValidationPipe } from '@nestjs/common';
import { SanitizePipe } from './common/pipes/sanitize.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 100,
      message: 'Too many requests, please try again later.',
    }),
  );

  app.use(cookieParser());

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
  console.log(`🚀 Server running on http://localhost:${PORT}`);
}

bootstrap();
