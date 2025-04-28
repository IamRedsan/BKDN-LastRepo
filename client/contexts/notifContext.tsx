import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { io } from 'socket.io-client'; // Thay thế SockJS bằng socket.io-client
import {
  NotificationContentEnum,
  NotificationTypeEnum,
} from '@/enums/notification.enum';
import { useUserContext } from './userContext';
import { client } from '@/shared/axiosClient';

interface Notification {
  _id: string;
  sender: {
    username: string;
    avatar: string;
    name: string;
  };
  isRead: boolean;
  type: NotificationTypeEnum;
  content: NotificationContentEnum;
  threadId?: string;
  createdAt: string;
  updatedAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  loading: boolean;
  notReadCount: number;
  readNotification: (index: number) => void;
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { user } = useUserContext();
  const [notReadCount, setNotReadCount] = useState<number>(0);

  const readNotification = (index: number) => {
    setNotReadCount((prev) => prev - 1);
    setNotifications((prev) =>
      prev.map((notification, i) => {
        if (index !== i) {
          return notification;
        }

        return {
          ...notification,
          notRead: false,
        };
      })
    );
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    const getNotifications = async () => {
      setLoading(true);
      try {
        const response = await client.get('/notification');
        const notifications: Notification[] = response.data.data;
        setNotifications(notifications.reverse());
      } catch {
        console.error("What 's up?");
      }
      setLoading(false);
    };

    getNotifications();
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const socket = io(`${process.env.NEXT_PUBLIC_SERVER_URL}`); // Sử dụng socket.io

    socket.emit('register', user.username); // Gửi đăng ký socket với userId

    socket.on('new_notification', (notification: Notification) => {
      setNotReadCount((prev) => prev + 1);
      setNotifications((prev) => [{ ...notification, notRead: true }, ...prev]);
    });

    return () => {
      socket.disconnect(); // Đảm bảo tắt kết nối khi component unmount
    };
  }, [user]);

  return (
    <NotificationContext.Provider
      value={{ notifications, loading, notReadCount, readNotification }}
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
