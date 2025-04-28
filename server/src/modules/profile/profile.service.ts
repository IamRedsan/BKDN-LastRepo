import { Injectable, NotFoundException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ThreadService } from '../thread/thread.service';
import { ProfileResponseDto } from './dto/profile-response.dto';

@Injectable()
export class ProfileService {
  constructor(
    private readonly userService: UserService,
    private readonly threadService: ThreadService,
  ) {}

  async getUserProfile(username: string, currentUsername: string): Promise<ProfileResponseDto> {
    // Tìm user theo username
    const user = await this.userService.whoamiByUsername(username);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // Sử dụng ThreadService để lấy threads và reThreads
    const { threads, reThreads } = await this.threadService.getThreadsByUsername(
      username,
      currentUsername,
    );

    return {
      user,
      threads,
      reThreads,
    };
  }
}
