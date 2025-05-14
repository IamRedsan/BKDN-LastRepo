"use client";

import type React from "react";

import { useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { mockUsers } from "@/lib/mock-data";
import { Loader2, User, Lock, Palette, Globe } from "lucide-react";
import Image from "next/image";
import { IUser } from "@/interfaces/user";
import { Theme } from "@/enums/Theme";
import { Language } from "@/enums/Language";

export default function AdminSettings() {
  // Assume the first admin user in the mock data
  const adminUser =
    mockUsers.find((user) => user.role === "admin") || mockUsers[0];
  const [user, setUser] = useState<IUser>({ ...adminUser });
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { toast } = useToast();

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update the user in the state
      setUser({ ...user });

      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPasswordLoading(true);

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      });
      setIsPasswordLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Reset password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme as Theme);
    toast({
      title: "Theme Updated",
      description: `Theme has been changed to ${newTheme}.`,
    });
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage as Language);
    toast({
      title: "Language Updated",
      description: `Language has been changed to ${
        newLanguage === "en"
          ? "English"
          : newLanguage === "vi"
          ? "Vietnamese"
          : "Japanese"
      }.`,
    });
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Admin Settings</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="password" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Password
          </TabsTrigger>
          <TabsTrigger value="theme" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Theme
          </TabsTrigger>
          <TabsTrigger value="language" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Language
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and profile details.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleProfileUpdate}>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4 mb-6">
                  <Image
                    src={user.avatar || "/placeholder.svg"}
                    alt={user.name}
                    width={80}
                    height={80}
                    className="rounded-full"
                  />
                  <div>
                    <h3 className="font-medium">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      @{user.username}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={user.name}
                      onChange={(e) =>
                        setUser({ ...user, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={user.username}
                      onChange={(e) =>
                        setUser({ ...user, username: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    onChange={(e) =>
                      setUser({ ...user, email: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={user.bio}
                    onChange={(e) => setUser({ ...user, bio: e.target.value })}
                    rows={4}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Password Tab */}
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handlePasswordChange}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isPasswordLoading}>
                  {isPasswordLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Change Password
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Theme Tab */}
        <TabsContent value="theme">
          <Card>
            <CardHeader>
              <CardTitle>Theme Preferences</CardTitle>
              <CardDescription>
                Customize the appearance of the admin dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Select Theme</Label>
                <Select value={theme} onValueChange={handleThemeChange}>
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Theme.Light}>Light</SelectItem>
                    <SelectItem value={Theme.Dark}>Dark</SelectItem>
                    <SelectItem value={Theme.System}>System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4">
                <Card
                  className={`cursor-pointer border-2 ${
                    theme === Theme.Light
                      ? "border-primary"
                      : "border-transparent"
                  }`}
                  onClick={() => handleThemeChange(Theme.Light)}
                >
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <div className="h-24 w-full bg-white border rounded-md mb-2"></div>
                    <p className="text-sm font-medium">Light</p>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer border-2 ${
                    theme === Theme.Dark
                      ? "border-primary"
                      : "border-transparent"
                  }`}
                  onClick={() => handleThemeChange(Theme.Dark)}
                >
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <div className="h-24 w-full bg-slate-900 border rounded-md mb-2"></div>
                    <p className="text-sm font-medium">Dark</p>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer border-2 ${
                    theme === Theme.System
                      ? "border-primary"
                      : "border-transparent"
                  }`}
                  onClick={() => handleThemeChange(Theme.System)}
                >
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <div className="h-24 w-full bg-gradient-to-r from-white to-slate-900 border rounded-md mb-2"></div>
                    <p className="text-sm font-medium">System</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Language Tab */}
        <TabsContent value="language">
          <Card>
            <CardHeader>
              <CardTitle>Language Settings</CardTitle>
              <CardDescription>
                Choose your preferred language for the admin interface.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">Select Language</Label>
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Language.English}>English</SelectItem>
                    <SelectItem value={Language.Vietnamese}>
                      Tiếng Việt
                    </SelectItem>
                    <SelectItem value={Language.Japanese}>日本語</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4">
                <Card
                  className={`cursor-pointer border-2 ${
                    language === Language.English
                      ? "border-primary"
                      : "border-transparent"
                  }`}
                  onClick={() => handleLanguageChange(Language.English)}
                >
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <div className="h-16 w-full flex items-center justify-center mb-2">
                      <span className="text-2xl">🇺🇸</span>
                    </div>
                    <p className="text-sm font-medium">English</p>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer border-2 ${
                    language === Language.Vietnamese
                      ? "border-primary"
                      : "border-transparent"
                  }`}
                  onClick={() => handleLanguageChange(Language.Vietnamese)}
                >
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <div className="h-16 w-full flex items-center justify-center mb-2">
                      <span className="text-2xl">🇻🇳</span>
                    </div>
                    <p className="text-sm font-medium">Tiếng Việt</p>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer border-2 ${
                    language === Language.Japanese
                      ? "border-primary"
                      : "border-transparent"
                  }`}
                  onClick={() => handleLanguageChange(Language.Japanese)}
                >
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <div className="h-16 w-full flex items-center justify-center mb-2">
                      <span className="text-2xl">🇯🇵</span>
                    </div>
                    <p className="text-sm font-medium">日本語</p>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-md">
                <h3 className="font-medium mb-2">Preview</h3>
                <div className="space-y-2">
                  <p>
                    <strong>{t("settings")}:</strong> {t("editProfile")}
                  </p>
                  <p>
                    <strong>{t("language")}:</strong> {t("darkMode")}
                  </p>
                  <p>
                    <strong>{t("save")}:</strong> {t("cancel")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
