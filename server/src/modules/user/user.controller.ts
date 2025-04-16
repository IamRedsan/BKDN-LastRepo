import {
  Controller,
  Get,
  Post,
  UseInterceptors,
  UploadedFile,
  Req,
  HttpCode,
  HttpStatus,
  Patch,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { Request } from 'express';
import { WhoamiResponseDto } from './dto/response/whoami-response.dto';
import { File } from 'multer';
import { UpdateUserInfoRequestDto } from './dto/request/update-info-request.dto';
import { UpdateUserSettingRequestDto } from './dto/request/update-setting-request.dto';
import { ChangePasswordRequestDto } from './dto/request/change-password.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('whoami')
  getProfile(@Req() req: Request): WhoamiResponseDto {
    const user = req.user;
    delete user._id;
    delete user.googleId;
    return user;
  }

  @Patch('avatar')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('avatar'))
  async updateAvatar(@UploadedFile() file: File, @Req() req: Request) {
    const userId = req.user._id;
    const updatedUser = await this.userService.updateAvatar(userId, file);
    return updatedUser;
  }

  @Patch('wallpaper')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('wallpaper'))
  async updateWallpaper(@UploadedFile() file: File, @Req() req: Request) {
    const userId = req.user._id;
    const updatedUser = await this.userService.updateWallpaper(userId, file);
    return updatedUser;
  }

  @Patch('info')
  @HttpCode(HttpStatus.OK)
  async updateInfo(
    @Req() req: Request,
    @Body() updateInfoDto: UpdateUserInfoRequestDto,
  ): Promise<WhoamiResponseDto> {
    const userId = req.user._id.toString();

    const isUsernameTaken = await this.userService.isUsernameTaken(updateInfoDto.username, userId);
    if (isUsernameTaken) {
      throw new BadRequestException('Username is already taken');
    }

    const updatedUser = await this.userService.updateInfo(userId, updateInfoDto);

    return updatedUser;
  }

  @Patch('setting')
  @HttpCode(HttpStatus.OK)
  async updateSetting(
    @Req() req: Request,
    @Body() updateSettingDto: UpdateUserSettingRequestDto,
  ): Promise<WhoamiResponseDto> {
    const userId = req.user._id.toString();
    const updatedUser = await this.userService.updateSetting(userId, updateSettingDto);
    return updatedUser;
  }

  @Patch('password')
  @HttpCode(HttpStatus.OK)
  async updatePassword(
    @Req() req: Request,
    @Body() changePasswordDto: ChangePasswordRequestDto,
  ): Promise<boolean> {
    const userId = req.user._id.toString();
    const updatedUser = await this.userService.changePassword(userId, changePasswordDto);
    return updatedUser;
  }
}
