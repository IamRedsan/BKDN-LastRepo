"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusSquare, Bell, User } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import CreatePostDialog from "@/components/posts/create-post-dialog";
import { useUserContext } from "@/contexts/userContext";
import { useNotification } from "@/contexts/notifContext";

export default function MobileNav() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { user } = useUserContext();
  const { notReadCount } = useNotification();

  const navItems = [
    { icon: Home, label: t("home"), href: "/user" },
    { icon: Search, label: t("search"), href: "/user/search" },
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
    <nav className="fixed bottom-0 left-0 z-50 w-full border-t bg-background md:hidden">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center px-3 py-2 ${
              pathname === item.href ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <item.icon size={24} className="mb-1" />
            {item.hasNotification && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
            )}
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}

        <CreatePostDialog
          trigger={
            <button className="flex flex-col items-center justify-center px-3 py-2 text-muted-foreground">
              <PlusSquare size={24} className="mb-1" />
              <span className="text-xs">{t("create")}</span>
            </button>
          }
        />
      </div>
    </nav>
  );
}
