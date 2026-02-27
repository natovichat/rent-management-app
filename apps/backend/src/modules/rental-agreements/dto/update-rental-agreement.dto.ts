import { PartialType } from '@nestjs/swagger';
import { CreateRentalAgreementDto } from './create-rental-agreement.dto';

/**
 * DTO for updating a rental agreement.
 * All fields are optional (partial update).
 */
export class UpdateRentalAgreementDto extends PartialType(CreateRentalAgreementDto) {}
