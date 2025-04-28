"use client";

import { useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Repeat,
  AlertTriangle,
  Bell,
  Loader2,
} from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { useNotification } from "@/contexts/notifContext";
import { NotificationTypeEnum } from "@/enums/notification.enum";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormatTime } from "@/utils/myFormatDistanceToNow";

export default function NotificationsPage() {
  const { t } = useLanguage();
  const {
    notifications,
    loading,
    notReadCount,
    readNotification,
    readAllNotifications,
    loadMoreNotifications,
    hasMore,
  } = useNotification();
  const { formatTimeToNow } = useFormatTime();
  const observerRef = useRef<IntersectionObserver | null>(null);

  const loaderRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;

      // Disconnect previous observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      // Create new observer
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            loadMoreNotifications();
          }
        },
        { threshold: 0.5 }
      );

      // Observe the loader element
      if (node) {
        observerRef.current.observe(node);
      }
    },
    [loading, hasMore, loadMoreNotifications]
  );

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case NotificationTypeEnum.LIKE:
        return <Heart className="h-5 w-5 text-red-500" />;
      case NotificationTypeEnum.COMMENT:
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case NotificationTypeEnum.REPOST:
        return <Repeat className="h-5 w-5 text-green-500" />;
      case "violation":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Bell className="h-5 w-5 text-purple-500" />;
    }
  };

  const getNotificationUnReadBar = (type: string) => {
    switch (type) {
      case NotificationTypeEnum.LIKE:
        return (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
        );
      case NotificationTypeEnum.COMMENT:
        return (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
        );
      case NotificationTypeEnum.REPOST:
        return (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500" />
        );
      case "violation":
        return (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500" />
        );
      default:
        return (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500" />
        );
    }
  };

  const getNotificationText = (notification: any) => {
    switch (notification.type) {
      case NotificationTypeEnum.LIKE:
        return (
          <>
            <Link
              href={`/user/profile/${notification.sender.username}`}
              className="font-medium hover:underline"
            >
              {notification.sender.name}
            </Link>
          </>
        );
      case NotificationTypeEnum.COMMENT:
        return (
          <>
            <Link
              href={`/user/profile/${notification.sender.username}`}
              className="font-medium hover:underline"
            >
              {notification.sender.name}
            </Link>
            <span className="text-muted-foreground italic ml-1">
              {t(notification.content)}
            </span>
          </>
        );
      case NotificationTypeEnum.REPOST:
        return (
          <>
            <Link
              href={`/user/profile/${notification.sender.username}`}
              className="font-medium hover:underline"
            >
              {notification.sender.name}
            </Link>
          </>
        );
      case "violation":
        return "Your post has been flagged for violating our community guidelines";
      default:
        return null;
    }
  };

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case NotificationTypeEnum.LIKE:
        return "bg-red-50 dark:bg-red-950/20";
      case NotificationTypeEnum.COMMENT:
        return "bg-blue-50 dark:bg-blue-950/20";
      case NotificationTypeEnum.REPOST:
        return "bg-green-50 dark:bg-green-950/20";
      case "violation":
        return "bg-yellow-50 dark:bg-yellow-950/20";
      default:
        return "bg-purple-50 dark:bg-purple-950/20";
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Card className="border-none shadow-md rounded-xl overflow-hidden">
        <CardHeader className="bg-background border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl font-bold">
                {t("notifications")}
              </CardTitle>
              {notReadCount > 0 && (
                <Badge variant="destructive" className="rounded-full">
                  {notReadCount}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={readAllNotifications}
              className="text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {t("markAllAsRead")}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <p>{t("noNotifications")}</p>
              </div>
            ) : (
              <>
                {notifications.map((notification, index) => (
                  <div
                    key={notification._id}
                    className={cn(
                      "group relative flex items-start p-4 transition-all",
                      !notification.isRead
                        ? "bg-accent/30"
                        : "hover:bg-accent/10",
                      getNotificationTypeColor(notification.type)
                    )}
                    onClick={() => readNotification(index)}
                  >
                    {!notification.isRead &&
                      getNotificationUnReadBar(
                        notification.type
                      ) // Add the unread bar
                    }

                    <div className="mt-1 mr-4 relative">
                      <Link
                        href={`/user/profile/${notification.sender.username}`}
                        className="block rounded-full overflow-hidden ring-2 ring-background transition-transform group-hover:scale-105"
                      >
                        <Image
                          src={
                            notification.sender.avatar ||
                            "/placeholder.svg?height=40&width=40"
                          }
                          alt={notification.sender.name}
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                        />
                      </Link>
                      <div className="absolute -bottom-1 -right-1 rounded-full p-0.5 bg-background">
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col">
                        <p className="text-sm">
                          {getNotificationText(notification)}
                        </p>

                        <div className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {notification.type === NotificationTypeEnum.COMMENT
                            ? notification.thread!.content
                            : t(notification.content)}
                        </div>

                        <div className="mt-2 flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">
                            {formatTimeToNow(new Date(notification.createdAt))}
                          </p>
                          {notification.thread && (
                            <Link
                              href={`/user/thread/${notification.thread._id}`}
                              className="ml-auto text-xs font-medium text-primary hover:underline"
                            >
                              {t("viewPost")}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div
                  ref={loaderRef}
                  className={cn(
                    "py-4 text-center transition-opacity duration-300",
                    loading ? "opacity-100" : "opacity-0",
                    !hasMore && "hidden"
                  )}
                >
                  {loading && (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">
                        {t("loadingMoreNotifications")}
                      </p>
                    </div>
                  )}
                </div>

                {!hasMore && notifications.length > 0 && (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    <p>{t("noMoreNotifications")}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
