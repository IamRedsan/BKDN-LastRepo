import { Language } from '@/enums/Language';
import { Role } from '@/enums/Role';
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
  role: Role;
  status: string;
  interestVector: number[];
  followers: {
    name: string;
    username: string;
    avatar: string;
  }[];
  following: {
    name: string;
    username: string;
    avatar: string;
  }[];
  followersCount: number;
  followingCount: number;
  isBanned: boolean;
  theme: Theme;
  language: Language;
  createdAt: Date;
  updatedAt: Date;
}
