"use client";

import type React from "react";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from "@/components/layouts/main-layout";
import PostCard from "@/components/posts/post-card";
import { useLanguage } from "@/components/language-provider";

// Mock users data
const MOCK_USERS = [
  {
    id: "user1",
    name: "Jane Smith",
    username: "janesmith",
    avatar: "/placeholder.svg?height=40&width=40",
    bio: "Product Designer | UI/UX Enthusiast",
    isFollowing: false,
  },
  {
    id: "user2",
    name: "John Doe",
    username: "johndoe",
    avatar: "/placeholder.svg?height=40&width=40",
    bio: "Software Engineer | Next.js Developer",
    isFollowing: true,
  },
  {
    id: "user3",
    name: "Alex Johnson",
    username: "alexj",
    avatar: "/placeholder.svg?height=40&width=40",
    bio: "Photographer | Nature lover",
    isFollowing: false,
  },
];

// Mock posts data
const MOCK_POSTS = [
  {
    id: "1",
    author: {
      id: "user1",
      name: "Jane Smith",
      username: "janesmith",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content:
      "Just launched my new website! Check it out and let me know what you think.",
    images: ["/placeholder.svg?height=400&width=600"],
    createdAt: "2023-05-15T10:30:00Z",
    updatedAt: null,
    likes: 42,
    comments: 7,
    reposts: 3,
    isLiked: false,
    isReposted: false,
  },
  {
    id: "2",
    author: {
      id: "user2",
      name: "John Doe",
      username: "johndoe",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content:
      "Working on a new project using Next.js and Tailwind CSS. The developer experience is amazing!",
    images: [],
    createdAt: "2023-05-14T15:45:00Z",
    updatedAt: "2023-05-14T16:00:00Z",
    likes: 28,
    comments: 5,
    reposts: 2,
    isLiked: true,
    isReposted: false,
  },
];

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState(MOCK_USERS);
  const [posts, setPosts] = useState(MOCK_POSTS);
  const { t } = useLanguage();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would search for users and posts
    // For now, we'll just filter the mock data
    if (searchQuery) {
      const filteredUsers = MOCK_USERS.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.bio.toLowerCase().includes(searchQuery.toLowerCase())
      );

      const filteredPosts = MOCK_POSTS.filter((post) =>
        post.content.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setUsers(filteredUsers);
      setPosts(filteredPosts);
    } else {
      setUsers(MOCK_USERS);
      setPosts(MOCK_POSTS);
    }
  };

  const toggleFollow = (userId: string) => {
    setUsers(
      users.map((user) => {
        if (user.id === userId) {
          return {
            ...user,
            isFollowing: !user.isFollowing,
          };
        }
        return user;
      })
    );
  };

  const handleLike = (postId: string) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          };
        }
        return post;
      })
    );
  };

  const handleRepost = (postId: string) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            isReposted: !post.isReposted,
            reposts: post.isReposted ? post.reposts - 1 : post.reposts + 1,
          };
        }
        return post;
      })
    );
  };

  return (
    <div>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t("search")}</h1>

        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder={`${t("search")} for users or posts...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">{t("search")}</Button>
        </form>

        <Tabs defaultValue="users">
          <TabsList className="w-full">
            <TabsTrigger value="users" className="flex-1">
              {t("profile")}
            </TabsTrigger>
            <TabsTrigger value="posts" className="flex-1">
              {t("post")}s
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4 mt-4">
            {users.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No users found
              </p>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center space-x-4">
                    <Link href={`/profile/${user.username}`}>
                      <Image
                        src={user.avatar || "/placeholder.svg"}
                        alt={user.name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    </Link>
                    <div>
                      <Link
                        href={`/profile/${user.username}`}
                        className="font-medium hover:underline"
                      >
                        {user.name}
                      </Link>
                      <p className="text-muted-foreground">@{user.username}</p>
                      <p className="text-sm">{user.bio}</p>
                    </div>
                  </div>
                  <Button
                    variant={user.isFollowing ? "outline" : "default"}
                    onClick={() => toggleFollow(user.id)}
                  >
                    {user.isFollowing ? t("unfollowUser") : t("followUser")}
                  </Button>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="posts" className="space-y-4 mt-4">
            {posts.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No posts found
              </p>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onRepost={handleRepost}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
