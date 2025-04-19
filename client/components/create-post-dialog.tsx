"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLanguage } from "@/components/language-provider";
import ImageList from "./posts/image-list";
import { Visibility } from "@/enums/ThreadEnum";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IThread } from "@/interfaces/thread";
import { useCreateThread } from "@/hooks/api/use-thread";
import { useToast } from "@/hooks/use-toast";
import { useDispatch } from "react-redux";
import { add } from "date-fns";
import { addThread } from "@/store/profile-thread-slice";
import { useUserContext } from "@/contexts/userContext";

interface CreatePostDialogProps {
  trigger: React.ReactNode;
  initialThread?: IThread;
  isEditing?: boolean;
}

export default function CreatePostDialog({
  trigger,
  initialThread,
  isEditing = false,
}: CreatePostDialogProps) {
  const [content, setContent] = useState(initialThread?.content || "");
  const [images, setImages] = useState<(File | { url: string })[]>(
    initialThread?.media || []
  );
  const [privacy, setPrivacy] = useState<Visibility>(
    initialThread?.visibility || Visibility.PUBLIC
  );
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { user } = useUserContext();

  // Update state when props change (useful for edit mode)
  // useEffect(() => {
  //   if (initialContent) setContent(initialContent);
  //   if (initialImages && initialImages.length > 0) setImages(initialImages);
  //   if (initialPrivacy) setPrivacy(initialPrivacy);
  // }, [initialContent, initialImages, initialPrivacy]);

  const { mutate: createThread, isPending } = useCreateThread();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setImages([...images, ...newFiles]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() && images.length === 0) {
      toast({
        title: t("error"),
        description: t("post_empty"),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      createThread(
        {
          content,
          visibility: privacy,
          media: images as File[], // Cast to File[] for the API
          parentThreadId: initialThread?.parentThreadId || null,
        },
        {
          onSuccess: (data) => {
            dispatch(addThread(data));
            toast({
              title: t("success"),
              description: t("post_created"),
              variant: "default",
            });
            setContent("");
            setImages([]);
            setPrivacy(Visibility.PUBLIC);
            setOpen(false);
          },
          onError: (error) => {
            toast({
              title: t("error"),
              description: t("post_create_failed"),
              variant: "destructive",
            });
          },
        }
      );
    } catch (error) {
      console.error("Error submitting post:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? t("edit") : t("create")}</DialogTitle>
        </DialogHeader>
        {/* <div className="flex flex-col space-y-4"> */}
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
        {/* </div> */}

        <Select
          value={privacy}
          onValueChange={(value) => {
            setPrivacy(value as Visibility);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("select_privacy")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={Visibility.PUBLIC}>{t("public")}</SelectItem>
            <SelectItem value={Visibility.FOLLOWER_ONLY}>
              {t("followers_only")}
            </SelectItem>
            <SelectItem value={Visibility.PRIVATE}>{t("only_me")}</SelectItem>
          </SelectContent>
        </Select>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="flex items-start space-x-4">
            <Image
              src={user?.avatar || "/default-avatar.png"}
              alt="User avatar"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div className="flex-1 space-y-4">
              <Textarea
                placeholder={`${t("post")} something...`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
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
                  type="submit"
                  disabled={
                    loading ||
                    isPending ||
                    (!content.trim() && images.length === 0)
                  }
                >
                  {loading || isPending
                    ? isEditing
                      ? "Updating..."
                      : "Posting..."
                    : isEditing
                    ? t("update")
                    : t("post")}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
