import { PartialType } from '@nestjs/swagger';
import { CreateMortgageDto } from './create-mortgage.dto';

/**
 * DTO for updating an existing mortgage.
 * All fields from CreateMortgageDto are optional.
 */
export class UpdateMortgageDto extends PartialType(CreateMortgageDto) {}
