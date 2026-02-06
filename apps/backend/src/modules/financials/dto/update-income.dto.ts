import { PartialType } from '@nestjs/swagger';
import { CreateIncomeDto } from './create-income.dto';

/**
 * DTO for updating an income.
 * All fields are optional.
 */
export class UpdateIncomeDto extends PartialType(CreateIncomeDto) {}
