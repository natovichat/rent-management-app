import { PartialType } from '@nestjs/swagger';
import { CreateBankAccountDto } from './create-bank-account.dto';

/**
 * DTO for updating a bank account.
 * All fields are optional (partial update).
 */
export class UpdateBankAccountDto extends PartialType(CreateBankAccountDto) {}
