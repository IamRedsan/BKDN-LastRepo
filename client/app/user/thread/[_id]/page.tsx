"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Camera, Heart, MessageCircle, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostSkeleton } from "@/components/loading/post-skeleton";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { useLanguage } from "@/components/language-provider";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { IMedia, IThread } from "@/interfaces/thread";
import { useGetThreadDetail, useCreateThread } from "@/hooks/api/use-thread";
import { useUserContext } from "@/contexts/userContext";
import ImageList from "@/components/posts/image-list";
import { useToast } from "@/hooks/use-toast";
import { Visibility } from "@/enums/ThreadEnum";
import PostCard from "@/components/posts/post-card";

// Mock translations
const TRANSLATIONS = {
  "1": "Just launched my new website! Check it out and let me know what you think. (Translated)",
  "2": "Working on a new project using Next.js and Tailwind CSS. The developer experience is amazing! (Translated)",
  "3": "Beautiful day for a hike! 🏔️ (Translated)",
};

export default function ThreadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { user } = useUserContext();
  const threadId = params._id as string;

  const [thread, setThread] = useState<IThread | null>(null);
  const [parentThread, setParentThread] = useState<IThread | null>(null);
  const [comments, setComments] = useState<IThread[]>([]);
  const [images, setImages] = useState<(File | { url: string })[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isTranslated, setIsTranslated] = useState(false);
  const commentAreaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    data,
    isLoading: isLoadingData,
    isError,
  } = useGetThreadDetail(threadId);
  const { mutate: createThread, isPending: isCreating } = useCreateThread();

  const handleLike = () => {
    setThread((prev) => ({
      ...prev!,
      isLiked: !prev!.isLiked,
      reactionNum: prev!.isLiked
        ? prev!.reactionNum - 1
        : prev!.reactionNum + 1,
    }));
  };

  const handleRepost = () => {
    setThread((prev) => ({
      ...prev!,
      isReThreaded: !prev!.isReThreaded,
      sharedNum: prev!.isReThreaded ? prev!.sharedNum - 1 : prev!.sharedNum + 1,
    }));
  };

  const handleTranslate = () => {
    setIsTranslated(!isTranslated);
  };

  const handleGoBack = () => {
    router.back();
  };

  const handlePostClick = () => {
    // Ref focus
    if (commentAreaRef.current) {
      commentAreaRef.current.focus();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setImages([...images, ...newFiles]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddComment = () => {
    if (!commentText.trim() && images.length === 0) {
      toast({
        title: t("error"),
        description: t("comment_empty"),
        variant: "destructive",
      });
      return;
    }

    createThread(
      {
        content: commentText,
        visibility: thread?.visibility ?? Visibility.PUBLIC,
        media: images as File[],
        parentThreadId: threadId,
      },
      {
        onSuccess: (newComment) => {
          setComments((prev) => [newComment, ...prev]);
          setCommentText("");
          setImages([]);
          toast({
            title: t("success"),
            description: t("comment_created"),
            variant: "default",
          });
        },
        onError: () => {
          toast({
            title: t("error"),
            description: t("comment_create_failed"),
            variant: "destructive",
          });
        },
      }
    );
  };

  useEffect(() => {
    if (data) {
      setThread(data.mainThread);
      setParentThread(data.parentThread);
      setComments(data.comments);
    }
  }, [data]);

  if (isLoadingData) {
    return (
      <div>
        <div className="space-y-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleGoBack}
              className="mr-2"
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-2xl font-bold">Thread</h1>
          </div>
          <PostSkeleton />
          <PostSkeleton />
        </div>
      </div>
    );
  }

  if (isError || !data || !thread) {
    return (
      <div>
        <div className="flex flex-col items-center justify-center py-12">
          <h1 className="text-2xl font-bold">{t("threadNotFound")}</h1>
          <p className="text-muted-foreground mt-2">
            {t("threadNotFoundDescription")}
          </p>
          <Button onClick={handleGoBack} className="mt-6">
            {t("goBack")}
          </Button>
        </div>
      </div>
    );
  }

  // Determine if thread is in a different language than current UI
  // const isDifferentLanguage = thread.language && thread.language !== language;

  return (
    <div>
      <div className="space-y-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleGoBack}
            className="mr-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold">Thread</h1>
        </div>

        <div className="space-y-6">
          {/* Parent Thread (if this is a comment) */}
          {parentThread && (
            <div className="rounded-lg border border-muted bg-muted/30 p-4">
              <div className="flex items-start space-x-4">
                <Link href={`/user/profile/${parentThread.user.username}`}>
                  <Image
                    src={parentThread.user.avatar || "/placeholder.svg"}
                    alt={parentThread.user.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                </Link>
                <div className="flex-1">
                  <div className="flex items-center">
                    <Link
                      href={`/user/profile/${parentThread.user.username}`}
                      className="font-medium hover:underline"
                    >
                      {parentThread.user.name}
                    </Link>
                    <span className="text-muted-foreground ml-1">
                      @{parentThread.user.username}
                    </span>
                  </div>
                  <Link
                    href={`/user/thread/${parentThread._id}`}
                    className="hover:underline"
                  >
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {parentThread.content}
                    </p>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Current Thread */}
          <PostCard post={thread} />

          <Separator />

          {/* Comment Form */}
          <div className="space-y-4">
            {images.length > 0 && (
              <div className="overflow-x-auto mt-2 pb-2 no-scrollbar">
                <div className="flex gap-2 w-max">
                  <ImageList
                    files={images}
                    setFiles={setImages}
                    isEditable={true}
                  />
                </div>
              </div>
            )}
            <div className="flex items-start space-x-4">
              <Image
                src={user?.avatar ?? "/placeholder.svg?height=40&width=40"}
                alt="Current user"
                width={40}
                height={40}
                className="rounded-full"
              />
              <div className="flex-1 space-y-2">
                <Textarea
                  ref={commentAreaRef}
                  placeholder={`${t("comment")}...`}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="resize-none"
                />
                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera size={20} />
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                  <Button
                    onClick={handleAddComment}
                    disabled={
                      isCreating || (!commentText.trim() && images.length === 0)
                    }
                  >
                    {isCreating ? t("posting") : t("post")}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">
              {t("comment")} ({comments.length})
            </h2>

            {comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>{t("no_comment_yet")}</p>
              </div>
            ) : (
              <div className="space-y-4 mt-4">
                {comments.map((comment) => (
                  <PostCard key={comment._id} post={comment} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
