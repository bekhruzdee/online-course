import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from 'src/permissions/entities/permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,

    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async create(dto: CreateRoleDto) {
    const existing = await this.roleRepository.findOne({
      where: { name: dto.name },
    });
    if (existing) throw new ConflictException('Role already exists');

    const role = this.roleRepository.create({ name: dto.name });

    if (dto.permissionIds?.length) {
      const permissions = await this.permissionRepository.findByIds(
        dto.permissionIds,
      );
      role.permissions = permissions;
    }

    return this.roleRepository.save(role);
  }

  async findAll() {
    return this.roleRepository.find({ relations: ['permissions'] });
  }

  async findOne(id: number) {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async update(id: number, dto: UpdateRoleDto) {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
    if (!role) throw new NotFoundException('Role not found');

    if (dto.name) role.name = dto.name;

    if (dto.permissionIds?.length) {
      const permissions = await this.permissionRepository.findByIds(
        dto.permissionIds,
      );
      role.permissions = permissions;
    }

    return this.roleRepository.save(role);
  }

  async remove(id: number) {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['users'],
    });
    if (!role) throw new NotFoundException('Role not found');

    if (role.users?.length) {
      throw new ConflictException('Cannot delete role with assigned users');
    }

    await this.roleRepository.remove(role);
    return { message: 'Role deleted successfully' };
  }
}
