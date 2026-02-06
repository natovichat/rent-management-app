import { IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({
    description: 'User full name',
    example: 'יוסי כהן',
  })
  @IsString()
  @IsNotEmpty({ message: 'Name cannot be empty' })
  @MinLength(1, { message: 'Name must be at least 1 character' })
  name: string;
}
