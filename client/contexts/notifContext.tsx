import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { io } from 'socket.io-client';
import { useUserContext } from './userContext';
import { client } from '@/shared/axiosClient';
import { INotification } from '@/interfaces/notification';
import { NOTIFICATION_PAGE_LIMIT } from '@/constants/notification-page-limit';
import {
  useMarkNotificationAsRead,
  useMarkNotificationsAsRead,
} from '@/hooks/api/use-notif';

interface NotificationContextType {
  notifications: INotification[];
  loading: boolean;
  notReadCount: number;
  readNotification: (index: number) => void;
  readAllNotifications: () => void;
  loadMoreNotifications: () => Promise<void>;
  hasMore: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { user } = useUserContext();
  const [notReadCount, setNotReadCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(NOTIFICATION_PAGE_LIMIT); // Số lượng thông báo mỗi lần tải
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [skip, setSkip] = useState<number>(0);
  const { mutate: markNotificationAsRead } = useMarkNotificationAsRead();
  const { mutate: markNotificationsAsRead } = useMarkNotificationsAsRead();

  const readNotification = (index: number) => {
    markNotificationAsRead(notifications[index]._id, {
      onSuccess: () => {
        setNotReadCount((prev) => prev - 1);
        setNotifications((prev) =>
          prev.map((notification, i) => {
            if (index !== i) {
              return notification;
            }

            return {
              ...notification,
              isRead: true,
            };
          })
        );
      },
      onError: () => {
        console.error('Failed to mark notification as read');
      },
    });
  };

  const readAllNotifications = () => {
    const notifIds: string[] = notifications
      .filter((n) => !n.isRead)
      .map((n) => n._id);
    if (notifIds.length === 0) {
      return; // Không có thông báo nào chưa đọc
    }
    markNotificationsAsRead(notifIds, {
      onSuccess: () => {
        setNotReadCount(0);
        setNotifications((prev) =>
          prev.map((notification) => ({
            ...notification,
            isRead: true,
          }))
        );
      },
      onError: () => {
        console.error('Failed to mark all notifications as read');
      },
    });
  };

  const loadMoreNotifications = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await client.get(
        `/notification?page=${page}&limit=${limit}&skip=${skip}`
      );
      const newNotifications = response.data as INotification[];
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Giả lập thời gian tải
      if (!newNotifications || newNotifications.length === 0) {
        setHasMore(false); // Không còn thông báo để tải
      } else {
        if (newNotifications.length < limit) {
          setHasMore(false); // Nếu số lượng thông báo tải về ít hơn limit, không còn thông báo để tải
        }
        setNotifications((prev) => [...prev, ...newNotifications]);
        setPage((prev) => prev + 1); // Tăng số trang
      }
    } catch (error) {
      console.error('Failed to load more notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    const getInitialNotifications = async () => {
      setLoading(true);
      try {
        const response = await client.get(
          `/notification?page=1&limit=${limit}&skip=${skip}`
        );
        const initialNotifications = response.data as INotification[];

        setNotifications(initialNotifications);
        setHasMore(initialNotifications.length === limit); // Nếu số lượng trả về ít hơn `limit`, không còn thông báo để tải
        setPage(2); // Bắt đầu từ trang 2 cho lần tải tiếp theo
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialNotifications();
  }, [user, limit]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const socket = io(`${process.env.NEXT_PUBLIC_SERVER_URL}`);

    socket.emit('register', user.username);
    socket.on('new_notification', (notification: INotification) => {
      console.log('New notification received:', notification);
      setNotifications((prev) => {
        const existingIndex = prev.findIndex((n) => n._id === notification._id);

        if (existingIndex !== -1) {
          const updatedNotifications = [...prev];
          updatedNotifications[existingIndex] = { ...notification };
          return updatedNotifications;
        }

        return [{ ...notification }, ...prev];
      });

      if (!notification.isRead) {
        setNotReadCount((prev) => prev + 1);
      }

      setSkip((prev) => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    setNotReadCount(unreadCount);
  }, [notifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        loading,
        notReadCount,
        readNotification,
        readAllNotifications,
        loadMoreNotifications,
        hasMore,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotification must be used within a NotificationProvider'
    );
  }
  return context;
};
