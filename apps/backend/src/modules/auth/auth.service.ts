import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async login(identifier: string, pass: string) {
    const isEmail = identifier.includes('@');
    
    // Check DB for Admin user
    const admin = isEmail
      ? await this.prisma.admin.findUnique({ where: { email: identifier } })
      : await this.prisma.admin.findUnique({ where: { mobile: identifier } });

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(pass, admin.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: admin.id, name: admin.name, role: admin.role };
    return {
      adminId: admin.id,
      name: admin.name,
      accessToken: await this.jwtService.signAsync(payload),
    };
  }
}
