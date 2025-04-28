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
    content: NotificationContentEnum;
  }) {
    const sender = await this.userService.findByUsername(data.senderUsername);
    const receiver = await this.userService.findByUsername(data.receiverUsername);

    const notification: any = new this.notificationModel({
      senderId: sender._id,
      receiverId: receiver._id,
      isRead: false,
      type: data.type,
      threadId: data.threadId,
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

  async getNotifications(userId: string): Promise<NotificationResponseDto[]> {
    let notifications: NotificationResponseDto[] = [];
    const rawNotifications: any = await this.notificationModel
      .find({ receiverId: new Types.ObjectId(userId) })
      .populate({
        path: 'senderId',
        select: 'username name avatar',
      })
      .sort({ createdAt: -1 })
      .lean();

    notifications = rawNotifications.map(notification => {
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
        threadId: notification.threadId,
        createdAt: notification.createdAt,
        updatedAt: notification.updatedAt,
      };
    });

    return notifications;
  }
}
