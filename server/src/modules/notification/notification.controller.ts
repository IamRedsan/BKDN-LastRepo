import { Controller, Get, Post, Query, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationContentEnum, NotificationTypeEnum } from 'src/common/enums/notification.enum';
import { Request } from 'express';
import { NotificationResponseDto } from './dto/notification.response';

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
}
