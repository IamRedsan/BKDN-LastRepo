export class UnfollowFollowersResponseDto {
  followers: {
    username: string;
    name: string;
    avatar: string;
  }[];
  followersCount: number;
}
