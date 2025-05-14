'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  Ban,
  CheckCircle,
  Search,
  ExternalLink,
  Globe,
  Moon,
  Sun,
  Monitor,
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
import { Theme } from '@/enums/Theme';
import { Language } from '@/enums/Language';
import { Role } from '@/enums/Role';
import { useLanguage } from '@/components/language-provider';
import { useAdminUsers } from '@/hooks/api/use-admin';

export default function UsersPage() {
  const { data: users = [], isLoading } = useAdminUsers();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const { t } = useLanguage();

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBanUser = (username: string) => {
    // Update logic for banning/unbanning users will go here
    setBanDialogOpen(false);
  };

  if (isLoading) {
    return <div>{t('loading')}</div>;
  }

  const getThemeIcon = (theme: Theme) => {
    switch (theme) {
      case Theme.Light:
        return <Sun className="h-4 w-4" />;
      case Theme.Dark:
        return <Moon className="h-4 w-4" />;
      case Theme.System:
        return <Monitor className="h-4 w-4" />;
      default:
        return <Sun className="h-4 w-4" />;
    }
  };

  const getLanguageIcon = (language: Language) => {
    return <Globe className="h-4 w-4" />;
  };

  const getRoleBadge = (role: Role) => {
    return role === Role.ADMIN ? (
      <Badge variant="default" className="bg-purple-500 hover:bg-purple-600">
        {t('admin')}
      </Badge>
    ) : (
      <Badge variant="outline">{t('user')}</Badge>
    );
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('userManagement')}</h1>
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('user')}</TableHead>
              <TableHead>{t('email')}</TableHead>
              <TableHead>{t('role')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead>{t('followers')}</TableHead>
              <TableHead>{t('preferences')}</TableHead>
              <TableHead>{t('action')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.username}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Image
                      src={user.avatar || '/placeholder.svg'}
                      alt={user.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">
                        @{user.username}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{getRoleBadge(user.role as Role)}</TableCell>
                <TableCell>
                  {user.isBanned ? (
                    <Badge variant="destructive">Banned</Badge>
                  ) : (
                    <Badge variant="success">{t('active')}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{user.followersCount} followers</span>
                    <span className="text-sm text-muted-foreground">
                      {user.followingCount} following
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span
                      className="flex items-center gap-1"
                      title={`Theme: ${user.theme}`}
                    >
                      {getThemeIcon(user.theme)}
                    </span>
                    <span
                      className="flex items-center gap-1"
                      title={`Language: ${user.language}`}
                    >
                      {getLanguageIcon(user.language)}
                      {user.language}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Link
                      href={`/user/profile/${user.username}`}
                      target="_blank"
                    >
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        {t('profile')}
                      </Button>
                    </Link>
                    <Button
                      variant={user.isBanned ? 'outline' : 'destructive'}
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setBanDialogOpen(true);
                      }}
                    >
                      {user.isBanned ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {t('unban')}
                        </>
                      ) : (
                        <>
                          <Ban className="h-4 w-4 mr-1" />
                          {t('ban')}
                        </>
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Ban/Unban Confirmation Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedUser?.isBanned ? 'Unban User' : 'Ban User'}
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.isBanned
                ? `Are you sure you want to unban ${selectedUser?.username}?`
                : `Are you sure you want to ban ${selectedUser?.username}? This will prevent them from accessing the platform.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={selectedUser?.isBanned ? 'default' : 'destructive'}
              onClick={() => handleBanUser(selectedUser?.username)}
            >
              {selectedUser?.isBanned ? 'Unban User' : 'Ban User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
