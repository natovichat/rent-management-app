import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  PropertyEventType,
  ExpenseEventType,
  RentalPaymentStatus,
} from '../../../firebase/types';


/**
 * Property event entity for Swagger documentation.
 * Single Table Inheritance with eventType as discriminator.
 */
export class PropertyEventEntity {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Property ID' })
  propertyId: string;

  @ApiProperty({
    description: 'Event type (discriminator)',
    enum: PropertyEventType,
  })
  eventType: PropertyEventType;

  @ApiProperty({ description: 'Event date' })
  eventDate: Date;

  @ApiPropertyOptional({ description: 'Event description' })
  description?: string | null;

  @ApiPropertyOptional({ description: 'Estimated value' })
  estimatedValue?: number | null;

  @ApiPropertyOptional({ description: 'Estimated rent' })
  estimatedRent?: number | null;

  // PlanningProcessEvent
  @ApiPropertyOptional({ description: 'Planning stage' })
  planningStage?: string | null;

  @ApiPropertyOptional({ description: 'Developer name' })
  developerName?: string | null;

  @ApiPropertyOptional({ description: 'Projected size after' })
  projectedSizeAfter?: string | null;

  // PropertyDamageEvent
  @ApiPropertyOptional({ description: 'Damage type' })
  damageType?: string | null;

  @ApiPropertyOptional({ description: 'Estimated damage cost' })
  estimatedDamageCost?: number | null;

  @ApiPropertyOptional({ description: 'Linked expense event ID' })
  expenseId?: string | null;

  // ExpenseEvent
  @ApiPropertyOptional({
    description: 'Expense type',
    enum: ExpenseEventType,
  })
  expenseType?: ExpenseEventType | null;

  @ApiPropertyOptional({ description: 'Amount' })
  amount?: number | null;

  @ApiPropertyOptional({ description: 'Paid to bank account ID' })
  paidToAccountId?: string | null;

  @ApiPropertyOptional({ description: 'Affects property value' })
  affectsPropertyValue?: boolean | null;

  // RentalPaymentRequestEvent
  @ApiPropertyOptional({ description: 'Rental agreement ID' })
  rentalAgreementId?: string | null;

  @ApiPropertyOptional({ description: 'Month (1-12)' })
  month?: number | null;

  @ApiPropertyOptional({ description: 'Year' })
  year?: number | null;

  @ApiPropertyOptional({ description: 'Amount due' })
  amountDue?: number | null;

  @ApiPropertyOptional({ description: 'Payment date' })
  paymentDate?: Date | null;

  @ApiPropertyOptional({
    description: 'Payment status',
    enum: RentalPaymentStatus,
  })
  paymentStatus?: RentalPaymentStatus | null;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiPropertyOptional({ description: 'Related property' })
  property?: unknown;

  @ApiPropertyOptional({ description: 'Related rental agreement' })
  rentalAgreement?: unknown;

  @ApiPropertyOptional({ description: 'Linked expense event' })
  linkedExpense?: unknown;
}
