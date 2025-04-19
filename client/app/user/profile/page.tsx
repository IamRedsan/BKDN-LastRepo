'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Pencil, Settings } from 'lucide-react';
import MainLayout from '@/components/layouts/main-layout';
import PostCard from '@/components/posts/post-card';
import { useLanguage } from '@/components/language-provider';
import { useUserContext } from '@/contexts/userContext';

// Mock user data
const USER = {
  id: 'user1',
  name: 'Jane Smith',
  username: 'janesmith',
  avatar: '/placeholder.svg?height=100&width=100',
  banner: '/placeholder.svg?height=300&width=1200',
  bio: 'Product Designer | UI/UX Enthusiast | Creating digital experiences that people love',
  website: 'https://janesmith.design',
  followers: 1243,
  following: 567,
  // joinedDate: '2022-03-15T00:00:00Z',
};

// Mock posts data
const USER_POSTS = [
  {
    id: '1',
    author: {
      id: USER.id,
      name: USER.name,
      username: USER.username,
      avatar: USER.avatar,
    },
    content:
      'Just launched my new website! Check it out and let me know what you think.',
    images: ['/placeholder.svg?height=400&width=600'],
    createdAt: '2023-05-15T10:30:00Z',
    updatedAt: null,
    likes: 42,
    comments: 7,
    reposts: 3,
    isLiked: false,
    isReposted: false,
    language: 'EN',
  },
  {
    id: '2',
    author: {
      id: USER.id,
      name: USER.name,
      username: USER.username,
      avatar: USER.avatar,
    },
    content:
      'Working on a new project using Next.js and Tailwind CSS. The developer experience is amazing!',
    images: [],
    createdAt: '2023-05-14T15:45:00Z',
    updatedAt: '2023-05-14T16:00:00Z',
    likes: 28,
    comments: 5,
    reposts: 2,
    isLiked: true,
    isReposted: false,
    language: 'VI',
  },
];

// Mock reposts data
const USER_REPOSTS = [
  {
    id: '3',
    author: {
      id: 'user3',
      name: 'Alex Johnson',
      username: 'alexj',
      avatar: '/placeholder.svg?height=40&width=40',
    },
    content: 'Beautiful day for a hike! 🏔️',
    images: [
      '/placeholder.svg?height=400&width=600',
      '/placeholder.svg?height=400&width=600',
    ],
    createdAt: '2023-05-13T09:15:00Z',
    updatedAt: null,
    likes: 76,
    comments: 12,
    reposts: 8,
    isLiked: false,
    isReposted: true,
    language: 'JA',
  },
];

export default function ProfilePage() {
  const [posts, setPosts] = useState(USER_POSTS);
  const [reposts, setReposts] = useState(USER_REPOSTS);
  const { user } = useUserContext();
  const { t } = useLanguage();

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

    setReposts(
      reposts.map((post) => {
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

    setReposts(
      reposts.map((post) => {
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
    <MainLayout>
      <div className="space-y-6">
        <div className="relative">
          <div className="h-48 w-full overflow-hidden rounded-lg">
            <Image
              src={user?.wallpaper || '/placeholder.svg'}
              alt="Profile banner"
              fill
              className="object-cover"
            />
          </div>

          <div className="absolute -bottom-16 left-4 h-32 w-32 overflow-hidden rounded-full border-4 border-background">
            <Image
              src={user?.avatar || '/placeholder.svg'}
              alt={USER.name}
              fill
              className="object-cover"
            />
          </div>

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
        </div>

        <div className="mt-24 space-y-4">
          <div className="mt-16">
            <h1 className="text-2xl font-bold">{user?.name ?? ''}</h1>
            <p className="text-muted-foreground">@{user?.username ?? ''}</p>
          </div>

          <p>{user?.bio ?? ''}</p>

          <div className="flex space-x-4">
            <span>
              <strong>{user?.followersCount ?? 0}</strong> {t('followers')}
            </span>
            <span>
              <strong>{user?.followingCount ?? 0}</strong> {t('following')}
            </span>
          </div>

          <Button className="w-full">{t('followUser')}</Button>
        </div>

        {/* Posts and Reposts */}
        <Tabs defaultValue="posts">
          <TabsList className="w-full">
            <TabsTrigger value="posts" className="flex-1">
              {t('post')}
            </TabsTrigger>
            <TabsTrigger value="reposts" className="flex-1">
              {t('repost')}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="posts" className="space-y-4 mt-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onRepost={handleRepost}
                isOwnPost={true}
              />
            ))}
          </TabsContent>
          <TabsContent value="reposts" className="space-y-4 mt-4">
            {reposts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onRepost={handleRepost}
                isOwnPost={false}
              />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
