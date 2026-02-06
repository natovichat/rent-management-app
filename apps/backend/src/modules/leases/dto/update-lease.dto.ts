import { PartialType } from '@nestjs/swagger';
import { CreateLeaseDto } from './create-lease.dto';

/**
 * DTO for updating an existing lease.
 * All fields from CreateLeaseDto are optional.
 */
export class UpdateLeaseDto extends PartialType(CreateLeaseDto) {}
