"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/language-provider";
import { useUserContext } from "@/contexts/userContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFollowTrigger, useRemoveFollower } from "@/hooks/api/use-action";

interface FollowDialogProps {
  isOpen: boolean;
  onClose: () => void;
  followers: {
    name: string;
    username: string;
    avatar: string;
  }[];
  following: {
    name: string;
    username: string;
    avatar: string;
  }[];
  initialTab?: "followers" | "following";
  profileUsername: string;
}

export default function FollowDialog({
  isOpen,
  onClose,
  followers,
  following,
  initialTab = "followers",
  profileUsername,
}: FollowDialogProps) {
  const { t } = useLanguage();
  const { user: currentUser, setUser } = useUserContext();
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [localFollowers, setLocalFollowers] = useState(followers);
  const [localFollowing, setLocalFollowing] = useState(following);
  const isOwnProfile = currentUser?.username === profileUsername;
  const { mutate: followTrigger } = useFollowTrigger();
  const { mutate: removeFollower } = useRemoveFollower();

  const handleFollowTrigger = (username: string) => {
    followTrigger(username, {
      onSuccess: (data) => {
        // Cập nhật danh sách following
        if (isOwnProfile) {
          setLocalFollowing(data.following);
        }
        if (currentUser) {
          setUser({
            ...currentUser,
            following: data.following,
            followingCount: data.followingCount,
          });
        }
      },
    });
  };

  const handleUnfollow = (username: string) => {
    removeFollower(username, {
      onSuccess: (data) => {
        setLocalFollowers((prevFollowers) =>
          prevFollowers.filter((follower) => follower.username !== username)
        );
        if (currentUser) {
          setUser({
            ...currentUser,
            followers: data.followers,
            followersCount: data.followersCount,
          });
        }
      },
    });
  };

  const isFollowing = (username: string) => {
    return currentUser?.following.some((user) => user.username === username);
  };

  const isFollower = (username: string) => {
    return currentUser?.followers.some((user) => user.username === username);
  };

  useEffect(() => {
    setLocalFollowers(followers);
    setLocalFollowing(following);
  }, [followers, following]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="border-b pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              {activeTab === "followers" ? t("followers") : t("following")}
            </DialogTitle>
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

          {/* Followers Tab */}
          <TabsContent
            value="followers"
            className="max-h-[60vh] overflow-y-auto"
          >
            {localFollowers.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <p>{t("noFollowers")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {localFollowers.map((follower) => (
                  <div
                    key={follower.username}
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
                        className="ml-2 whitespace-nowrap"
                        onClick={() => handleUnfollow(follower.username)}
                      >
                        {t("removeFollower")}
                      </Button>
                    ) : (
                      currentUser &&
                      follower.username !== currentUser.username && (
                        <Button
                          variant={
                            isFollowing(follower.username)
                              ? "outline"
                              : "default"
                          }
                          size="sm"
                          className="ml-2 whitespace-nowrap"
                          onClick={() => handleFollowTrigger(follower.username)}
                        >
                          {isFollowing(follower.username)
                            ? t("unfollow")
                            : t("follow")}
                        </Button>
                      )
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Following Tab */}
          <TabsContent
            value="following"
            className="max-h-[60vh] overflow-y-auto"
          >
            {localFollowing.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <p>{t("noFollowing")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {localFollowing.map((followedUser, index) => (
                  <div
                    key={`${followedUser.username}-${index}`}
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
                        className="ml-2 whitespace-nowrap"
                        onClick={() =>
                          handleFollowTrigger(followedUser.username)
                        }
                      >
                        {t("unfollow")}
                      </Button>
                    ) : (
                      currentUser &&
                      followedUser.username !== currentUser.username && (
                        <Button
                          variant={
                            isFollowing(followedUser.username)
                              ? "outline"
                              : "default"
                          }
                          size="sm"
                          className="ml-2 whitespace-nowrap"
                          onClick={() =>
                            handleFollowTrigger(followedUser.username)
                          }
                        >
                          {isFollowing(followedUser.username)
                            ? t("unfollow")
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
