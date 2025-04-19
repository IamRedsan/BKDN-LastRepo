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
import { IThread } from "@/interfaces/thread";
import { RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { setThreads } from "@/store/profile-thread-slice";
import { setReThreads } from "@/store/profile-rethread-slice";

export default function ProfilePage() {
  const { username } = useParams();
  const { user } = useUserContext();
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

  const { data, error, isLoading } = useGetProfile(username as string);

  // const handleLike = (postId: string) => {
  //   setPosts(
  //     posts.map((post) => {
  //       if (post.id === postId) {
  //         return {
  //           ...post,
  //           isLiked: !post.isLiked,
  //           likes: post.isLiked ? post.likes - 1 : post.likes + 1,
  //         };
  //       }
  //       return post;
  //     })
  //   );

  //   setReposts(
  //     reposts.map((post) => {
  //       if (post.id === postId) {
  //         return {
  //           ...post,
  //           isLiked: !post.isLiked,
  //           likes: post.isLiked ? post.likes - 1 : post.likes + 1,
  //         };
  //       }
  //       return post;
  //     })
  //   );
  // };

  // const handleRepost = (postId: string) => {
  //   setPosts(
  //     posts.map((post) => {
  //       if (post.id === postId) {
  //         return {
  //           ...post,
  //           isReposted: !post.isReposted,
  //           reposts: post.isReposted ? post.reposts - 1 : post.reposts + 1,
  //         };
  //       }
  //       return post;
  //     })
  //   );

  //   setReposts(
  //     reposts.map((post) => {
  //       if (post.id === postId) {
  //         return {
  //           ...post,
  //           isReposted: !post.isReposted,
  //           reposts: post.isReposted ? post.reposts - 1 : post.reposts + 1,
  //         };
  //       }
  //       return post;
  //     })
  //   );
  // };
  useEffect(() => {
    if (data) {
      if (data.user.username === user?.username) {
        setIsMyProfile(true);
      }
      setProfile(data.user); // Update profile
      dispatch(setThreads(data.threads));
      dispatch(setReThreads(data.reThreads));
    }
  }, [data]);

  if (isLoading) {
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

          <div className="flex space-x-4">
            <span>
              <strong>{profile?.followersCount ?? 0}</strong> {t("followers")}
            </span>
            <span>
              <strong>{profile?.followingCount ?? 0}</strong> {t("following")}
            </span>
          </div>
          {!isMyProfile && (
            <Button className="w-full">{t("followUser")}</Button>
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
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                // onLike={handleLike}
                // onRepost={handleRepost}
                onLike={() => {}}
                onRepost={() => {}}
                isOwnPost={true}
              />
            ))}
          </TabsContent>
          <TabsContent value="reposts" className="space-y-4 mt-4">
            {reposts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                // onLike={handleLike}
                // onRepost={handleRepost}
                onLike={() => {}}
                onRepost={() => {}}
                isOwnPost={false}
              />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
