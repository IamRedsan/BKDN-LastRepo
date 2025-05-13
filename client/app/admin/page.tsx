import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, Flag } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>
              View, manage, and moderate user accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Access the list of all users, ban users, and view detailed user
              profiles.
            </p>
            <Link href="/admin/users">
              <Button>Manage Users</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5" />
              Reported Posts
            </CardTitle>
            <CardDescription>
              Review and moderate reported content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              View posts that have been reported by users, review content, and
              take appropriate moderation actions.
            </p>
            <Link href="/admin/reports">
              <Button>Manage Reports</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
