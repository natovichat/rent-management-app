import { PartialType } from '@nestjs/swagger';
import { CreateOwnerDto } from './create-owner.dto';

/**
 * DTO for updating an Owner (all fields optional)
 */
export class UpdateOwnerDto extends PartialType(CreateOwnerDto) {}
