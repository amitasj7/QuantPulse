import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('admin')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() body: any) {
    if (!body.identifier || !body.password) {
      return {
        status: 'error',
        message: 'Identifier and password are required',
      };
    }

    try {
      const authData = await this.authService.login(body.identifier, body.password);
      return {
        status: 'success',
        message: 'Admin authenticated successfully',
        data: authData,
      };
    } catch (e: any) {
      return {
        status: 'error',
        message: e.message || 'Invalid credentials',
        code: 'AUTH_FAILED',
      };
    }
  }
}
