import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { WhoamiResponseDto } from './dto/response/whoami-response.dto';

@Controller('user')
export class UserController {
  @Get('whoami')
  getProfile(@Req() req: Request): WhoamiResponseDto {
    const user = { ...req.user };
    delete user._id;
    delete user.googleId;
    console.log(user);
    return user;
  }
}
