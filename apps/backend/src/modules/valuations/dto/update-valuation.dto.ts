import { PartialType } from '@nestjs/swagger';
import { CreateValuationDto } from './create-valuation.dto';

/**
 * DTO for updating an existing property valuation.
 * All fields from CreateValuationDto are optional.
 */
export class UpdateValuationDto extends PartialType(CreateValuationDto) {}
