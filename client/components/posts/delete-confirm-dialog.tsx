"use client";

import { useState } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/components/language-provider";
import { useLoading } from "@/hooks/use-loading";
import { IThread } from "@/interfaces/thread";
import { useDeleteThread } from "@/hooks/api/use-thread";
import { useToast } from "@/hooks/use-toast";
import { useDispatch } from "react-redux";
import { deleteThread } from "@/store/profile-thread-slice";

interface DeletePostDialogProps {
  thread: IThread;
  isOpen: boolean;
  onClose: () => void;
  // onDelete: (postId: string) => void;
}

export default function DeletePostDialog({
  thread,
  isOpen,
  onClose,
}: // onDelete,
DeletePostDialogProps) {
  const { t } = useLanguage();
  const { withLoading } = useLoading();
  const [isDeleting, setIsDeleting] = useState(false);
  const { mutate: deleteThreadAPI, isPending } = useDeleteThread();
  const { toast } = useToast();
  const dispatch = useDispatch();

  const handleDelete = async () => {
    setIsDeleting(true);

    await withLoading(
      async () => {
        // Simulate API call to delete post
        // await new Promise((resolve) => setTimeout(resolve, 1000));
        // onDelete(thread._id);
        deleteThreadAPI(thread._id, {
          onSuccess: () => {
            dispatch(deleteThread(thread._id));
            toast({
              title: t("success"),
              description: t("post_deleted"),
            });
          },
          onError: () => {
            toast({
              title: t("error"),
              description: t("post_delete_failed"),
            });
          },
        });
        onClose();
      },
      {
        message: `${t("delete")}ing post...`,
      }
    );

    setIsDeleting(false);
  };

  const formattedDate = formatDistanceToNow(new Date(thread.createdAt), {
    addSuffix: true,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {t("delete")} Post
          </DialogTitle>
          <DialogDescription>
            {t("delete")} this post? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {/* Post preview */}
        <div className="rounded-md border bg-muted/50 p-4">
          <div className="flex items-start space-x-4">
            <Image
              src={thread.user.avatar || "/placeholder.svg"}
              alt={thread.user.name}
              width={40}
              height={40}
              className="rounded-full"
            />
            <div className="flex-1 space-y-1">
              <div className="flex items-center">
                <span className="font-medium">{thread.user.name}</span>
                <span className="text-muted-foreground ml-1">
                  @{thread.user.username}
                </span>
              </div>
              <p className="text-sm line-clamp-2">{thread.content}</p>
              <div className="text-xs text-muted-foreground">
                {formattedDate}
                {thread.updatedAt && <span> · {t("edit")}</span>}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            {t("cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? `${t("delete")}ing...` : t("delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
