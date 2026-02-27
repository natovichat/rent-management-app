import { PartialType } from '@nestjs/swagger';
import { CreateOwnershipDto } from './create-ownership.dto';

/**
 * DTO for updating an Ownership (all fields optional)
 */
export class UpdateOwnershipDto extends PartialType(CreateOwnershipDto) {}
