import { Controller, Get, Param, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { Request } from 'express';
import { ProfileResponseDto } from './dto/profile-response.dto';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':username')
  @HttpCode(HttpStatus.OK)
  async getUserProfile(
    @Param('username') username: string,
    @Req() req: Request,
  ): Promise<ProfileResponseDto> {
    const currentUsername = req.user.username; // ID của người dùng hiện tại
    return this.profileService.getUserProfile(username, currentUsername);
  }
}
