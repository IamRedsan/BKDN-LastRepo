import { ActionService } from './action.service';
import { Controller, HttpCode, HttpStatus, Param, Post, Req } from '@nestjs/common';
import { FollowTriggleResponseDto } from './dto/response/follow-triggle-response.dto';
import { Request } from 'express';
import { UnfollowFollowersResponseDto } from './dto/response/unfollow-followers-response.dto';
import { ThreadResponseDto } from '../thread/dto/thread-response.dto';

@Controller('action')
export class ActionController {
  constructor(private readonly actionService: ActionService) {}

  @Post('follow/:username')
  @HttpCode(HttpStatus.OK)
  async followUser(
    @Req() req: Request,
    @Param('username') targetUsername: string,
  ): Promise<FollowTriggleResponseDto> {
    const userId = req.user._id.toString();
    const response = await this.actionService.followUser(userId, targetUsername);
    return response;
  }

  @Post('unfollow/:username')
  @HttpCode(HttpStatus.OK)
  async unfollowUser(
    @Req() req: Request,
    @Param('username') targetUsername: string,
  ): Promise<UnfollowFollowersResponseDto> {
    const userId = req.user._id.toString();
    const response = await this.actionService.unfollowUser(userId, targetUsername);
    return response;
  }

  @Post('like/:threadId')
  @HttpCode(HttpStatus.OK)
  async likeThread(
    @Req() req: Request,
    @Param('threadId') threadId: string,
  ): Promise<ThreadResponseDto> {
    const userId = req.user._id.toString();
    return await this.actionService.likeThread(userId, threadId);
  }

  @Post('rethread/:threadId')
  @HttpCode(HttpStatus.OK)
  async rethread(
    @Req() req: Request,
    @Param('threadId') threadId: string,
  ): Promise<ThreadResponseDto> {
    const userId = req.user._id.toString();
    return await this.actionService.rethread(userId, threadId);
  }
}
