import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ThreadService } from '../thread/thread.service';
import { UserRole } from '../../common/enums/user-role.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('admin')
@UseGuards(RolesGuard)
export class AdminController {
  constructor(
    private readonly userService: UserService,
    private readonly threadService: ThreadService,
  ) {}

  @Get('users')
  @Roles(UserRole.ADMIN)
  async listUsers() {
    return this.userService.findAllUsers();
  }

  // @Post('users/ban/:userId')
  // @HttpCode(HttpStatus.OK)
  // @Roles(UserRole.ADMIN)
  // async banUser(@Param('userId') userId: string, @Body('ban') ban: boolean) {
  //   return this.userService.banUser(userId, ban);
  // }

  @Get('threads/reported')
  @Roles(UserRole.ADMIN)
  async listReportedThreads(@Query('minReports') minReports: number = 1) {
    return this.threadService.findReportedThreads(minReports);
  }

  // @Post('threads/approve/:threadId')
  // @HttpCode(HttpStatus.OK)
  // @Roles(UserRole.ADMIN)
  // async approveThread(@Param('threadId') threadId: string) {
  //   return this.threadService.approveThread(threadId);
  // }

  // @Post('threads/ban/:threadId')
  // @HttpCode(HttpStatus.OK)
  // @Roles(UserRole.ADMIN)
  // async banThread(@Param('threadId') threadId: string) {
  //   return this.threadService.banThreadAndUser(threadId);
  // }
}
