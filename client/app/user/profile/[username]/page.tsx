"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Pencil, Settings } from "lucide-react";
import PostCard from "@/components/posts/post-card";
import { useLanguage } from "@/components/language-provider";
import { useUserContext } from "@/contexts/userContext";
import { useParams } from "next/navigation";
import { IUser } from "@/interfaces/user";
import { useGetProfile } from "@/hooks/api/use-user";
import { ProfileSkeleton } from "@/components/loading/profile-skeleton";
import { RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { setThreads } from "@/store/profile-thread-slice";
import { setReThreads } from "@/store/profile-rethread-slice";
import FollowDialog from "@/components/profile/follow-dialog";
import { useFollowTrigger } from "@/hooks/api/use-action";

export default function ProfilePage() {
  const { username } = useParams();
  const { user, setUser } = useUserContext();
  const dispatch = useDispatch();
  const [profile, setProfile] = useState<IUser | null>(() => {
    if (user?.username === username) {
      return user;
    } else {
      return null;
    }
  });
  const posts = useSelector((state: RootState) => state.profileThread.threads);
  const reposts = useSelector(
    (state: RootState) => state.profileReThread.reThreads
  );
  const { t } = useLanguage();
  const [isMyProfile, setIsMyProfile] = useState<boolean>(false);
  const [isFollowingProfile, setIsFollowingProfile] = useState<boolean>(false);
  const [isFollowDialogOpen, setIsFollowDialogOpen] = useState<boolean>(false);
  const [activeFollowTab, setActiveFollowTab] = useState<
    "followers" | "following"
  >("followers");
  const { data, error, isLoading } = useGetProfile(username as string);
  const { mutate: followTrigger, isPending: isFollowLoading } =
    useFollowTrigger();

  const handleFollowToggle = async () => {
    if (!profile) {
      return;
    }
    followTrigger(profile.username, {
      onSuccess: (data) => {
        if (user) {
          user.following = data.following;
          user.followingCount = data.followingCount;
          setUser(user);
          setIsFollowingProfile((prev) => !prev);
        }
      },
    });
  };

  const openFollowersDialog = () => {
    if (!profile) return;
    setActiveFollowTab("followers");
    setIsFollowDialogOpen(true);
  };

  const openFollowingDialog = () => {
    if (!profile) return;
    setActiveFollowTab("following");
    setIsFollowDialogOpen(true);
  };

  useEffect(() => {
    if (data) {
      if (data.user.username === user?.username) {
        setIsMyProfile(true);
      }
      setProfile(data.user);
      dispatch(setThreads(data.threads));
      dispatch(setReThreads(data.reThreads));
      data.user.followers.some((follower) => {
        if (follower.username === user?.username) {
          setIsFollowingProfile(true);
          return true;
        }
        return false;
      });
    }
  }, [data, dispatch, user, username]);

  if (isLoading || profile === null) {
    return (
      <div>
        <ProfileSkeleton />
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-6">
        <div className="relative">
          <div className="h-48 w-full overflow-hidden rounded-lg">
            <Image
              src={profile?.wallpaper || "/placeholder.svg"}
              alt="Profile banner"
              fill
              className="object-cover"
            />
          </div>

          <div className="absolute -bottom-16 left-4 h-32 w-32 overflow-hidden rounded-full border-4 border-background">
            <Image
              src={profile?.avatar || "/placeholder.svg"}
              alt={"Profile picture"}
              fill
              className="object-cover"
            />
          </div>

          {isMyProfile && (
            <div className="absolute right-4 top-4 flex space-x-2 ">
              <Link href="/user/settings">
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-background/80 backdrop-blur-sm"
                >
                  <Settings size={18} />
                </Button>
              </Link>
              <Link href="/user/profile/edit">
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-background/80 backdrop-blur-sm"
                >
                  <Pencil size={18} />
                </Button>
              </Link>
            </div>
          )}
        </div>

        <div className="mt-24 space-y-4">
          <div className="mt-16">
            <h1 className="text-2xl font-bold">{profile?.name ?? ""}</h1>
            <p className="text-muted-foreground">@{profile?.username ?? ""}</p>
          </div>

          <p>{profile?.bio ?? ""}</p>

          <div className="flex space-x-4 gap-3">
            <span
              onClick={openFollowersDialog}
              className="cursor-pointer hover:underline focus:outline-none"
            >
              <strong className="mr-1">{profile?.followersCount ?? 0}</strong>
              {t("followers")}
            </span>
            <span
              onClick={openFollowingDialog}
              className="cursor-pointer hover:underline focus:outline-none"
            >
              <strong className="mr-1">{profile?.followingCount ?? 0}</strong>
              {t("following")}
            </span>
          </div>
          {!isMyProfile && (
            <Button
              className="w-full"
              onClick={handleFollowToggle}
              disabled={isFollowLoading}
              variant={isFollowingProfile ? "outline" : "default"}
            >
              {isFollowingProfile ? t("unfollow") : t("follow")}
            </Button>
          )}
        </div>

        {/* Posts and Reposts */}
        <Tabs defaultValue="posts">
          <TabsList className="w-full">
            <TabsTrigger value="posts" className="flex-1">
              {t("post")}
            </TabsTrigger>
            <TabsTrigger value="reposts" className="flex-1">
              {t("repost")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="posts" className="space-y-4 mt-4">
            {posts.length > 0 ? (
              posts.map((post) => <PostCard key={post._id} post={post} />)
            ) : (
              <p className="flex flex-1 items-center justify-center mt-4">
                {t("noPosts")}
              </p>
            )}
          </TabsContent>
          <TabsContent value="reposts" className="space-y-4 mt-4">
            {reposts.length > 0 ? (
              reposts.map((post) => <PostCard key={post._id} post={post} />)
            ) : (
              <p className="flex flex-1 items-center justify-center mt-4">
                {t("noReposts")}
              </p>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <FollowDialog
        isOpen={isFollowDialogOpen}
        onClose={() => setIsFollowDialogOpen(false)}
        followers={profile?.followers ?? []}
        following={profile?.following ?? []}
        initialTab={activeFollowTab}
        profileUsername={profile?.username || ""}
      />
    </div>
  );
}
