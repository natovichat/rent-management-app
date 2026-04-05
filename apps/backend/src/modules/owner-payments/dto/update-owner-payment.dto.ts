import { PartialType } from '@nestjs/swagger';
import { CreateOwnerPaymentDto } from './create-owner-payment.dto';

export class UpdateOwnerPaymentDto extends PartialType(CreateOwnerPaymentDto) {}
