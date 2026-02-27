import { PartialType } from '@nestjs/swagger';
import { CreatePropertyDto } from './create-property.dto';

/**
 * DTO for updating a Property (all fields optional)
 */
export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {}
