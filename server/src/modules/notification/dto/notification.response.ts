import { NotificationContentEnum, NotificationTypeEnum } from 'src/common/enums/notification.enum';

export class NotificationResponseDto {
  _id: string;
  threadId?: string | null;
  sender: {
    name: string;
    username: string;
    avatar: string;
  };
  type: NotificationTypeEnum;
  content: NotificationContentEnum;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}
