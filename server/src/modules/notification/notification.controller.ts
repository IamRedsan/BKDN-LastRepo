import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationContentEnum, NotificationTypeEnum } from 'src/common/enums/notification.enum';
import { Request } from 'express';
import { NotificationResponseDto } from './dto/response/notification.response';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('test-emit')
  async testEmitNotification(@Req() req: Request) {
    const senderUsername = req.user.username; // Assuming you have sender's username in the request object
    const testNotification = {
      senderUsername: senderUsername, // Sender ID
      receiverUsername: 'truongvnlab', // Receiver ID
      type: NotificationTypeEnum.LIKE, // Example notification type
      content: NotificationContentEnum.LIKE, // Example notification content
      threadId: '680b38b8bbd542ac8cc91f10', // Example thread IDc
      // threadContent: 'Mình chào bạn ạ', // Example thread content
    };

    // Soan content cho notification

    await this.notificationService.createNotification(testNotification);

    return { message: 'Notification emitted successfully' };
  }

  @Get('/')
  async getNotifications(
    @Req() req: Request,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('skip') skip: string = '0', // Nhận giá trị dưới dạng string
  ): Promise<NotificationResponseDto[]> {
    const userId = req.user._id;

    // Chuyển đổi sang số
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skipNumber = parseInt(skip, 10);

    return await this.notificationService.getNotifications(
      userId,
      pageNumber,
      limitNumber,
      skipNumber,
    );
  }

  @Post(':id')
  async markNotificationAsRead(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    const userId = req.user._id;
    await this.notificationService.markNotificationAsRead(id, userId);
    return { message: 'Notification marked as read' };
  }

  @Post('/')
  async markNotificationsAsRead(
    @Req() req: Request,
    @Body() notifIds: string[],
  ): Promise<{ message: string }> {
    const userId = req.user._id;
    if (!notifIds || notifIds.length === 0) {
      return { message: 'No notifications to mark as read' };
    }
    await this.notificationService.markNotificationsAsRead(notifIds, userId);
    return { message: 'Notifications marked as read' };
  }
}
