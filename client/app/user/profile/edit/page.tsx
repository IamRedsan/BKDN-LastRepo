'use client';

import type React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Camera, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import MainLayout from '@/components/layouts/main-layout';
import { useLanguage } from '@/components/language-provider';
import { useUserContext } from '@/contexts/userContext';
import {
  useUpdateUserAvatar,
  useUpdateUserInfo,
  useUpdateWallpaper,
} from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import { useLoading } from '@/hooks/use-loading';

export default function EditProfilePage() {
  const { user, setUser } = useUserContext();
  const [profileData, setProfileData] = useState({
    name: user?.name ?? '',
    username: user?.username ?? '',
    bio: user?.bio ?? '',
    avatar: user?.avatar ?? '',
    wallpaper: user?.wallpaper ?? '',
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();
  const { mutate: updateUserAvatar } = useUpdateUserAvatar();
  const { mutate: updateUserWallpaper } = useUpdateWallpaper();
  const { mutate: updateUserInfo } = useUpdateUserInfo();
  const { toast } = useToast();
  const { withLoading } = useLoading();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!profileData.name || !profileData.username) {
      toast({
        title: t('error'),
        description: t('nameAndUsernameRequired'),
      });
      setLoading(false);
      return;
    }

    updateUserInfo(profileData, {
      onSuccess: (data) => {
        setUser(data);
        toast({
          title: t('success'),
          description: t('profileUpdated'),
        });
        setLoading(false);
      },
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message,
        });
        setLoading(false);
      },
    });

    // TODO: Gọi API để cập nhật thông tin (name, username, bio,...)

    setTimeout(() => {
      setLoading(false);
      router.push('/user/profile');
    }, 1500);
  };

  const handleAvatarChange = async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);

    updateUserAvatar(formData, {
      onSuccess: (data) => {
        setUser(data);
        setProfileData((prevState) => ({
          ...prevState,
          avatar: data.avatar, // Cập nhật avatar trong state
        }));
        setLoading(false);
        toast({
          title: t('success'),
          description: t('avatarUpdated'),
        });
      },
      onError: (eror) => {
        toast({
          title: t('error'),
          description: t('avatarUpdateFailed'),
        });
      },
    });
  };

  const handleWallpaperChange = async (file: File) => {
    const formData = new FormData();
    formData.append('wallpaper', file);

    updateUserWallpaper(formData, {
      onSuccess: (data) => {
        setUser(data);
        setProfileData((prevState) => ({
          ...prevState,
          wallpaper: data.wallpaper, // Cập nhật wallpaper trong state
        }));
        setLoading(false);
        toast({
          title: t('success'),
          description: t('wallpaperUpdated'),
        });
      },
      onError: () => {
        toast({
          title: t('error'),
          description: t('wallpaperUpdateFailed'),
        });
      },
    });
  };

  const pickImage = async (type: 'avatar' | 'wallpaper') => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.click();

      input.onchange = async () => {
        if (input.files && input.files[0]) {
          const file = input.files[0];
          setLoading(true);
          toast({
            title: t('loading_image'),
            description: t('uploading'),
          });
          if (type === 'wallpaper') {
            await handleWallpaperChange(file);
          } else {
            await handleAvatarChange(file);
          }
        }
      };
    } catch (error) {
      console.error('Error picking image:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể chọn ảnh. Vui lòng thử lại.',
      });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof typeof profileData
  ) => {
    setProfileData((prevState) => ({
      ...prevState,
      [field]: e.target.value,
    }));
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t('editProfile')}</h1>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <div className="h-48 w-full overflow-hidden rounded-lg bg-muted">
                <Image
                  src={profileData.wallpaper || '/placeholder.svg'}
                  alt="Profile banner"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                  <label htmlFor="wallpaper-upload" className="cursor-pointer">
                    <Button
                      variant="secondary"
                      onClick={() => pickImage('wallpaper')}
                      size="icon"
                      type="button"
                    >
                      <Camera size={20} />
                    </Button>
                  </label>
                </div>
              </div>

              <div className="absolute -bottom-16 left-4 h-32 w-32 overflow-hidden rounded-full border-4 border-background">
                <Image
                  src={profileData.avatar || '/placeholder.svg'}
                  alt="Profile avatar"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                  <label htmlFor="avatar-upload" className="cursor-pointer">
                    <Button
                      onClick={() => pickImage('avatar')}
                      variant="secondary"
                      size="icon"
                      type="button"
                    >
                      <Camera size={20} />
                    </Button>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-12 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('displayName')}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => handleInputChange(e, 'name')}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">{t('username')}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-muted-foreground">
                    @
                  </span>
                  <Input
                    id="username"
                    value={profileData.username}
                    onChange={(e) => handleInputChange(e, 'username')}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">{t('bio')}</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => handleInputChange(e, 'bio')}
                  rows={4}
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button type="submit" disabled={loading} onClick={handleSave}>
              {loading ? t('saving') : t('save')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/user/profile')}
            >
              {t('cancel')}
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
