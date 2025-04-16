'use client';

import { useState } from 'react';
import PostCard from '@/components/posts/post-card';
import { useLanguage } from '@/components/language-provider';

// Mock data for posts
const MOCK_POSTS = [
  {
    id: '1',
    author: {
      id: 'user1',
      name: 'Jane Smith',
      username: 'janesmith',
      avatar: '/placeholder.svg?height=40&width=40',
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
  },
  {
    id: '2',
    author: {
      id: 'user2',
      name: 'John Doe',
      username: 'johndoe',
      avatar: '/placeholder.svg?height=40&width=40',
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
  },
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
      '/placeholder.svg?height=400&width=600',
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
  },
];

export default function FeedPage() {
  const [posts, setPosts] = useState(MOCK_POSTS);
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('home')}</h1>
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={handleLike}
            onRepost={handleRepost}
          />
        ))}
      </div>
    </div>
  );
}
