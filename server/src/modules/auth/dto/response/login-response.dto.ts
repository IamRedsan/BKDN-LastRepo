import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from 'src/common/enums/user-role.enum';

export class LoginResponseDto {
  @ApiProperty({
    description: 'Role of the user',
    enum: UserRole,
    example: UserRole.USER,
  })
  role?: UserRole;

  @ApiProperty({
    description: 'Account is banned or not',
    type: Boolean,
    example: false,
  })
  isBanned?: boolean;

  @ApiProperty({
    description: 'Account is verified or not',
    type: Boolean,
    example: false,
  })
  isEmailVerified?: boolean;

  isSuccess: boolean;

  emailToken?: string;
}
