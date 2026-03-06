# 🎓 Online Course Platform

> Professional online course management system built with NestJS, TypeORM, and PostgreSQL

![Security Score](https://img.shields.io/badge/Security-A--91%25-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![NestJS](https://img.shields.io/badge/NestJS-11.0-red)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-blue)

---

## ✨ Features

### 🔐 Security & Authentication
- JWT-based authentication (Access + Refresh tokens)
- Google OAuth 2.0 integration
- bcrypt password hashing (12 rounds)
- Role-based access control (Admin, Teacher, Student)
- Rate limiting (100 requests/15 minutes)
- Helmet.js security headers
- CORS configuration
- Input validation & sanitization (XSS protection)

### 📚 Course Management
- Create, read, update, delete courses
- Course status management (Draft, Published)
- Teacher-specific course ownership
- Course search functionality
- Lessons management per course

### 👥 User Management
- User registration & authentication
- Role-based permissions
- User search
- Profile management
- Google social login

### 🎯 Enrollment System
- Student course enrollment
- Unique enrollment constraints
- Enrollment tracking
- Cascade delete support

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- pnpm (recommended) or npm

### Installation

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- pnpm (recommended) or npm

### Installation

```bash
# Clone repository
git clone <repository-url>
cd online-course

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials

# Create database
createdb online_course

# Run migrations
pnpm run migration:run

# Seed database (optional - creates admin user)
pnpm run seed
```

### Running the Application

```bash
# Development mode with hot-reload
pnpm run start:dev

# Production mode
pnpm run build
pnpm run start:prod
```

Server runs at: `http://localhost:3000`  
Frontend: `http://localhost:3000/login.html`

---

## 📁 Project Structure

```
src/
├── auth/              # Authentication module
│   ├── guards/        # Auth & Google guards
│   ├── strategies/    # Passport strategies
│   └── dto/          # Auth DTOs
├── users/            # User management
├── courses/          # Course CRUD operations
├── lessons/          # Lesson management
├── enrollments/      # Student enrollments
├── common/           # Shared utilities
│   ├── guards/       # Custom guards (roles, ownership)
│   ├── decorators/   # Custom decorators
│   ├── pipes/        # Sanitization pipes
│   ├── filters/      # Exception filters
│   └── enums/        # Enums (roles, status)
└── seed/             # Database seeding

db/
├── data-source.ts    # TypeORM configuration
└── migrations/       # Database migrations

frontend/             # Simple HTML/JS frontend
├── login.html
├── login.js
└── style.css
```

---

## 🗄️ Database Schema

### Users
- UUID primary key
- Username (unique)
- Password (hashed with bcrypt)
- Role (Admin, Teacher, Student)
- OAuth fields (provider, providerId)
- Timestamps

### Courses
- Serial ID
- Title, Description, Price
- Status (Draft, Published)
- Teacher (FK to Users)
- Timestamps

### Lessons
- Serial ID
- Title, Content URL
- Course (FK to Courses)
- Timestamps

### Enrollments
- UUID primary key
- User (FK to Users)
- Course (FK to Courses)
- Enrolled date
- Unique constraint (user, course)

---

## 🛡️ Security Features

### Input Validation
- ✅ class-validator decorators
- ✅ Whitelist & forbid non-whitelisted
- ✅ Transform decorators
- ✅ Custom sanitization pipe

### Authentication & Authorization
- ✅ JWT tokens (Access + Refresh)
- ✅ HttpOnly cookies
- ✅ Google OAuth 2.0
- ✅ Role-based guards
- ✅ Resource ownership guards

### Network Security
- ✅ Helmet.js (CSP, HSTS, etc.)
- ✅ CORS with credentials
- ✅ Rate limiting
- ✅ Cookie security flags

### Database Security
- ✅ TypeORM (SQL injection protection)
- ✅ Migrations (no auto-sync)
- ✅ Cascade deletes
- ✅ Environment variables

**Security Audit Score: 82/100 (A-)** 📊  
See [SECURITY-AUDIT.md](SECURITY-AUDIT.md) for details.

---

## 🔧 Database Migrations

```bash
# Generate new migration
pnpm run migration:generate

# Run migrations
pnpm run migration:run

# Revert last migration
pnpm run migration:revert

# Create empty migration
pnpm run migration:create ./db/migrations/MigrationName
```

---

## 📝 API Endpoints

### Authentication
```
POST   /auth/register          # Register new user
POST   /auth/login             # Login with credentials
POST   /auth/logout            # Logout (clear tokens)
GET    /auth/google            # Google OAuth login
GET    /auth/google/callback   # Google OAuth callback
```

### Users (Admin only)
```
GET    /users/all              # Get all users
GET    /users/search?username  # Search by username
GET    /users/:id              # Get user details
POST   /users                  # Create user
PATCH  /users/:id              # Update user
DELETE /users/:id              # Delete user
```

### Courses (Teacher/Admin)
```
GET    /courses                # Get all courses (Admin)
GET    /courses/:id            # Get course details
GET    /courses/search?title   # Search courses
POST   /courses                # Create course (Teacher/Admin)
PATCH  /courses/:id            # Update course (Owner/Admin)
DELETE /courses/:id            # Delete course (Owner/Admin)
PATCH  /courses/:id/publish    # Publish course (Admin)
```

### Lessons (Teacher/Admin)
```
GET    /lessons                # Get all lessons
GET    /lessons/:id            # Get lesson details
POST   /lessons                # Create lesson
PATCH  /lessons/:id            # Update lesson
DELETE /lessons/:id            # Delete lesson
```

### Enrollments
```
GET    /enrollments            # Get all enrollments
GET    /enrollments/:id        # Get enrollment details
POST   /enrollments            # Enroll student
DELETE /enrollments/:id        # Remove enrollment
```

---

## 👥 Default Users (after seed)

```javascript
// Admin account
Username: admin (or SUPER_ADMIN_USERNAME from .env)
Password: Admin@123 (or SUPER_ADMIN_PASSWORD from .env)
Role: ADMIN

// Test users (optional)
Teacher: teacher / Teacher@123
Student: student / Student@123
```

---

## 🧪 Testing

```bash
# Unit tests
pnpm run test

# E2E tests  
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```

---

## 📦 Tech Stack

- **Backend:** NestJS 11, TypeScript 5
- **Database:** PostgreSQL, TypeORM
- **Authentication:** JWT, Passport, Google OAuth
- **Security:** Helmet, bcrypt, class-validator, sanitize-html
- **Frontend:** Vanilla JS (demo)

---

## 🚀 Deployment Tips

### Environment
```bash
NODE_ENV=production
```

### Database
- Use SSL connection
- Set proper connection pool size
- Enable pg_stat_statements

### Security
- Enable HTTPS
- Set secure cookie flags
- Use strong JWT_SECRET (32+ chars)
- Enable CSP headers
- Set rate limits per user

### Monitoring
- Add logging (Winston/Pino)
- Set up error tracking (Sentry)
- Monitor database performance
- Track API usage

---

## 📚 Learn More

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [PostgreSQL Best Practices](https://www.postgresql.org/docs/)

---

## 📄 License

This project is [MIT licensed](LICENSE).

---

## 👨‍💻 Author

Built with ❤️ using NestJS and TypeScript

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**⭐ Star this repository if you found it helpful!**
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
