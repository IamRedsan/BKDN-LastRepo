import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification } from 'src/common/schemas/notification.schema';
import { NotificationGateway } from './notification.gateway';
import { NotificationContentEnum, NotificationTypeEnum } from 'src/common/enums/notification.enum';
import { UserService } from '../user/user.service';
import { NotificationResponseDto } from './dto/notification.response';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
    private notificationGateway: NotificationGateway,
    private readonly userService: UserService, // Assuming you have a UserService to get user details
  ) {}

  async createNotification(data: {
    senderUsername: string;
    receiverUsername: string;
    type: NotificationTypeEnum;
    threadId?: string;
    threadContent?: string;
    content: NotificationContentEnum;
  }) {
    const sender = await this.userService.findByUsername(data.senderUsername);
    const receiver = await this.userService.findByUsername(data.receiverUsername);

    const notification: any = new this.notificationModel({
      senderId: sender._id,
      receiverId: receiver._id,
      isRead: false,
      type: data.type,
      thread: {
        _id: data.threadId,
        content: data.threadContent,
      },
      content: data.content,
    });

    await notification.save();

    // Gửi thông báo qua socket
    this.notificationGateway.sendNotification(data.receiverUsername, {
      _id: notification._id.toString(),
      sender: {
        username: sender.username,
        avatar: sender.avatar,
        name: sender.name,
      },
      ...notification.toObject(),
    });
  }

  async getNotifications(
    userId: string,
    page: number = 1,
    limit: number = 10,
    skip: number = 0, // Thêm tham số skip
  ): Promise<NotificationResponseDto[]> {
    const calculatedSkip: number = skip + (page - 1) * limit; // Tính toán số lượng cần bỏ qua
    console.log('calculatedSkip', calculatedSkip);

    const rawNotifications: any = await this.notificationModel
      .find({ receiverId: new Types.ObjectId(userId) })
      .populate({
        path: 'senderId',
        select: 'username name avatar',
      })
      .populate({
        path: 'thread',
        select: '_id content',
      })
      .sort({ createdAt: -1 })
      .skip(calculatedSkip) // Áp dụng skip
      .limit(limit)
      .lean();

    console.log('rawNotifications', rawNotifications);

    return rawNotifications.map(notification => {
      const sender = notification.senderId as {
        _id: string;
        username: string;
        avatar: string;
        name: string;
      };
      const { _id, ...senderWithoutId } = sender;
      return {
        _id: notification._id.toString(),
        sender: senderWithoutId,
        isRead: notification.isRead,
        type: notification.type,
        content: notification.content,
        thread: notification.thread,
        createdAt: notification.createdAt,
        updatedAt: notification.updatedAt,
      };
    });
  }
}
