"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { useUserContext } from "@/contexts/userContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { IUser } from "@/interfaces/user";

interface FollowDialogProps {
  isOpen: boolean;
  onClose: () => void;
  followers: IUser[];
  following: IUser[];
  onRemoveFollower: (userId: string) => void;
  onUnfollow: (userId: string) => void;
  onFollow: (userId: string) => void;
  initialTab?: "followers" | "following";
  profileUsername: string;
}

export default function FollowDialog({
  isOpen,
  onClose,
  followers,
  following,
  onRemoveFollower,
  onUnfollow,
  onFollow,
  initialTab = "followers",
  profileUsername,
}: FollowDialogProps) {
  const { t } = useLanguage();
  const { user: currentUser } = useUserContext();
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Check if the current user is viewing their own profile
  const isOwnProfile = currentUser?.username === profileUsername;

  // Check if current user follows a specific user
  const isFollowing = (userId: string) => {
    return following.some(
      (user) =>
        currentUser &&
        user._id === userId &&
        user.followers?.includes(currentUser._id)
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="border-b pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              {activeTab === "followers" ? t("followers") : t("following")}
            </DialogTitle>
            <DialogClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8"
              >
                <X size={18} />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        <Tabs
          defaultValue={initialTab}
          className="w-full"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="followers">{t("followers")}</TabsTrigger>
            <TabsTrigger value="following">{t("following")}</TabsTrigger>
          </TabsList>

          <TabsContent
            value="followers"
            className="max-h-[60vh] overflow-y-auto"
          >
            {followers.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <p>{t("noFollowers")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {followers.map((follower) => (
                  <div
                    key={follower._id}
                    className="flex items-center justify-between py-2"
                  >
                    <Link
                      href={`/user/profile/${follower.username}`}
                      className="flex items-center space-x-3 flex-1"
                      onClick={onClose}
                    >
                      <Avatar className="h-10 w-10 border">
                        <AvatarImage
                          src={follower.avatar || "/placeholder.svg"}
                          alt={follower.name}
                        />
                        <AvatarFallback>
                          {follower.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{follower.name}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          @{follower.username}
                        </p>
                      </div>
                    </Link>

                    {isOwnProfile ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRemoveFollower(follower._id)}
                        className="ml-2 whitespace-nowrap"
                      >
                        {t("removeFollower")}
                      </Button>
                    ) : (
                      currentUser &&
                      follower._id !== currentUser._id && (
                        <Button
                          variant={
                            isFollowing(follower._id) ? "outline" : "default"
                          }
                          size="sm"
                          onClick={() =>
                            isFollowing(follower._id)
                              ? onUnfollow(follower._id)
                              : onFollow(follower._id)
                          }
                          className="ml-2 whitespace-nowrap"
                        >
                          {isFollowing(follower._id)
                            ? t("following")
                            : t("follow")}
                        </Button>
                      )
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent
            value="following"
            className="max-h-[60vh] overflow-y-auto"
          >
            {following.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <p>{t("noFollowing")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {following.map((followedUser) => (
                  <div
                    key={followedUser._id}
                    className="flex items-center justify-between py-2"
                  >
                    <Link
                      href={`/user/profile/${followedUser.username}`}
                      className="flex items-center space-x-3 flex-1"
                      onClick={onClose}
                    >
                      <Avatar className="h-10 w-10 border">
                        <AvatarImage
                          src={followedUser.avatar || "/placeholder.svg"}
                          alt={followedUser.name}
                        />
                        <AvatarFallback>
                          {followedUser.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {followedUser.name}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          @{followedUser.username}
                        </p>
                      </div>
                    </Link>

                    {isOwnProfile ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUnfollow(followedUser._id)}
                        className="ml-2 whitespace-nowrap"
                      >
                        {t("unfollow")}
                      </Button>
                    ) : (
                      currentUser &&
                      followedUser._id !== currentUser._id && (
                        <Button
                          variant={
                            isFollowing(followedUser._id)
                              ? "outline"
                              : "default"
                          }
                          size="sm"
                          onClick={() =>
                            isFollowing(followedUser._id)
                              ? onUnfollow(followedUser._id)
                              : onFollow(followedUser._id)
                          }
                          className="ml-2 whitespace-nowrap"
                        >
                          {isFollowing(followedUser._id)
                            ? t("following")
                            : t("follow")}
                        </Button>
                      )
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
