"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Repeat, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from "@/components/layouts/main-layout";
import { useLanguage } from "@/components/language-provider";

// Mock notifications data
const MOCK_NOTIFICATIONS = [
  {
    id: "n1",
    type: "like",
    user: {
      id: "user2",
      name: "John Doe",
      username: "johndoe",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    post: {
      id: "1",
      content:
        "Just launched my new website! Check it out and let me know what you think.",
    },
    createdAt: "2023-05-15T11:30:00Z",
    isRead: false,
  },
  {
    id: "n2",
    type: "comment",
    user: {
      id: "user3",
      name: "Alex Johnson",
      username: "alexj",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    post: {
      id: "1",
      content:
        "Just launched my new website! Check it out and let me know what you think.",
    },
    comment: "This is amazing! Congrats on the launch.",
    createdAt: "2023-05-15T12:15:00Z",
    isRead: true,
  },
  {
    id: "n3",
    type: "repost",
    user: {
      id: "user4",
      name: "Sarah Williams",
      username: "sarahw",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    post: {
      id: "2",
      content:
        "Working on a new project using Next.js and Tailwind CSS. The developer experience is amazing!",
    },
    createdAt: "2023-05-14T16:30:00Z",
    isRead: false,
  },
  {
    id: "n4",
    type: "violation",
    post: {
      id: "3",
      content:
        "This post contains content that violates our community guidelines.",
    },
    createdAt: "2023-05-13T10:00:00Z",
    isRead: false,
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const { t } = useLanguage();

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        isRead: true,
      }))
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="h-5 w-5 text-red-500" />;
      case "comment":
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case "repost":
        return <Repeat className="h-5 w-5 text-green-500" />;
      case "violation":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getNotificationText = (notification: any) => {
    switch (notification.type) {
      case "like":
        return (
          <>
            <Link
              href={`/profile/${notification.user.username}`}
              className="font-medium hover:underline"
            >
              {notification.user.name}
            </Link>
            {" liked your post"}
          </>
        );
      case "comment":
        return (
          <>
            <Link
              href={`/profile/${notification.user.username}`}
              className="font-medium hover:underline"
            >
              {notification.user.name}
            </Link>
            {" commented on your post: "}
            <span className="text-muted-foreground">
              "{notification.comment}"
            </span>
          </>
        );
      case "repost":
        return (
          <>
            <Link
              href={`/profile/${notification.user.username}`}
              className="font-medium hover:underline"
            >
              {notification.user.name}
            </Link>
            {" reposted your post"}
          </>
        );
      case "violation":
        return "Your post has been flagged for violating our community guidelines";
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t("notifications")}</h1>
          <button
            onClick={markAllAsRead}
            className="text-sm text-primary hover:underline"
          >
            Mark all as read
          </button>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">
              All
            </TabsTrigger>
            <TabsTrigger value="mentions" className="flex-1">
              Mentions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-4">
            {notifications.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No notifications
              </p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start space-x-4 rounded-lg border p-4 ${
                    !notification.isRead ? "bg-accent" : ""
                  }`}
                >
                  <div className="mt-1">
                    {notification.type !== "violation" ? (
                      <Link href={`/profile/${notification.user.username}`}>
                        <Image
                          src={notification.user.avatar || "/placeholder.svg"}
                          alt={notification.user.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      </Link>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                        <AlertTriangle className="h-6 w-6 text-yellow-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      {getNotificationIcon(notification.type)}
                      <p>{getNotificationText(notification)}</p>
                    </div>
                    <div className="mt-1">
                      <Link
                        href={`/post/${notification.post.id}`}
                        className="text-sm text-muted-foreground hover:underline"
                      >
                        {notification.post.content.length > 60
                          ? `${notification.post.content.substring(0, 60)}...`
                          : notification.post.content}
                      </Link>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="mentions" className="mt-4">
            <p className="text-center text-muted-foreground">No mentions yet</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
