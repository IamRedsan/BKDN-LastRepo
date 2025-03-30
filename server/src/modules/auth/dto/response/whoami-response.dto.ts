// src/modules/auth/dto/whoami.response.dto.ts
export class WhoamiResponseDto {
  email: string;
  username: string;
  name: string;
  isEmailVerified: boolean;
  role: string;
  status: string;
  followers: string[];
  following: string[];
  followersCount: number;
  followingCount: number;
  createdAt: Date;
  updatedAt: Date;
  havePassword: boolean;
}
