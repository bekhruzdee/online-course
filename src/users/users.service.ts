// import {
//   ConflictException,
//   Injectable,
//   NotFoundException,
// } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { ILike, Repository } from 'typeorm';
// import { User } from './entities/user.entity';
// import { UpdateUserDto } from './dto/update-user.dto';
// import { CreateUserDto } from './dto/create-user.dto';
// import * as bcrypt from 'bcrypt';
// import { Role } from 'src/roles/entities/role.entity';

// @Injectable()
// export class UsersService {
//   constructor(
//     @InjectRepository(User)
//     private usersRepository: Repository<User>,

//     @InjectRepository(Role)
//     private roleRepository: Repository<Role>,
//   ) {}

//   async searchByUsername(username?: string) {
//     if (!username) {
//       throw new NotFoundException('Username query is required ❌');
//     }

//     const users = await this.usersRepository.find({
//       where: {
//         username: ILike(`%${username}%`),
//       },
//       relations: ['role'],
//     });

//     if (!users.length) {
//       throw new NotFoundException('No users found ❌');
//     }

//     const safeUsers = users.map(({ password, ...rest }) => rest);

//     return {
//       success: true,
//       message: 'Users found successfully ✅',
//       data: safeUsers,
//     };
//   }

//   async createUser(dto: CreateUserDto) {
//     const existingUser = await this.usersRepository.findOne({
//       where: { username: dto.username },
//     });
//     if (existingUser) throw new ConflictException('User already exists ❌');

//     const role = await this.roleRepository.findOne({
//       where: { id: dto.roleId },
//     });
//     if (!role) throw new NotFoundException('Role not found ❌');

//     if (role.name === 'admin') {
//       throw new ConflictException('Cannot create superadmin via API ❌');
//     }

//     const user = this.usersRepository.create({
//       username: dto.username,
//       password: await bcrypt.hash(dto.password, 12),
//       role,
//     });

//     const saved = await this.usersRepository.save(user);
//     const { password, ...safeUser } = saved;
//     return {
//       success: true,
//       message: 'User created successfully ✅',
//       data: safeUser,
//     };
//   }

//   async findAll() {
//     const users = await this.usersRepository.find({ relations: ['role'] });
//     const safeUsers = users.map(({ password, ...rest }) => rest);
//     return {
//       success: true,
//       message: 'Users retrieved successfully ✅',
//       data: safeUsers,
//     };
//   }

//   async findOne(id: string) {
//     const user = await this.usersRepository.findOne({
//       where: { id },
//       relations: ['role'],
//     });
//     if (!user) throw new NotFoundException('User not found ❌');

//     const { password, ...safeUser } = user;
//     return {
//       success: true,
//       message: 'User retrieved successfully ✅',
//       data: safeUser,
//     };
//   }

//   async update(userId: string, dto: UpdateUserDto) {
//     const user = await this.usersRepository.findOne({
//       where: { id: userId },
//       relations: ['role'],
//     });
//     if (!user) return { success: false, message: 'User not found ⚠️' };

//     if (user.role?.name === 'admin') {
//       throw new ConflictException('Superadmin cannot be modified ❌');
//     }

//     if (dto.password) dto.password = await bcrypt.hash(dto.password, 12);

//     if (dto.roleId) {
//       const role = await this.roleRepository.findOne({
//         where: { id: dto.roleId },
//       });
//       if (!role) throw new NotFoundException('Role not found ❌');
//       user.role = role;
//     }

//     Object.assign(user, dto);
//     const updated = await this.usersRepository.save(user);
//     const { password, ...safeUser } = updated;

//     return {
//       success: true,
//       message: 'User updated successfully ✅',
//       data: safeUser,
//     };
//   }

//   async remove(userId: string) {
//     const user = await this.usersRepository.findOne({
//       where: { id: userId },
//       relations: ['role'],
//     });
//     if (!user) return { success: false, message: 'User not found ⚠️' };

//     if (user.role?.name === 'admin') {
//       throw new ConflictException('Superadmin cannot be deleted ❌');
//     }

//     await this.usersRepository.remove(user);
//     return {
//       success: true,
//       message: 'User deleted successfully ✅',
//     };
//   }
// }

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/common/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async searchByUsername(username?: string) {
    if (!username) {
      throw new NotFoundException('Username query is required ❌');
    }

    const users = await this.usersRepository.find({
      where: {
        username: ILike(`%${username}%`),
      },
    });

    if (!users.length) {
      throw new NotFoundException('No users found ❌');
    }

    const safeUsers = users.map(({ password, ...rest }) => rest);

    return {
      success: true,
      message: 'Users found successfully ✅',
      data: safeUsers,
    };
  }

  async createUser(dto: CreateUserDto) {
    const existingUser = await this.usersRepository.findOne({
      where: { username: dto.username },
    });

    if (existingUser) {
      throw new ConflictException('User already exists ❌');
    }

    // ❗ API orqali admin yaratishni bloklaymiz
    if (dto.role === Role.ADMIN) {
      throw new ConflictException('Cannot create admin via API ❌');
    }

    const user = this.usersRepository.create({
      username: dto.username,
      password: await bcrypt.hash(dto.password, 12),
      role: dto.role ?? Role.STUDENT,
    });

    const saved = await this.usersRepository.save(user);
    const { password, ...safeUser } = saved;

    return {
      success: true,
      message: 'User created successfully ✅',
      data: safeUser,
    };
  }

  async findAll() {
    const users = await this.usersRepository.find();
    const safeUsers = users.map(({ password, ...rest }) => rest);

    return {
      success: true,
      message: 'Users retrieved successfully ✅',
      data: safeUsers,
    };
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found ❌');
    }

    const { password, ...safeUser } = user;

    return {
      success: true,
      message: 'User retrieved successfully ✅',
      data: safeUser,
    };
  }

  async update(userId: string, dto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found ❌');
    }

    if (user.role === Role.ADMIN) {
      throw new ConflictException('Admin cannot be modified ❌');
    }

    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 12);
    }

    if (dto.role === Role.ADMIN) {
      throw new ConflictException('Cannot promote user to admin ❌');
    }

    Object.assign(user, dto);

    const updated = await this.usersRepository.save(user);
    const { password, ...safeUser } = updated;

    return {
      success: true,
      message: 'User updated successfully ✅',
      data: safeUser,
    };
  }

  async remove(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found ❌');
    }

    if (user.role === Role.ADMIN) {
      throw new ConflictException('Admin cannot be deleted ❌');
    }

    await this.usersRepository.remove(user);

    return {
      success: true,
      message: 'User deleted successfully ✅',
    };
  }
}