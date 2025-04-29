import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { NotificationService } from '../notification/notification.service';
import { FollowTriggleResponseDto } from './dto/response/follow-triggle-response.dto';
import { Types } from 'mongoose';
import { UnfollowFollowersResponseDto } from './dto/response/unfollow-followers-response.dto';

@Injectable()
export class ActionService {
  constructor(
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
  ) {}
  async followUser(userId: string, targetUsername: string): Promise<FollowTriggleResponseDto> {
    const user = await this.userService.findByIdWithPopulate(userId);
    const targetUser = await this.userService.findByUsername(targetUsername);
    if (!targetUser) {
      throw new NotFoundException('Target user not found');
    }

    const isFollowing = user.following.some((following: any) =>
      following._id.equals(targetUser._id.toString()),
    );
    if (isFollowing) {
      // Unfollow logic
      user.following = user.following.filter(
        (followedUser: any) => followedUser._id.toString() !== targetUser._id.toString(),
      );
      user.followingCount = Math.max(0, user.followingCount - 1);

      targetUser.followers = targetUser.followers.filter(
        (follower: any) => follower._id.toString() !== user._id.toString(),
      );
      targetUser.followersCount = Math.max(0, targetUser.followersCount - 1);
    } else {
      // Follow logic
      if (!user.following.some((followedUser: any) => followedUser._id.equals(targetUser._id))) {
        user.following.push(targetUser._id as Types.ObjectId);
        user.followingCount += 1;
      }

      if (!targetUser.followers.some((follower: any) => follower._id.equals(user._id))) {
        targetUser.followers.push(user._id as Types.ObjectId);
        targetUser.followersCount += 1;
      }

      // Gửi thông báo follow
      this.notificationService.generateNotificationFollow(userId, targetUser._id.toString());
    }
    await targetUser.save();
    await user.save();

    const updatedUser = await this.userService.findByIdWithPopulate(userId);
    const formattedFollowing = updatedUser.following.map((following: any) => ({
      username: following.username,
      name: following.name,
      avatar: following.avatar,
    }));
    return {
      following: formattedFollowing,
      followingCount: user.followingCount,
    };
  }

  async unfollowUser(
    userId: string,
    targetUsername: string,
  ): Promise<UnfollowFollowersResponseDto> {
    const user: any = await this.userService.findByIdWithPopulate(userId);
    if (user.username === targetUsername) {
      throw new BadRequestException('You cannot unfollow yourself');
    }
    const targetUser = await this.userService.findByUsername(targetUsername);

    user.followers = user.followers.filter(
      (followerUser: any) => followerUser._id.toString() !== targetUser._id.toString(),
    );
    user.followersCount = Math.max(0, user.followersCount - 1);
    targetUser.following = targetUser.following.filter(
      _id => _id.toString() !== user._id.toString(),
    );
    targetUser.followingCount = Math.max(0, targetUser.followingCount - 1);

    await user.save();
    await targetUser.save();
    return {
      followers: user.followers.map((follower: any) => ({
        username: follower.username,
        name: follower.name,
        avatar: follower.avatar,
      })),
      followersCount: targetUser.followersCount,
    };
  }
}
