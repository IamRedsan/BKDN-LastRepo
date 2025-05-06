import { forwardRef, Inject, Injectable } from '@nestjs/common';
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

  async generateNotificationLike(senderId: string, receiverId: string, threadId: string) {
    await this.generateNotification(
      senderId,
      receiverId,
      threadId,
      NotificationTypeEnum.LIKE,
      NotificationContentEnum.LIKE,
    );
  }

  async generateNotificationRethread(senderId: string, receiverId: string, threadId: string) {
    await this.generateNotification(
      senderId,
      receiverId,
      threadId,
      NotificationTypeEnum.REPOST,
      NotificationContentEnum.REPOST,
    );
  }

  async generateNotificationFollow(senderId: string, receiverId: string) {
    const sender = await this.userService.findById(senderId);
    const receiver = await this.userService.findById(receiverId);
    if (!sender || !receiver) {
      throw new Error('Sender or receiver not found');
    }
    const notification: any = await this.notificationModel.findOne({
      senderId: new Types.ObjectId(senderId),
      receiverId: new Types.ObjectId(receiverId),
      type: NotificationTypeEnum.FOLLOW,
    });
    if (notification) {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      if (notification.updatedAt < twoHoursAgo) {
        notification.set('updatedAt', new Date());
        notification.set('isRead', false);
        await notification.save();
        const { receiverId, senderId, ...notificationWithoutId } = notification.toObject();

        this.notificationGateway.sendNotification(receiver.username, {
          _id: notification._id.toString(),
          sender: {
            username: sender.username,
            avatar: sender.avatar,
            name: sender.name,
          },
          ...notificationWithoutId,
        });
      }
    } else {
      await this.createNotification({
        senderUsername: sender.username,
        receiverUsername: receiver.username,
        type: NotificationTypeEnum.FOLLOW,
        content: NotificationContentEnum.FOLLOW,
      });
    }
  }

  private async generateNotification(
    senderId: string,
    receiverId: string,
    threadId: string,
    type: NotificationTypeEnum,
    content: NotificationContentEnum,
  ) {
    if (senderId === receiverId) {
      return;
    }
    const notification: any = await this.notificationModel.findOne({
      receiverId: new Types.ObjectId(receiverId),
      thread: new Types.ObjectId(threadId),
      type: type,
    });
    const sender = await this.userService.findById(senderId);
    const receiver = await this.userService.findById(receiverId);
    if (notification) {
      const senderExists = notification.senderIds.some(id => id.toString() === senderId);

      // Cập nhật senderId thành người tương tác mới nhất
      notification.senderId = new Types.ObjectId(senderId);

      if (!senderExists) {
        // Nếu senderId chưa tồn tại trong senderIds, thêm vào
        notification.senderIds.push(new Types.ObjectId(senderId));
      }

      notification.isRead = false; // Đánh dấu thông báo là chưa đọc
      notification.set('updatedAt', new Date());
      if (type === NotificationTypeEnum.LIKE) {
        notification.content = NotificationContentEnum.LIKES;
      } else if (type === NotificationTypeEnum.REPOST) {
        notification.content = NotificationContentEnum.REPOSTS;
      }
      await notification.save();

      // Lấy thông tin người gửi
      const sender = await this.userService.findById(senderId);
      const {
        receiverId: filter1,
        senderId: filter2,
        thread: filter3,
        ...formattedNotification
      } = notification.toObject();
      // Gửi thông báo qua WebSocket
      this.notificationGateway.sendNotification(receiver.username, {
        _id: notification._id.toString(),
        sender: {
          username: sender.username,
          avatar: sender.avatar,
          name: sender.name,
        },
        thread: {
          _id: threadId,
          content: null,
        },
        ...formattedNotification,
      });
    } else {
      // Nếu thông báo chưa tồn tại, tạo mới

      const newNotification: any = new this.notificationModel({
        receiverId: new Types.ObjectId(receiverId),
        thread: new Types.ObjectId(threadId),
        senderId: new Types.ObjectId(senderId), // Người tương tác mới nhất
        senderIds: [new Types.ObjectId(senderId)], // Danh sách người đã tương tác
        type: type,
        content: content,
        isRead: false,
      });

      await newNotification.save();
      const {
        receiverId: filter1,
        senderId: filter2,
        thread: filter3,
        ...formattedNotification
      } = newNotification.toObject();
      this.notificationGateway.sendNotification(receiver.username, {
        _id: newNotification._id.toString(),
        sender: {
          username: sender.username,
          avatar: sender.avatar,
          name: sender.name,
        },
        thread: {
          _id: threadId,
          content: null,
        },
        ...formattedNotification,
      });
    }
  }

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
    const { receiverId, senderId, ...notificationWithoutId } = notification.toObject();
    this.notificationGateway.sendNotification(data.receiverUsername, {
      _id: notification._id.toString(),
      sender: {
        username: sender.username,
        avatar: sender.avatar,
        name: sender.name,
      },
      ...notificationWithoutId,
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
