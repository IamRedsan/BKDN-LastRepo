'use client';

import type React from 'react';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Heart,
  MessageCircle,
  Repeat,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/components/language-provider';
import ImageList from './image-list';
import { IThread } from '@/interfaces/thread';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/contexts/userContext';
import CreatePostDialog from './create-post-dialog';
import DeletePostDialog from './delete-confirm-dialog';
import { useFormatTime } from '@/utils/myFormatDistanceToNow';
import { useLikeThread, useRethread } from '@/hooks/api/use-action';

interface PostCardProps {
  post: IThread;
}

export default function PostCard({ post }: PostCardProps) {
  const [thread, setThread] = useState<IThread>(post);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const [isLiked, setIsLiked] = useState(thread.isLiked);
  const [isReposted, setIsReposted] = useState(thread.isReThreaded);
  const { t } = useLanguage();
  const router = useRouter();
  const { user } = useUserContext();
  const isOwnPost = user?.username === thread.user.username;
  const { formatTimeToNow } = useFormatTime();
  const formattedDate = formatTimeToNow(new Date(thread.createdAt));
  const { mutate: likeThread, isPending: isLiking } = useLikeThread();
  const { mutate: repostThread, isPending: isReposting } = useRethread();
  // const
  // Determine if post is in a different language than current UI
  // const isDifferentLanguage = post.language && post.language !== language;

  const handleTranslate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTranslated(!isTranslated);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  const handleDirectDetail = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/user/thread/${thread._id}`);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    likeThread(thread._id, {
      onSuccess: (data) => {
        // Update the thread's like count
        setIsLiked(!isLiked);
        setThread(data);
      },
      onError: (error) => {
        console.error('Failed to like/unlike thread:', error);
      },
    });
  };

  const handleRepost = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Repost clicked');
    setIsReposted(!isReposted);
    repostThread(thread._id, {
      onSuccess: (data: IThread) => {
        // Update the thread's repost count
        setIsReposted(data.isReThreaded);
        setThread(data);
      },
      onError: (error) => {
        console.error('Failed to repost/unrepost:', error);
      },
    });
  };

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <Link href={`/user/profile/${thread.user.username}`}>
          <Image
            src={thread.user.avatar || '/placeholder.svg'}
            alt={thread.user.name}
            width={40}
            height={40}
            className="rounded-full"
          />
        </Link>

        {/* thread Content */}
        <div className="flex-1 space-y-2 overflow-hidden">
          {/* Author and Date */}
          <div className="flex items-center justify-between ">
            <div>
              <Link
                href={`/user/profile/${thread.user.username}`}
                className="font-medium hover:underline"
              >
                {thread.user.name}
              </Link>
              <span className="text-muted-foreground">
                {' '}
                @{thread.user.username}
              </span>
              <span className="text-muted-foreground text-sm">
                {' '}
                · {formattedDate}
              </span>
              {thread.updatedAt !== thread.createdAt && (
                <span className="text-muted-foreground text-xs">
                  {' '}
                  ({t('edit')})
                </span>
              )}
            </div>
            <DropdownMenu
              open={isDropdownOpen}
              onOpenChange={setIsDropdownOpen}
            >
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal size={18} />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* {isDifferentLanguage && (
                  <DropdownMenuItem onClick={handleTranslate}>
                    {isTranslated ? 'Show original' : t('translate')}
                  </DropdownMenuItem>
                )} */}
                {thread.updatedAt && (
                  <DropdownMenuItem>{t('viewEditHistory')}</DropdownMenuItem>
                )}
                <DropdownMenuItem>{t('reportContent')}</DropdownMenuItem>
                {isOwnPost && (
                  <>
                    <CreatePostDialog
                      key={thread._id}
                      trigger={
                        <DropdownMenuItem
                          disabled={isLiking || isReposting}
                          onSelect={(e) => {
                            e.preventDefault(); // Ngăn dropdown tự động đóng
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          {t('edit')}
                        </DropdownMenuItem>
                      }
                      initialThread={thread}
                      isEditing={true}
                      setIsDropdownOpen={setIsDropdownOpen}
                    />

                    <DropdownMenuItem
                      onClick={handleDelete}
                      disabled={isLiking || isReposting}
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

          <div className="cursor-pointer" onClick={handleDirectDetail}>
            <div className="relative">
              <p className="text-sm">
                {
                  // isTranslated
                  //   ? TRANSLATIONS[thread.id as keyof typeof TRANSLATIONS] ||
                  //     thread.content
                  //   :
                  thread.content
                }
              </p>

              {/* {isDifferentLanguage && !isTranslated && (
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
              )} */}
            </div>
            <div className="overflow-x-auto mt-2 pb-2 no-scrollbar">
              <div className="flex gap-2 w-max">
                <ImageList
                  files={thread.media.map((img) => ({
                    url: img.url,
                  }))}
                  isEditable={false}
                  setFiles={() => {}}
                ></ImageList>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4 pt-2">
            <Button
              disabled={isLiking || isReposting}
              onClick={handleLike}
              variant="action"
              size="sm"
              className={`flex items-center space-x-1 ${
                thread.isLiked ? 'text-red-500' : ''
              }`}
            >
              <Heart size={18} className={`${isLiked ? 'fill-red-500' : ''}`} />
              <span>{thread.reactionNum}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1"
              onClick={handleDirectDetail}
            >
              <MessageCircle size={18} />
              <span>{thread.commentNum}</span>
            </Button>
            <Button
              variant="action"
              size="sm"
              className={`flex items-center space-x-1 ${
                isReposted ? 'text-green-500' : ''
              }`}
              onClick={handleRepost}
              disabled={isLiking || isReposting}
            >
              <Repeat
                size={18}
                className={isReposted ? 'fill-green-500' : ''}
              />
              <span>{thread.sharedNum}</span>
            </Button>
          </div>
        </div>
      </div>
      {/* Delete confirmation dialog */}
      <DeletePostDialog
        thread={thread}
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
}
