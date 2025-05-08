"use client";

import { useEffect, useRef, useCallback } from "react";
import { useGetFeedThreads } from "@/hooks/api/use-thread";
import PostCard from "@/components/posts/post-card";
import { Loader2, Users, PlusCircle, RefreshCw } from "lucide-react";
import type { IThread } from "@/interfaces/thread";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";
import CreatePostDialog from "../posts/create-post-dialog";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { setFeedThreads } from "@/store/feed-slice";

export default function FeedPage() {
  const { t } = useLanguage();
  const dispatch = useDispatch<AppDispatch>();

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useGetFeedThreads();

  const threads = useSelector((state: RootState) => state.feed.threads);
  // Sync query result to Redux store
  useEffect(() => {
    if (data?.pages) {
      const flatThreads: IThread[] = data.pages.flat();
      dispatch(setFeedThreads(flatThreads));
    }
  }, [data?.pages, dispatch]);

  // Intersection observer
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || isFetchingNextPage || !hasNextPage) return;

      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting && hasNextPage) {
            fetchNextPage();
          }
        },
        { threshold: 0.5 }
      );

      if (node) observerRef.current.observe(node);
    },
    [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  // Loading state
  if (isLoading && threads.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t("feed")}</h1>
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">{t("feed_loading")}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!isLoading && threads.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t("feed")}</h1>
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="bg-accent/30 rounded-full p-6 mb-6">
            <Users className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">{t("feed_empty")}</h2>
          <p className="text-muted-foreground max-w-md mb-8">
            {t("feed_empty_description")}
          </p>

          <div className="grid gap-4 sm:grid-cols-2 w-full max-w-md">
            <Link href="/user/search" className="w-full">
              <Button variant="default" className="w-full gap-2">
                <Users className="h-4 w-4" />
                <span>{t("find_people_follow")}</span>
              </Button>
            </Link>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => refetch()}
            >
              <RefreshCw className="h-4 w-4" />
              <span>{t("refetch_feed")}</span>
            </Button>
          </div>

          <div className="mt-8 pt-8 border-t w-full max-w-md">
            <CreatePostDialog
              key="create"
              trigger={
                <Button variant="secondary" className="w-full gap-2">
                  <PlusCircle className="h-4 w-4" />
                  <span>{t("create_first_post")}</span>
                </Button>
              }
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-bold">{t("feed")}</h1>

      <div className="space-y-4">
        {threads.map((thread) => (
          <PostCard key={thread._id} post={thread} />
        ))}

        <div
          ref={loadMoreRef}
          className="h-20 flex items-center justify-center"
        >
          {isFetchingNextPage && (
            <div className="flex flex-col items-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">{t("loading")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
