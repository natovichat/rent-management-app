import { PartialType } from '@nestjs/mapped-types';
import { CreateInvestmentCompanyDto } from './create-investment-company.dto';

/**
 * DTO for updating an investment company.
 * All fields are optional.
 */
export class UpdateInvestmentCompanyDto extends PartialType(
  CreateInvestmentCompanyDto,
) {}
