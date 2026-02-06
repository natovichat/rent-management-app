import { PartialType } from '@nestjs/swagger';
import { CreateTenantDto } from './create-tenant.dto';

/**
 * DTO for updating an existing tenant.
 * All fields from CreateTenantDto are optional.
 */
export class UpdateTenantDto extends PartialType(CreateTenantDto) {}
