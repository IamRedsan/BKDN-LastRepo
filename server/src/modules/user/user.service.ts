import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from 'src/common/schemas/user.schema';
import { UserRole } from 'src/common/enums/user-role.enum';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async register(userData: Partial<User>): Promise<User> {
    const newUser = new this.userModel({
      ...userData,
      role: userData.role || UserRole.USER,
      followers: userData.followers || [],
      following: userData.following || [],
      followersCount: userData.followersCount || 0,
      followingCount: userData.followingCount || 0,
      requiresUsernameChange: userData.requiresUsernameChange || false,
      isBanned: userData.isBanned || false,
    });
    return newUser.save();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({ username });
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).lean();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
  async update(id: string, userData: Partial<User>): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(id, userData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async verifyEmail(userId: string): Promise<User> {
    const user = await this.findById(userId);
    user.isEmailVerified = true;
    return user.save();
  }

  async followUser(userId: string, targetUserId: string): Promise<User> {
    const user = await this.findById(userId);
    const targetUser = await this.findById(targetUserId);

    const targetUserObjectId = targetUser._id as Types.ObjectId;
    const userObjectId = user._id as Types.ObjectId;

    if (!user.following.some(id => id.equals(targetUserObjectId))) {
      user.following.push(targetUserObjectId);
      user.followingCount += 1;
      targetUser.followers.push(userObjectId);
      targetUser.followersCount += 1;

      await targetUser.save();
      return user.save();
    }

    return user;
  }

  async unfollowUser(userId: string, targetUserId: string): Promise<User> {
    const user = await this.findById(userId);
    const targetUser = await this.findById(targetUserId);

    user.following = user.following.filter(id => id.toString() !== targetUserId);
    user.followingCount -= 1;
    targetUser.followers = targetUser.followers.filter(id => id.toString() !== userId);
    targetUser.followersCount -= 1;

    await targetUser.save();
    return user.save();
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = new this.userModel(userData);
    return user.save();
  }

  async delete(id: string): Promise<User> {
    const user = await this.findById(id);
    return user.deleteOne();
  }

  async updateRole(id: string, role: UserRole): Promise<User> {
    const user = await this.findById(id);
    user.role = role;
    return user.save();
  }

  async updateProfile(id: string, profileData: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    Object.assign(user, profileData);
    return user.save();
  }

  async updatePassword(id: string, hashedPassword: string): Promise<User> {
    const user = await this.findById(id);
    user.password = hashedPassword;
    return user.save();
  }
}
