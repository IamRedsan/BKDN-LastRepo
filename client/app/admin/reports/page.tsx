'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Eye,
  Ban,
  CheckCircle,
  AlertTriangle,
  Lock,
  Globe,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IThread } from '@/interfaces/thread';
import { Status, Visibility } from '@/enums/ThreadEnum';
import PostCard from '@/components/posts/post-card';
import { useLanguage } from '@/components/language-provider';
import { useReportedThreads } from '@/hooks/api/use-admin';
import { useFormatTime } from '@/utils/myFormatDistanceToNow';

export default function ReportsPage() {
  const { data: initialThreads = [], isLoading } = useReportedThreads();
  const [threads, setThreads] = useState<IThread[]>([]);
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reportCountFilter, setReportCountFilter] = useState('all');
  const [selectedThread, setSelectedThread] = useState<IThread | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'ban' | 'approve'>('ban');
  const { formatTimeToNow } = useFormatTime();

  // Filter threads based on search query, status, and report count
  const filteredThreads = threads.filter((thread) => {
    // Search filter
    const matchesSearch =
      thread.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.user.username.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'pending' && thread.status === Status.PENDING) ||
      (statusFilter === 'approved' && thread.status === Status.CREATING) ||
      (statusFilter === 'banned' && thread.status === Status.HIDE);

    // Report count filter
    const matchesReportCount =
      reportCountFilter === 'all' ||
      (reportCountFilter === 'low' &&
        thread.reportedNum >= 1 &&
        thread.reportedNum <= 3) ||
      (reportCountFilter === 'medium' &&
        thread.reportedNum >= 4 &&
        thread.reportedNum <= 7) ||
      (reportCountFilter === 'high' && thread.reportedNum >= 8);

    return matchesSearch && matchesStatus && matchesReportCount;
  });

  // Sort threads by report count (highest first)
  const sortedThreads = [...filteredThreads].sort(
    (a, b) => b.reportedNum - a.reportedNum
  );

  const handleAction = (threadId: string, action: 'ban' | 'approve') => {
    setThreads(
      threads.map((thread) =>
        thread._id === threadId
          ? {
              ...thread,
              status: action === 'ban' ? Status.HIDE : Status.CREATE_DONE,
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
            <AlertTriangle className="h-3 w-3" /> {t('pendingReview')}
          </Badge>
        );
      case Status.CREATING:
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> {t('creating')}
          </Badge>
        );
      case Status.CREATE_DONE:
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> {t('create_done')}
          </Badge>
        );
      case Status.HIDE:
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <Ban className="h-3 w-3" /> {t('hide')}
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
            <Globe className="h-3 w-3" /> {t('public')}
          </Badge>
        );
      case Visibility.PRIVATE:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Lock className="h-3 w-3" /> {t('only_me')}
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
    return date;
  };

  useEffect(() => {
    if (initialThreads && initialThreads !== threads) {
      setThreads(initialThreads);
    }
  }, [initialThreads, threads]);

  if (isLoading) {
    return <div>{t('loading')}</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('reportedPosts')}</h1>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('search')}
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="w-full md:w-1/3">
          <label className="text-sm font-medium mb-1 block">
            {t('statusFilter')}
          </label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder={t('filterByStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allStatuses')}</SelectItem>
              <SelectItem value="pending">{t('pendingReview')}</SelectItem>
              <SelectItem value="approved">{t('approved')}</SelectItem>
              <SelectItem value="banned">{t('banned')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-1/3">
          <label className="text-sm font-medium mb-1 block">
            {t('reportCount')}
          </label>
          <Select
            value={reportCountFilter}
            onValueChange={setReportCountFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('filterByReportCount')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allReports')}</SelectItem>
              <SelectItem value="low">{t('lowReport')}</SelectItem>
              <SelectItem value="medium">{t('mediumReport')}</SelectItem>
              <SelectItem value="high">{t('highReport')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('author')}</TableHead>
              <TableHead>{t('contentPreview')}</TableHead>
              <TableHead>{t('reportCount')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead>{t('visibility')}</TableHead>
              <TableHead>{t('date')}</TableHead>
              <TableHead>{t('action')}</TableHead>
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
                        ? 'destructive'
                        : thread.reportedNum >= 4
                        ? 'default'
                        : 'outline'
                    }
                  >
                    {thread.reportedNum} reports
                  </Badge>
                </TableCell>
                <TableCell>{getStatusBadge(thread.status)}</TableCell>
                <TableCell>{getVisibilityBadge(thread.visibility)}</TableCell>
                <TableCell>
                  {formatTimeToNow(new Date(thread.createdAt))}
                </TableCell>
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
                      {t('view')}
                    </Button>
                    <>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedThread(thread);
                          setActionType('ban');
                          setActionDialogOpen(true);
                        }}
                      >
                        <Ban className="h-4 w-4 mr-1" />
                        {t('ban')}
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          setSelectedThread(thread);
                          setActionType('approve');
                          setActionDialogOpen(true);
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {t('approve')}
                      </Button>
                    </>
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
            <DialogTitle>{t('viewReportedPost')}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {selectedThread && <PostCard post={selectedThread} />}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              {t('close')}
            </Button>
            <>
              <Button
                variant="destructive"
                onClick={() => {
                  setViewDialogOpen(false);
                  setActionType('ban');
                  setActionDialogOpen(true);
                }}
              >
                {t('banPost')}
              </Button>
              <Button
                onClick={() => {
                  setViewDialogOpen(false);
                  setActionType('approve');
                  setActionDialogOpen(true);
                }}
              >
                {t('approvePost')}
              </Button>
            </>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'ban' ? t('banPost') : t('approvePost')}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'ban'
                ? t('banPostConfirmation')
                : t('approvePostConfirmation')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialogOpen(false)}
            >
              {t('cancel')}
            </Button>
            <Button
              variant={actionType === 'ban' ? 'destructive' : 'default'}
              onClick={() =>
                handleAction(selectedThread?._id || '', actionType)
              }
            >
              {actionType === 'ban' ? t('banPost') : t('approvePost')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
