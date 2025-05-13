import type { ReactNode } from "react";
import Link from "next/link";
import { Users, Flag, Home, Settings } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="bg-muted w-full md:w-64 p-4 md:min-h-screen">
        <div className="text-xl font-bold mb-6">Admin Panel</div>
        <nav className="space-y-2">
          <Link
            href="/admin"
            className="flex items-center gap-2 p-2 rounded hover:bg-slate-200"
          >
            <Home className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-2 p-2 rounded hover:bg-slate-200"
          >
            <Users className="h-5 w-5" />
            <span>Users</span>
          </Link>
          <Link
            href="/admin/reports"
            className="flex items-center gap-2 p-2 rounded hover:bg-slate-200"
          >
            <Flag className="h-5 w-5" />
            <span>Reported Posts</span>
          </Link>
          <Link
            href="/admin/settings"
            className="flex items-center gap-2 p-2 rounded hover:bg-slate-200"
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </Link>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 p-4">{children}</div>
    </div>
  );
}
