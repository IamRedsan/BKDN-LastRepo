import { defaultWallpaperUrl, defaultAvatarUrl } from './../../common/constant/default-varaible';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from 'src/common/schemas/user.schema';
import { UserRole } from 'src/common/enums/user-role.enum';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { File } from 'multer';
import { UpdateUserInfoRequestDto } from './dto/request/update-info-request.dto';
import { WhoamiResponseDto } from './dto/response/whoami-response.dto';
import { UpdateUserSettingRequestDto } from './dto/request/update-setting-request.dto';
import { ChangePasswordRequestDto } from './dto/request/change-password.dto';
import * as bcrypt from 'bcryptjs';
import { Socket } from 'socket.io';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async register(userData: Partial<User>): Promise<User> {
    const newUser = new this.userModel({
      ...userData,
      role: userData.role || UserRole.USER,
      followers: userData.followers || [],
      following: userData.following || [],
      followersCount: userData.followersCount || 0,
      followingCount: userData.followingCount || 0,
      requiresUsernameChange: userData.requiresUsernameChange || false,
      bio: userData.bio || '',
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

  async whoamiById(userId: string): Promise<WhoamiResponseDto> {
    const user: any = await this.userModel
      .findById(userId)
      .populate('followers', 'username name avatar')
      .populate('following', 'username name avatar')
      .lean();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const formattedFollowers = user.followers.map(({ _id, ...rest }) => rest);
    const formattedFollowing = user.following.map(({ _id, ...rest }) => rest);

    const { password, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      followers: formattedFollowers,
      following: formattedFollowing,
    };
  }

  async whoamiByUsername(username: string): Promise<WhoamiResponseDto> {
    const user: any = await this.userModel
      .findOne({ username })
      .populate('followers', 'username name avatar')
      .populate('following', 'username name avatar')
      .lean();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const formattedFollowers = user.followers.map(({ _id, ...rest }) => rest);
    const formattedFollowing = user.following.map(({ _id, ...rest }) => rest);

    const { password, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      followers: formattedFollowers,
      following: formattedFollowing,
    };
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
      throw new NotFoundException('User not found123');
    }

    return user;
  }

  async verifyEmail(userId: string): Promise<User> {
    const user = await this.findById(userId);
    user.isEmailVerified = true;
    return user.save();
  }

  async followUser(userId: string, targetUsername: string): Promise<string> {
    const user = await this.userModel.findById(userId);
    const targetUser = await this.findByUsername(targetUsername);

    if (!targetUser) {
      throw new NotFoundException('Target user not found');
    }

    const targetUserObjectId = targetUser._id as Types.ObjectId;
    const userObjectId = user._id as Types.ObjectId;

    const isFollowing = user.following.some(id => id.equals(targetUserObjectId));
    let message: string;
    if (isFollowing) {
      // Unfollow logic
      user.following = user.following.filter(id => !id.equals(targetUserObjectId));
      user.followingCount -= 1;
      targetUser.followers = targetUser.followers.filter(id => !id.equals(userObjectId));
      targetUser.followersCount -= 1;
      message = 'Unfollowed user successfully';
    } else {
      // Follow logic
      user.following.push(targetUserObjectId);
      user.followingCount += 1;
      targetUser.followers.push(userObjectId);
      targetUser.followersCount += 1;
      message = 'Followed user successfully';
    }

    await targetUser.save();
    await user.save();
    return message;
  }

  async unfollowUser(userId: string, targetUsername: string): Promise<User> {
    const user = await this.findById(userId);
    if (user.username === targetUsername) {
      throw new BadRequestException('You cannot unfollow yourself');
    }

    const targetUser = await this.findByUsername(targetUsername);

    user.following = user.following.filter(id => id.toString() !== targetUser._id.toString());
    user.followingCount -= 1;
    targetUser.followers = targetUser.followers.filter(id => id.toString() !== userId);
    targetUser.followersCount -= 1;

    await targetUser.save();
    return user.save();
  }

  async getFollowers(username: string): Promise<any[]> {
    const user: any = await this.userModel
      .findOne({ username: username })
      .populate('followers', 'username name avatar')
      .lean();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const formattedFollowers = user.followers.map(({ _id, ...rest }) => rest);
    return formattedFollowers;
  }

  async getFollowing(username: string): Promise<any[]> {
    const user: any = await this.userModel
      .findOne({ username: username })
      .populate('following', 'username name avatar')
      .lean();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const formattedFollowing = user.followers.map(({ _id, ...rest }) => rest);
    return formattedFollowing;
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

  async updateAvatar(userId: string, file: File): Promise<User> {
    const user = await this.findById(userId);
    if (user.avatar && user.avatar !== defaultAvatarUrl) {
      await this.cloudinaryService.deleteImage(user.avatar);
    }
    const uploadResult = await this.cloudinaryService.uploadImage(file);
    const updatedUser = await this.update(userId, { avatar: uploadResult.secure_url });
    return updatedUser;
  }

  async updateWallpaper(userId: string, file: File): Promise<User> {
    const user = await this.findById(userId);
    if (user.wallpaper && user.wallpaper !== defaultWallpaperUrl) {
      await this.cloudinaryService.deleteImage(user.wallpaper);
    }
    const uploadResult = await this.cloudinaryService.uploadImage(file);
    const updatedUser = await this.update(userId, { wallpaper: uploadResult.secure_url });
    return updatedUser;
  }

  // Kiểm tra username có trùng lặp không
  async isUsernameTaken(username: string, userId: string): Promise<boolean> {
    const user = await this.userModel.findOne({ username, _id: { $ne: userId } });
    return !!user; // Trả về true nếu username đã tồn tại
  }

  // Cập nhật thông tin người dùng
  async updateInfo(
    userId: string,
    updateInfoDto: UpdateUserInfoRequestDto,
  ): Promise<WhoamiResponseDto> {
    const updatedUser: User = await this.userModel.findByIdAndUpdate(
      userId,
      {
        username: updateInfoDto.username,
        name: updateInfoDto.name,
        bio: updateInfoDto.bio,
      },
      { new: true }, // Trả về tài liệu đã cập nhật
    );

    if (!updatedUser) {
      throw new BadRequestException('User not found');
    }

    // Loại bỏ các trường không cần thiết trước khi trả về
    const { password, ...userWithoutPassword } = updatedUser.toObject();
    return userWithoutPassword as WhoamiResponseDto;
  }

  async updateSetting(
    userId: string,
    updateSettingDto: UpdateUserSettingRequestDto,
  ): Promise<WhoamiResponseDto> {
    const updatedUser: User = await this.userModel.findByIdAndUpdate(
      userId,
      {
        language: updateSettingDto.language,
        theme: updateSettingDto.theme,
      },
      { new: true }, // Trả về tài liệu đã cập nhật
    );
    if (!updatedUser) {
      throw new BadRequestException('User not found');
    }
    const { password, ...userWithoutPassword } = updatedUser.toObject();
    return userWithoutPassword as WhoamiResponseDto;
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordRequestDto,
  ): Promise<boolean> {
    const { oldPassword, newPassword, rePassword } = changePasswordDto;

    if (newPassword !== rePassword) {
      throw new BadRequestException('New password and confirm password do not match');
    }

    const user = await this.userModel.findById(userId);

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new BadRequestException('Old password is incorrect');
    }
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();
    return true;
  }

  private clients = new Map<string, Set<Socket>>();

  // Lưu trữ kết nối của người dùng
  addClient(username: string, socket: Socket) {
    if (!this.clients.has(username)) {
      this.clients.set(username, new Set());
    }
    this.clients.get(username)?.add(socket);
  }

  // Xóa kết nối của người dùng
  removeClient(username: string, socket: Socket) {
    this.clients.get(username)?.delete(socket);
  }

  // Lấy tất cả các client đang kết nối của người dùng
  getClientsForUser(username: string): Socket[] {
    return Array.from(this.clients.get(username) || []);
  }
}
