import { ThreadResponseDto } from 'src/modules/thread/dto/thread-response.dto';
import { WhoamiResponseDto } from 'src/modules/user/dto/response/whoami-response.dto';
// src/modules/auth/dto/whoami.response.dto.ts
export class ProfileResponseDto {
  user: WhoamiResponseDto;
  threads: ThreadResponseDto[];
  reThreads: ThreadResponseDto[];
}
