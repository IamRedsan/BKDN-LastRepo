import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdateUserInfoRequestDto {
  @ApiProperty({
    description: 'Username of the user',
    example: 'username',
  })
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Name of the user',
    example: 'name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Bio of the user',
    example: 'bio',
  })
  @IsString()
  @IsNotEmpty()
  bio: string;
}
