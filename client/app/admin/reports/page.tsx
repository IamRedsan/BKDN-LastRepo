"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Eye,
  Ban,
  CheckCircle,
  AlertTriangle,
  Lock,
  Globe,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockThreads } from "@/lib/mock-data";
import { IThread } from "@/interfaces/thread";
import { Status, Visibility } from "@/enums/ThreadEnum";
import PostCard from "@/components/posts/post-card";

export default function ReportsPage() {
  const [threads, setThreads] = useState(
    mockThreads.filter((thread) => thread.reportedNum > 0)
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reportCountFilter, setReportCountFilter] = useState("all");
  const [selectedThread, setSelectedThread] = useState<IThread | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"ban" | "approve">("ban");

  // Filter threads based on search query, status, and report count
  const filteredThreads = threads.filter((thread) => {
    // Search filter
    const matchesSearch =
      thread.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.user.username.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && thread.status === Status.PENDING) ||
      (statusFilter === "approved" && thread.status === Status.CREATE_DONE) ||
      (statusFilter === "banned" && thread.status === Status.HIDE);

    // Report count filter
    const matchesReportCount =
      reportCountFilter === "all" ||
      (reportCountFilter === "low" &&
        thread.reportedNum >= 1 &&
        thread.reportedNum <= 3) ||
      (reportCountFilter === "medium" &&
        thread.reportedNum >= 4 &&
        thread.reportedNum <= 7) ||
      (reportCountFilter === "high" && thread.reportedNum >= 8);

    return matchesSearch && matchesStatus && matchesReportCount;
  });

  // Sort threads by report count (highest first)
  const sortedThreads = [...filteredThreads].sort(
    (a, b) => b.reportedNum - a.reportedNum
  );

  const handleAction = (threadId: string, action: "ban" | "approve") => {
    setThreads(
      threads.map((thread) =>
        thread._id === threadId
          ? {
              ...thread,
              status: action === "ban" ? Status.HIDE : Status.CREATE_DONE,
            }
          : thread
      )
    );
    setActionDialogOpen(false);
  };

  const getStatusBadge = (status: Status) => {
    switch (status) {
      case Status.PENDING:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Pending Review
          </Badge>
        );
      case Status.CREATE_DONE:
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Approved
          </Badge>
        );
      case Status.HIDE:
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <Ban className="h-3 w-3" /> Banned
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getVisibilityBadge = (visibility: Visibility) => {
    switch (visibility) {
      case Visibility.PUBLIC:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Globe className="h-3 w-3" /> Public
          </Badge>
        );
      case Visibility.PRIVATE:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Lock className="h-3 w-3" /> Private
          </Badge>
        );
      case Visibility.FOLLOWER_ONLY:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="h-3 w-3" /> Followers Only
          </Badge>
        );
      default:
        return <Badge variant="outline">{visibility}</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reported Posts</h1>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="w-full md:w-1/3">
          <label className="text-sm font-medium mb-1 block">
            Status Filter
          </label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-1/3">
          <label className="text-sm font-medium mb-1 block">Report Count</label>
          <Select
            value={reportCountFilter}
            onValueChange={setReportCountFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by report count" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reports</SelectItem>
              <SelectItem value="low">Low (1-3)</SelectItem>
              <SelectItem value="medium">Medium (4-7)</SelectItem>
              <SelectItem value="high">High (8+)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Author</TableHead>
              <TableHead>Content Preview</TableHead>
              <TableHead>Report Count</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedThreads.map((thread) => (
              <TableRow key={thread._id}>
                <TableCell className="font-medium">
                  {thread.user.username}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {thread.content}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      thread.reportedNum >= 8
                        ? "destructive"
                        : thread.reportedNum >= 4
                        ? "default"
                        : "outline"
                    }
                  >
                    {thread.reportedNum} reports
                  </Badge>
                </TableCell>
                <TableCell>{getStatusBadge(thread.status)}</TableCell>
                <TableCell>{getVisibilityBadge(thread.visibility)}</TableCell>
                <TableCell>{formatDate(thread.createdAt)}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedThread(thread);
                        setViewDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    {thread.status === Status.PENDING && (
                      <>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedThread(thread);
                            setActionType("ban");
                            setActionDialogOpen(true);
                          }}
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          Ban
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            setSelectedThread(thread);
                            setActionType("approve");
                            setActionDialogOpen(true);
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* View Post Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>View Reported Post</DialogTitle>
            <DialogDescription>
              This post has been reported {selectedThread?.reportedNum} times
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {selectedThread && <PostCard post={selectedThread} />}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
            {selectedThread?.status === Status.PENDING && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setViewDialogOpen(false);
                    setActionType("ban");
                    setActionDialogOpen(true);
                  }}
                >
                  Ban Post
                </Button>
                <Button
                  onClick={() => {
                    setViewDialogOpen(false);
                    setActionType("approve");
                    setActionDialogOpen(true);
                  }}
                >
                  Approve Post
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "ban" ? "Ban Post" : "Approve Post"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "ban"
                ? "Are you sure you want to ban this post? This will hide it from all users."
                : "Are you sure you want to approve this post? This will dismiss the reports."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant={actionType === "ban" ? "destructive" : "default"}
              onClick={() =>
                handleAction(selectedThread?._id || "", actionType)
              }
            >
              {actionType === "ban" ? "Ban Post" : "Approve Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
