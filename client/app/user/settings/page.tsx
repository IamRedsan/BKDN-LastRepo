'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, Palette, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/components/theme-provider';
import { useLanguage } from '@/components/language-provider';
import {
  useUpdateUserSetting,
  useUpdateUserPassword,
} from '@/hooks/api/use-user';
import { Language } from '@/enums/Language';
import { Theme } from '@/enums/Theme';
import { useToast } from '@/hooks/use-toast';
import { useUserContext } from '@/contexts/userContext';

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { user } = useUserContext();
  const { toast } = useToast();

  // Settings
  const [loading, setLoading] = useState(false);
  const { mutate: updateUserSetting } = useUpdateUserSetting();

  // Password
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const { mutate: updateUserPassword } = useUpdateUserPassword();

  // Save theme/language
  const handleSave = () => {
    setLoading(true);
    updateUserSetting(
      { theme, language },
      {
        onSuccess: () => {
          toast({
            title: t('success'),
            description: t('settingUpdated'),
          });
          setLoading(false);
        },
        onError: () => {
          toast({
            title: t('error'),
          });
          setLoading(false);
        },
      }
    );
  };

  // Change theme/language (UI only)
  const handleThemeChange = (newTheme: string) => setTheme(newTheme as Theme);
  const handleLanguageChange = (newLanguage: string) =>
    setLanguage(newLanguage as Language);

  // Change password
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      toast({
        title: t('error'),
        description: t('emptyFields'),
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: t('error'),
        description: t('passwordMustMatch'),
        variant: 'destructive',
      });
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
    if (!passwordRegex.test(passwordData.newPassword)) {
      toast({
        title: t('error'),
        description: t('passwordRequirements'),
        variant: 'destructive',
      });
      return;
    }

    setIsPasswordLoading(true);
    updateUserPassword(
      {
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        rePassword: passwordData.confirmPassword,
      },
      {
        onSuccess: (data) => {
          if (data) {
            toast({
              title: t('success'),
              description: t('passwordChanged'),
            });
            setPasswordData({
              currentPassword: '',
              newPassword: '',
              confirmPassword: '',
            });
          } else {
            toast({
              title: t('error'),
              description: t('passwordChangeFailed'),
            });
          }
          setIsPasswordLoading(false);
        },
        onError: () => {
          toast({
            title: t('error'),
            description: t('passwordChangeFailed'),
          });
          setIsPasswordLoading(false);
        },
      }
    );
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">{t('settings')}</h1>
      <Tabs defaultValue="theme" className="w-full">
        <TabsList
          className={`grid grid-cols-${user?.havePassword ? '3' : '2'} mb-8`}
        >
          <TabsTrigger value="theme" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            {t('theme')}
          </TabsTrigger>
          <TabsTrigger value="language" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            {t('language')}
          </TabsTrigger>
          {user?.havePassword && (
            <TabsTrigger value="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              {t('password')}
            </TabsTrigger>
          )}
        </TabsList>

        {/* Theme Tab */}
        <TabsContent value="theme">
          <Card>
            <CardHeader>
              <CardTitle>{t('themePreferences')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">{t('selectTheme')}</Label>
                <Select value={theme} onValueChange={handleThemeChange}>
                  <SelectTrigger id="theme">
                    <SelectValue placeholder={t('selectThemePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Theme.Light}>
                      {t('lightTheme')}
                    </SelectItem>
                    <SelectItem value={Theme.Dark}>{t('darkTheme')}</SelectItem>
                    <SelectItem value={Theme.System}>
                      {t('systemTheme')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('save')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Language Tab */}
        <TabsContent value="language">
          <Card>
            <CardHeader>
              <CardTitle>{t('languageSettings')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">{t('selectLanguage')}</Label>
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder={t('selectLanguagePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Language.English}>
                      {t('english')}
                    </SelectItem>
                    <SelectItem value={Language.Vietnamese}>
                      {t('vietnamese')}
                    </SelectItem>
                    <SelectItem value={Language.Japanese}>
                      {t('japanese')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('save')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Password Tab */}
        {user?.havePassword && (
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>{t('changePassword')}</CardTitle>
              </CardHeader>
              <form onSubmit={handlePasswordChange}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">
                      {t('currentPassword')}
                    </Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          currentPassword: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">{t('newPassword')}</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      {t('confirmPassword')}
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isPasswordLoading}>
                    {isPasswordLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {t('changePassword')}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
