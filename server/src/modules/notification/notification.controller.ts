import { Controller, Get, Post, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationContentEnum, NotificationTypeEnum } from 'src/common/enums/notification.enum';
import { Request } from 'express';
import { NotificationResponseDto } from './dto/notification.response';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('test-emit')
  async testEmitNotification() {
    const testNotification = {
      senderUsername: 'truongvv', // Sender ID
      receiverUsername: 'iamredsannn', // Receiver ID
      type: NotificationTypeEnum.LIKE, // Example notification type
      content: NotificationContentEnum.LIKE, // Example notification content
    };

    // Soan content cho notification

    await this.notificationService.createNotification(testNotification);

    return { message: 'Notification emitted successfully' };
  }

  @Get('/')
  async getNotification(@Req() req: Request): Promise<NotificationResponseDto[]> {
    const userId = req.user._id; // Assuming you have user ID in the request object
    console.log('userId', userId);
    return await this.notificationService.getNotifications(userId);
  }
}
