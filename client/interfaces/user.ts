import { Language } from '@/enums/Language';
import { Theme } from '@/enums/Theme';

export interface IUser {
  email: string;
  username: string;
  name: string;
  avatar: string;
  wallpaper: string;
  bio: string;
  isEmailVerified: boolean;
  requiresUsernameChange: boolean;
  havePassword: boolean;
  role: string;
  status: string;
  followers: string[];
  following: string[];
  followersCount: number;
  followingCount: number;
  theme: Theme;
  language: Language;
  createdAt: Date;
  updatedAt: Date;
} 