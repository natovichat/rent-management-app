import { PartialType } from '@nestjs/swagger';
import { CreatePersonDto } from './create-person.dto';

/**
 * DTO for updating a Person (all fields optional)
 */
export class UpdatePersonDto extends PartialType(CreatePersonDto) {}
