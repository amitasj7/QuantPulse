import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // No roles defined, meaning it's open to all authenticated users
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.role) {
      return false; // User not authenticated or has no role
    }

    return requiredRoles.some((role) => user.role === role);
  }
}
