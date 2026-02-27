import { PartialType } from '@nestjs/swagger';
import { CreateMortgageDto } from './create-mortgage.dto';

/**
 * DTO for updating a mortgage.
 * All fields are optional (partial update).
 */
export class UpdateMortgageDto extends PartialType(CreateMortgageDto) {}
