import { Injectable, Logger, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../modules/user/user.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies['accessToken'];
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = this.jwtService.verify(token);
      const { userId } = payload;
      // Lấy thông tin user từ database
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Loại bỏ password trước khi gán vào request
      const { password, ...userWithoutPassword } = user;
      req['user'] = userWithoutPassword;

      next();
    } catch (e) {
      Logger.error(e);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
