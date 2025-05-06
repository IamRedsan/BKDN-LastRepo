"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, UserX, FileX, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/components/language-provider";
import { useFollowTrigger } from "@/hooks/api/use-action";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import {
  setMode,
  setQueryUser,
  setQueryThread,
  setUsers,
  setThreads,
} from "@/store/search-slice";
import { client } from "@/shared/axiosClient";
import PostCard from "@/components/posts/post-card";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { fi } from "date-fns/locale";
import { Language } from "@/enums/Language";

export default function SearchPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { mode, queryUser, queryThread, users, threads } = useSelector(
    (state: RootState) => state.search
  );
  const [hasUserTyped, setHasUserTyped] = useState(false);
  const { t, language } = useLanguage();
  const { mutate: followTrigger } = useFollowTrigger();
  const [loadingUser, setLoadingUser] = useState(false);
  const [loadingThread, setLoadingThread] = useState(false);
  const debouncedUserQuery = useDebounce(queryUser, 300);
  const debouncedThreadQuery = useDebounce(queryThread, 300);

  const isLoading = mode === "user" ? loadingUser : loadingThread;

  // Dynamic placeholder based on search mode
  const getPlaceholder = () => {
    if (mode === "user") {
      return `${t("search_user")}`;
    } else {
      return `${t("search_post")}`;
    }
  };

  useEffect(() => {
    if (mode !== "user" || !debouncedUserQuery.trim() || !hasUserTyped) return;

    const fetchUsers = async () => {
      setLoadingUser(true);
      try {
        const response = await client.get("/user/search", {
          params: { query: debouncedUserQuery.trim() },
        });
        dispatch(setUsers(response.data));
      } catch (error) {
        console.error("Search user error:", error);
        dispatch(setUsers([]));
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUsers();
  }, [debouncedUserQuery, mode, hasUserTyped, dispatch]);

  useEffect(() => {
    if (mode !== "thread" || !debouncedThreadQuery.trim() || !hasUserTyped)
      return;

    const fetchThreads = async () => {
      setLoadingThread(true);
      try {
        const response = await client.get("/thread/search", {
          params: { query: debouncedThreadQuery.trim() },
        });
        dispatch(setThreads(response.data));
      } catch (error) {
        console.error("Search thread error:", error);
        dispatch(setThreads([]));
      } finally {
        setLoadingThread(false);
      }
    };

    fetchThreads();
  }, [debouncedThreadQuery, mode, hasUserTyped, dispatch]);

  const handleFollowToggle = (username: string) => {
    followTrigger(username, {
      onSuccess: () => {
        dispatch(
          setUsers(
            users.map((u) =>
              u.username === username
                ? { ...u, isFollowing: !u.isFollowing }
                : u
            )
          )
        );
      },
    });
  };

  useEffect(() => {
    setHasUserTyped(false);
  }, [mode]);

  // Render empty state with icon
  const renderEmptyState = () => {
    const query = mode === "user" ? debouncedUserQuery : debouncedThreadQuery;
    const hasQuery = !!query.trim() && hasUserTyped;

    if (mode === "user") {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <UserX className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground font-medium">
            {hasQuery
              ? language === Language.Japanese
                ? `"${query}  ${t("no_user_found_for")}"`
                : `${t("no_user_found_for")} "${query}"`
              : `${t("search_user")}`}
          </p>
          {hasQuery && (
            <p className="text-sm text-muted-foreground mt-2">
              {t("try_search_different_keywords")}
            </p>
          )}
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileX className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground font-medium">
            {hasQuery
              ? language === Language.Japanese
                ? `"${query}  ${t("no_post_found_for")}"`
                : `${t("no_post_found_for")} "${query}"`
              : `${t("search_post")}`}
          </p>
          {hasQuery && (
            <p className="text-sm text-muted-foreground mt-2">
              {t("try_search_different_keywords")}
            </p>
          )}
        </div>
      );
    }
  };

  return (
    <div>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t("search")}</h1>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex items-center space-x-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder={getPlaceholder()}
              value={mode === "user" ? queryUser : queryThread}
              onChange={(e) => {
                setHasUserTyped(true);
                mode === "user"
                  ? dispatch(setQueryUser(e.target.value))
                  : dispatch(setQueryThread(e.target.value));
              }}
              className="pl-10"
            />
          </div>
          <Button
            type="button"
            onClick={() => {
              if (mode === "user") {
                if (queryUser.trim()) {
                  setHasUserTyped(true);
                  dispatch(setQueryUser(queryUser.trim()));
                }
              } else if (mode === "thread") {
                if (queryThread.trim()) {
                  setHasUserTyped(true);
                  dispatch(setQueryThread(queryThread.trim()));
                }
              }
            }}
          >
            {t("search")}
          </Button>
        </form>

        <Tabs
          defaultValue={mode}
          onValueChange={(value) =>
            dispatch(setMode(value as "user" | "thread"))
          }
        >
          <TabsList className="w-full">
            <TabsTrigger value="user" className="flex-1">
              {t("user")}
            </TabsTrigger>
            <TabsTrigger value="thread" className="flex-1">
              {t("post")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="user" className="space-y-4 mt-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-muted-foreground">{t("searching_user")}</p>
              </div>
            ) : users.length === 0 ? (
              renderEmptyState()
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.username}
                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent/10"
                  >
                    <div className="flex items-center space-x-4">
                      <Link href={`/user/profile/${user.username}`}>
                        <div className="relative h-12 w-12 overflow-hidden rounded-full border">
                          <Image
                            src={
                              user.avatar ||
                              "/placeholder.svg?height=48&width=48"
                            }
                            alt={user.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/user/profile/${user.username}`}
                          className="font-medium hover:underline line-clamp-1"
                        >
                          {user.name}
                        </Link>
                        <p className="text-muted-foreground text-sm">
                          @{user.username}
                        </p>
                        {user.bio && (
                          <p className="text-sm line-clamp-1 mt-1">
                            {user.bio}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant={user.isFollowing ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleFollowToggle(user.username)}
                      className={cn(
                        "ml-4 whitespace-nowrap",
                        user.isFollowing &&
                          "border-primary text-primary hover:bg-primary/10"
                      )}
                    >
                      {user.isFollowing ? t("following") : t("follow")}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="thread" className="space-y-4 mt-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-muted-foreground">{t("searching_post")}</p>
              </div>
            ) : threads.length === 0 ? (
              renderEmptyState()
            ) : (
              threads.map((thread) => (
                <PostCard key={thread._id} post={thread} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
