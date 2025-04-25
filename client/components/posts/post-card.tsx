"use client";

import type React from "react";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Heart,
  MessageCircle,
  Repeat,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/components/language-provider";
import ImageList from "./image-list";
import { IThread } from "@/interfaces/thread";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/contexts/userContext";
import CreatePostDialog from "./create-post-dialog";
import DeletePostDialog from "./delete-confirm-dialog";
import { useFormatTime } from "@/utils/myFormatDistanceToNow";

interface PostCardProps {
  post: IThread;
}

export default function PostCard({ post }: PostCardProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [isReposted, setIsReposted] = useState(post.isReThreaded);
  const { t } = useLanguage();
  const router = useRouter();
  const { user } = useUserContext();
  const isOwnPost = user?.username === post.user.username;
  const { formatTimeToNow } = useFormatTime();
  const formattedDate = formatTimeToNow(new Date(post.createdAt));

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
    router.push(`/user/thread/${post._id}`);
  };

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <Link href={`/user/profile/${post.user.username}`}>
          <Image
            src={post.user.avatar || "/placeholder.svg"}
            alt={post.user.name}
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
                href={`/user/profile/${post.user.username}`}
                className="font-medium hover:underline"
              >
                {post.user.name}
              </Link>
              <span className="text-muted-foreground">
                {" "}
                @{post.user.username}
              </span>
              <span className="text-muted-foreground text-sm">
                {" "}
                · {formattedDate}
              </span>
              {post.updatedAt !== post.createdAt && (
                <span className="text-muted-foreground text-xs">
                  {" "}
                  ({t("edit")})
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
                {post.updatedAt && (
                  <DropdownMenuItem>{t("viewEditHistory")}</DropdownMenuItem>
                )}
                <DropdownMenuItem>{t("reportContent")}</DropdownMenuItem>
                {isOwnPost && (
                  <>
                    <CreatePostDialog
                      key={post._id}
                      trigger={
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault(); // Ngăn dropdown tự động đóng
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          {t("edit")}
                        </DropdownMenuItem>
                      }
                      initialThread={post}
                      isEditing={true}
                      setIsDropdownOpen={setIsDropdownOpen}
                    />

                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t("delete")}
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
                  //   ? TRANSLATIONS[post.id as keyof typeof TRANSLATIONS] ||
                  //     post.content
                  //   :
                  post.content
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
                  files={post.media.map((img) => ({
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
              variant="ghost"
              size="sm"
              className={`flex items-center space-x-1 ${
                post.isLiked ? "text-red-500" : ""
              }`}
              // onClick={handleLike}
            >
              <Heart size={18} className={isLiked ? "fill-red-500" : ""} />
              <span>{post.reactionNum}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1"
              onClick={handleDirectDetail}
            >
              <MessageCircle size={18} />
              <span>{post.commentNum}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center space-x-1 ${
                isReposted ? "text-green-500" : ""
              }`}
              // onClick={handleRepost}
            >
              <Repeat
                size={18}
                className={isReposted ? "fill-green-500" : ""}
              />
              <span>{post.sharedNum}</span>
            </Button>
          </div>
        </div>
      </div>
      {/* Delete confirmation dialog */}
      <DeletePostDialog
        thread={post}
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
}
