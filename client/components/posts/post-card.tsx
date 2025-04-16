'use client';

import type React from 'react';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  Heart,
  MessageCircle,
  Repeat,
  Share2,
  MoreHorizontal,
  Pencil,
  Trash2,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import PostDetail from '@/components/posts/post-detail';
import { useLanguage } from '@/components/language-provider';
import ImageList from './image-list';

interface Author {
  id: string;
  name: string;
  username: string;
  avatar: string;
}

interface Post {
  id: string;
  author: Author;
  content: string;
  images: string[];
  createdAt: string;
  updatedAt: string | null;
  likes: number;
  comments: number;
  reposts: number;
  isLiked: boolean;
  isReposted: boolean;
  language?: string;
}

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onRepost: (postId: string) => void;
  isOwnPost?: boolean;
}

// Mock translations
const TRANSLATIONS = {
  '1': 'Just launched my new website! Check it out and let me know what you think. (Translated)',
  '2': 'Working on a new project using Next.js and Tailwind CSS. The developer experience is amazing! (Translated)',
  '3': 'Beautiful day for a hike! 🏔️ (Translated)',
};

export default function PostCard({
  post,
  onLike,
  onRepost,
  isOwnPost = false,
}: PostCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const { t, language } = useLanguage();

  const formattedDate = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
  });

  // Determine if post is in a different language than current UI
  const isDifferentLanguage = post.language && post.language !== language;

  const handleTranslate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTranslated(!isTranslated);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Handle edit functionality
    console.log('Edit post', post.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Handle delete functionality
    console.log('Delete post', post.id);
  };

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <Link href={`/profile/${post.author.username}`}>
          <Image
            src={post.author.avatar || '/placeholder.svg'}
            alt={post.author.name}
            width={40}
            height={40}
            className="rounded-full"
          />
        </Link>

        {/* Post Content */}
        <div className="flex-1 space-y-2 overflow-hidden">
          {/* Author and Date */}
          <div className="flex items-center justify-between ">
            <div>
              <Link
                href={`/profile/${post.author.username}`}
                className="font-medium hover:underline"
              >
                {post.author.name}
              </Link>
              <span className="text-muted-foreground">
                {' '}
                @{post.author.username}
              </span>
              <span className="text-muted-foreground text-sm">
                {' '}
                · {formattedDate}
              </span>
              {post.updatedAt && (
                <span className="text-muted-foreground text-xs">
                  {' '}
                  ({t('edit')})
                </span>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal size={18} />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isDifferentLanguage && (
                  <DropdownMenuItem onClick={handleTranslate}>
                    {isTranslated ? 'Show original' : t('translate')}
                  </DropdownMenuItem>
                )}
                {post.updatedAt && (
                  <DropdownMenuItem>{t('viewEditHistory')}</DropdownMenuItem>
                )}
                <DropdownMenuItem>{t('reportContent')}</DropdownMenuItem>
                {isOwnPost && (
                  <>
                    <DropdownMenuItem onClick={handleEdit}>
                      <Pencil className="mr-2 h-4 w-4" />
                      {t('edit')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t('delete')}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/*Post detail  */}
          <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
            <DialogTrigger asChild>
              <div className="cursor-pointer">
                <div className="relative">
                  <p className="text-sm">
                    {isTranslated
                      ? TRANSLATIONS[post.id as keyof typeof TRANSLATIONS] ||
                        post.content
                      : post.content}
                  </p>

                  {isDifferentLanguage && !isTranslated && (
                    <button
                      onClick={handleTranslate}
                      className="mt-1 flex items-center text-xs text-primary hover:underline"
                    >
                      <Globe className="mr-1 h-3 w-3" />
                      {t('translate')}
                    </button>
                  )}

                  {isTranslated && (
                    <button
                      onClick={handleTranslate}
                      className="mt-1 flex items-center text-xs text-primary hover:underline"
                    >
                      <Globe className="mr-1 h-3 w-3" />
                      Show original
                    </button>
                  )}
                </div>

                {/* {post.images.length > 0 && (
                  <div className="mt-2 overflow-x-auto pb-2">
                    <div className="flex gap-2 w-max">
                      {post.images.map((image, index) => (
                        <div
                          key={index}
                          className="relative aspect-square w-60 h-60 flex-shrink-0 overflow-hidden rounded-md"
                        >
                          <Image
                            src={image || "/placeholder.svg"}
                            alt={`Post image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )} */}
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <PostDetail
                post={post}
                onLike={onLike}
                onRepost={onRepost}
                isOwnPost={isOwnPost}
                isTranslated={isTranslated}
                setIsTranslated={setIsTranslated}
              />
            </DialogContent>
          </Dialog>
          {/*Image  */}
          <div className="overflow-x-auto mt-2 pb-2 no-scrollbar">
            <div className="flex gap-2 w-max">
              {post.images.map((img, index) => (
                <div
                  key={index}
                  className="min-w-[200px] h-[200px] flex-shrink-0"
                >
                  <img
                    src={img}
                    alt={`Image ${index}`}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4 pt-2">
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center space-x-1 ${
                post.isLiked ? 'text-red-500' : ''
              }`}
              onClick={() => onLike(post.id)}
            >
              <Heart size={18} className={post.isLiked ? 'fill-red-500' : ''} />
              <span>{post.likes}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1"
              onClick={() => setIsDetailOpen(true)}
            >
              <MessageCircle size={18} />
              <span>{post.comments}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center space-x-1 ${
                post.isReposted ? 'text-green-500' : ''
              }`}
              onClick={() => onRepost(post.id)}
            >
              <Repeat
                size={18}
                className={post.isReposted ? 'fill-green-500' : ''}
              />
              <span>{post.reposts}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1"
            >
              <Share2 size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
