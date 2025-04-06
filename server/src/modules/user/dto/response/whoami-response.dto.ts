// src/modules/auth/dto/whoami.response.dto.ts
export class WhoamiResponseDto {
  email: string;
  username: string;
  name: string;
  role: string;
  havePassword: boolean;
  theme: string;
  language: string;
  bio: string;
  avatar: string;
  wallpaper: string;
  followers: string[];
  following: string[];
  followersCount: number;
  followingCount: number;
  createdAt: Date;
  updatedAt: Date;
}
