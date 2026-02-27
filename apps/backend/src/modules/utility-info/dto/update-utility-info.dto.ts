import { PartialType } from '@nestjs/swagger';
import { CreateUtilityInfoDto } from './create-utility-info.dto';

/**
 * DTO for updating utility info.
 * All fields are optional (partial update).
 */
export class UpdateUtilityInfoDto extends PartialType(CreateUtilityInfoDto) {}
