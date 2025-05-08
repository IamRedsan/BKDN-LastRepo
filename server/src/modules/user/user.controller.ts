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
  Param,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { Request } from 'express';
import { WhoamiResponseDto } from './dto/response/whoami-response.dto';
import { File } from 'multer';
import { UpdateUserInfoRequestDto } from './dto/request/update-info-request.dto';
import { UpdateUserSettingRequestDto } from './dto/request/update-setting-request.dto';
import { ChangePasswordRequestDto } from './dto/request/change-password.dto';
import { FollowTriggleResponseDto } from '../action/dto/response/follow-triggle-response.dto';
import { SimpleUserInfoResponseDto } from './dto/response/simple-user-info-response.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('whoami')
  async getProfile(@Req() req: Request): Promise<WhoamiResponseDto> {
    const userId = req.user._id.toString();
    const user = await this.userService.whoamiById(userId);
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

  @Get('followers/:username')
  @HttpCode(HttpStatus.OK)
  async getFollowers(@Param('username') targetUsername: string): Promise<any[]> {
    return await this.userService.getFollowers(targetUsername);
  }

  @Get('following/:username')
  @HttpCode(HttpStatus.OK)
  async getFollowing(@Param('username') targetUsername: string): Promise<any[]> {
    return await this.userService.getFollowing(targetUsername);
  }

  @Get('/search')
  @HttpCode(HttpStatus.OK)
  async searchUsers(
    @Req() req: Request,
    @Query('query') query: string,
  ): Promise<SimpleUserInfoResponseDto[]> {
    const curentUserId = req.user._id; // Lấy username của người tìm kiếm
    return this.userService.searchUsers(query, curentUserId);
  }
}
