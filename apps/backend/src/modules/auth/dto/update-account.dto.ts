import { IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAccountDto {
  @ApiProperty({
    description: 'Account name',
    example: 'יוסי כהן - תיק נכסים',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  name: string;
}
