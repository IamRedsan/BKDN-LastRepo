import { Controller, Get, UseGuards, Query } from '@nestjs/common';
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

  @Get('threads/reported')
  @Roles(UserRole.ADMIN)
  async listReportedThreads(@Query('minReports') minReports: number = 1) {
    return this.threadService.findReportedThreads(minReports);
  }
}
