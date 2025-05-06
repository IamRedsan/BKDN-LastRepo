import {
  NotificationContentEnum,
  NotificationTypeEnum,
} from '@/enums/notification.enum';

export interface INotification {
  _id: string;
  sender: {
    username: string;
    name: string;
    avatar: string;
  };
  isRead: boolean;
  type: NotificationTypeEnum;
  content: NotificationContentEnum;
  thread: {
    _id: string;
    content: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
}
