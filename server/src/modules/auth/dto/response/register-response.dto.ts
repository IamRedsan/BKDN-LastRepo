import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from 'src/common/enums/user-role.enum';
import { UserStatus } from 'src/common/enums/user-status.enum';

export class RegisterResponseDto {
  @ApiProperty({
    description: 'User information',
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'Unique identifier of the user',
        example: '507f1f77bcf86cd799439011',
      },
      email: {
        type: 'string',
        description: 'Email address of the user',
        example: 'user@example.com',
      },
      username: {
        type: 'string',
        description: 'Username of the user',
        example: 'username',
      },
      name: {
        type: 'string',
        description: 'Full name of the user',
        example: 'John Doe',
      },
      role: {
        type: 'string',
        enum: UserRole,
        description: 'Role of the user',
        example: UserRole.USER,
      },
      status: {
        type: 'string',
        enum: UserStatus,
        description: 'Status of the user account',
        example: UserStatus.INACTIVE,
      },
    },
  })
  user: {
    id: string;
    email: string;
    username: string;
    name: string;
    role: UserRole;
    status: UserStatus;
  };
}
