import { ApiProperty } from '@nestjs/swagger';

export class PreferencesResponseDto {
  @ApiProperty({ example: 'he' })
  language: string;

  @ApiProperty({ example: 'DD/MM/YYYY' })
  dateFormat: string;

  @ApiProperty({ example: 'ILS' })
  currency: string;

  @ApiProperty({ example: 'light' })
  theme: string;
}
