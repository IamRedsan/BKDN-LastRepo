import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification } from 'src/common/schemas/notification.schema';
import { NotificationGateway } from './notification.gateway';
import { NotificationContentEnum, NotificationTypeEnum } from 'src/common/enums/notification.enum';
import { UserService } from '../user/user.service';
import { NotificationResponseDto } from './dto/response/notification.response';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
    private notificationGateway: NotificationGateway,
    private readonly userService: UserService,
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
    skip: number = 0,
  ): Promise<NotificationResponseDto[]> {
    const calculatedSkip: number = skip + (page - 1) * limit;
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
      .sort({ updatedAt: -1 })
      .skip(calculatedSkip)
      .limit(limit)
      .lean();

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

  async markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
    const notification = await this.notificationModel.findOne({
      _id: new Types.ObjectId(notificationId),
      receiverId: new Types.ObjectId(userId),
    });

    if (!notification) {
      throw new Error('Notification not found or does not belong to the user');
    }

    notification.isRead = true;
    await notification.save();
  }

  async markNotificationsAsRead(notifIds: string[], userId: string): Promise<void> {
    const notifications = await this.notificationModel.updateMany(
      {
        _id: { $in: notifIds.map(id => new Types.ObjectId(id)) },
        receiverId: new Types.ObjectId(userId),
      },
      { $set: { isRead: true } },
    );

    if (notifications.matchedCount === 0) {
      throw new Error('No notifications found or they do not belong to the user');
    }
  }
}
