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
import { User } from 'src/common/schemas/user.schema';
import { ThreadResponseDto } from '../thread/dto/thread-response.dto';

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

  @Post('users/ban/:username')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN)
  async banUser(@Param('username') username: string) {
    return this.userService.banUser(username);
  }

  @Get('threads/reported')
  @Roles(UserRole.ADMIN)
  async listReportedThreads(@Query('minReports') minReports: number = 1) {
    return this.threadService.findReportedThreads(minReports);
  }

  @Post('threads/approve/:threadId')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN)
  async approveThread(@Param('threadId') threadId: string): Promise<ThreadResponseDto> {
    return this.threadService.approveThread(threadId);
  }

  @Post('threads/ban/:threadId')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN)
  async banThread(@Param('threadId') threadId: string): Promise<ThreadResponseDto> {
    return this.threadService.banThreadAndUser(threadId);
  }
}
