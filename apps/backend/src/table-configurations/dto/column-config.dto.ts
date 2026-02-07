import { IsString, IsBoolean, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for individual column configuration
 */
export class ColumnConfigDto {
  @ApiProperty({
    description: 'Field name (must match entity property)',
    example: 'address',
  })
  @IsString()
  field: string;

  @ApiProperty({
    description: 'Whether the column is visible',
    example: true,
  })
  @IsBoolean()
  visible: boolean;

  @ApiProperty({
    description: 'Display order (0-based)',
    example: 0,
  })
  @IsInt()
  @Min(0)
  order: number;

  @ApiProperty({
    description: 'Whether the column is required (cannot be hidden)',
    example: true,
  })
  @IsBoolean()
  required: boolean;
}
