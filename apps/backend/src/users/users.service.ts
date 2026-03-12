import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import * as bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(dto: {
    email: string;
    name: string;
    password: string;
    role?: Role;
  }) {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash,
        role: dto.role || Role.DEVELOPER,
      },
    });
  }

  async update(
    id: string,
    dto: { email?: string; name?: string; password?: string; role?: Role },
  ) {
    const data: any = { ...dto };
    if (dto.password) data.passwordHash = await bcrypt.hash(dto.password, 10);
    delete data.password;
    return this.prisma.user.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.prisma.user.delete({ where: { id } });
    return { success: true };
  }
}
