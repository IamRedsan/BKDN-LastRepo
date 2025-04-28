"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Search,
  PlusSquare,
  Bell,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";
import CreatePostDialog from "@/components/posts/create-post-dialog";
import { useEffect, useRef } from "react";
import { useLogout } from "@/hooks/api/use-auth";
import { useUserContext } from "@/contexts/userContext";
import { useNotification } from "@/contexts/notifContext";
import { cn } from "@/lib/utils";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const prevOpenState = useRef(open);
  const { mutate: logout } = useLogout();
  const router = useRouter();
  const { user, removeUser } = useUserContext(); // Lấy user từ context
  const { notReadCount } = useNotification();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        removeUser();
        router.push("/auth/login");
      },
    });
  };

  // Track when the open state actually changes for animations
  useEffect(() => {
    prevOpenState.current = open;
  }, [open]);

  const navItems = [
    { icon: Home, label: t("home"), href: "/user" },
    { icon: Search, label: t("search"), href: "/user/search" },
    {
      icon: PlusSquare,
      label: t("create"),
      href: "#",
      isCreate: true,
    },
    {
      icon: Bell,
      label: t("notifications"),
      href: "/user/notifications",
      hasNotification: notReadCount > 0,
    },
    {
      icon: User,
      label: t("profile"),
      href: `/user/profile/${user?.username ?? ""}`,
    },
  ];

  return (
    <aside className="h-full bg-background border-r flex flex-col">
      <div className="flex items-center justify-between p-4">
        {open && <h1 className="text-2xl font-bold ml-4">Redsan</h1>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(!open)}
          className="ml-auto"
        >
          {open ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </Button>
      </div>

      <div className="flex-1 flex flex-col justify-center p-4">
        <nav className="space-y-6">
          {navItems.map((item) =>
            item.isCreate ? (
              <CreatePostDialog
                key="create"
                trigger={
                  <button
                    className={`flex items-center ${
                      open ? "justify-start px-3" : "justify-center"
                    } py-2 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground w-full`}
                  >
                    <PlusSquare size={22} />
                    {open && item.label && (
                      <span className="ml-3">{item.label}</span>
                    )}
                  </button>
                }
              />
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center ${
                  open ? "justify-start px-3" : "justify-center"
                } py-2 rounded-md transition-colors ${
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <item.icon size={20} />
                {!open && item.hasNotification && (
                  <span
                    className={cn(
                      "absolute ml-4 mb-4 flex h-3 w-3 items-center justify-center rounded-full bg-red-500",
                      "ring-2 ring-background animate-pulse"
                    )}
                  />
                )}
                {open && item.label && (
                  <span className="ml-3">{item.label}</span>
                )}
                {item.hasNotification && open && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white font-medium">
                    {notReadCount > 99 ? "99+" : notReadCount}
                  </span>
                )}
              </Link>
            )
          )}
        </nav>
      </div>

      <div className="p-4 space-y-4">
        <Link
          href="/user/settings"
          className={`flex items-center ${
            open ? "justify-start px-3" : "justify-center"
          } py-2 rounded-md transition-colors ${
            pathname === "/user/settings"
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          <Settings size={20} />
          {open && <span className="ml-3">{t("settings")}</span>}
        </Link>

        <Button
          variant="ghost"
          onClick={handleLogout}
          className={`w-full ${!open ? "justify-center" : "justify-start"}`}
        >
          <LogOut size={20} />
          {open && <span className="ml-3">{t("logout")}</span>}
        </Button>
      </div>
    </aside>
  );
}
