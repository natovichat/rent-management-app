import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { FirebaseService } from '../../firebase/firebase.service';
import { PropertyEvent, PropertyEventType, Property, RentalAgreement, BankAccount, RentalPaymentStatus } from '../../firebase/types';
import { CreatePlanningProcessEventDto } from './dto/create-planning-process-event.dto';
import { CreatePropertyDamageEventDto } from './dto/create-property-damage-event.dto';
import { CreateExpenseEventDto } from './dto/create-expense-event.dto';
import { CreateRentalPaymentRequestEventDto } from './dto/create-rental-payment-request-event.dto';
import { UpdatePropertyEventDto } from './dto/update-property-event.dto';
import { QueryPropertyEventDto } from './dto/query-property-event.dto';

const COLLECTION = 'propertyEvents';

@Injectable()
export class PropertyEventsService {
  constructor(private readonly firebase: FirebaseService) {}

  private get col() {
    return this.firebase.db.collection(COLLECTION);
  }

  private docToEvent(doc: FirebaseFirestore.DocumentSnapshot): PropertyEvent {
    return this.firebase.convertTimestamps<PropertyEvent>({ id: doc.id, ...doc.data() });
  }

  private async populateEvent(e: PropertyEvent): Promise<PropertyEvent> {
    const [propDoc, raDoc, baDoc, expenseDoc] = await Promise.all([
      this.firebase.db.collection('properties').doc(e.propertyId).get(),
      e.rentalAgreementId ? this.firebase.db.collection('rentalAgreements').doc(e.rentalAgreementId).get() : null,
      e.paidToAccountId ? this.firebase.db.collection('bankAccounts').doc(e.paidToAccountId).get() : null,
      e.expenseId ? this.col.doc(e.expenseId).get() : null,
    ]);
    return {
      ...e,
      property: propDoc.exists ? this.firebase.convertTimestamps<Property>({ id: propDoc.id, ...propDoc.data() }) : undefined,
      rentalAgreement: raDoc?.exists ? this.firebase.convertTimestamps<RentalAgreement>({ id: raDoc.id, ...raDoc.data() }) : undefined,
      paidToAccount: baDoc?.exists ? this.firebase.convertTimestamps<BankAccount>({ id: baDoc.id, ...baDoc.data() }) : undefined,
      linkedExpense: expenseDoc?.exists ? this.firebase.convertTimestamps<PropertyEvent>({ id: expenseDoc.id, ...expenseDoc.data() }) : undefined,
    };
  }

  private async createEvent(data: Omit<PropertyEvent, 'id' | 'property' | 'rentalAgreement' | 'paidToAccount' | 'linkedExpense'>): Promise<PropertyEvent> {
    const id = uuidv4();
    const dataWithDeletedAt = { ...data, deletedAt: data.deletedAt ?? null };
    await this.col.doc(id).set(dataWithDeletedAt);
    return this.populateEvent({ id, ...dataWithDeletedAt });
  }

  async createPlanningProcess(propertyId: string, dto: CreatePlanningProcessEventDto): Promise<PropertyEvent> {
    await this.ensurePropertyExists(propertyId);
    const now = new Date();
    return this.createEvent({
      propertyId,
      eventType: PropertyEventType.PlanningProcessEvent,
      eventDate: new Date(dto.eventDate),
      planningStage: dto.planningStage,
      developerName: dto.developerName,
      projectedSizeAfter: dto.projectedSizeAfter,
      description: dto.description,
      createdAt: now,
      updatedAt: now,
    });
  }

  async createPropertyDamage(propertyId: string, dto: CreatePropertyDamageEventDto): Promise<PropertyEvent> {
    await this.ensurePropertyExists(propertyId);
    if (dto.expenseId) await this.ensureExpenseEventExists(dto.expenseId, propertyId);
    const now = new Date();
    return this.createEvent({
      propertyId,
      eventType: PropertyEventType.PropertyDamageEvent,
      eventDate: new Date(dto.eventDate),
      damageType: dto.damageType,
      estimatedDamageCost: dto.estimatedDamageCost,
      expenseId: dto.expenseId,
      description: dto.description,
      createdAt: now,
      updatedAt: now,
    });
  }

  async createExpense(propertyId: string, dto: CreateExpenseEventDto): Promise<PropertyEvent> {
    await this.ensurePropertyExists(propertyId);
    if (dto.paidToAccountId) await this.ensureBankAccountExists(dto.paidToAccountId);
    const now = new Date();
    return this.createEvent({
      propertyId,
      eventType: PropertyEventType.ExpenseEvent,
      eventDate: new Date(dto.eventDate),
      expenseType: dto.expenseType,
      amount: dto.amount,
      paidToAccountId: dto.paidToAccountId,
      affectsPropertyValue: dto.affectsPropertyValue ?? false,
      description: dto.description,
      createdAt: now,
      updatedAt: now,
    });
  }

  async createRentalPaymentRequest(propertyId: string, dto: CreateRentalPaymentRequestEventDto): Promise<PropertyEvent> {
    await this.ensurePropertyExists(propertyId);
    await this.ensureRentalAgreementExists(dto.rentalAgreementId, propertyId);
    const now = new Date();
    return this.createEvent({
      propertyId,
      eventType: PropertyEventType.RentalPaymentRequestEvent,
      eventDate: dto.eventDate ? new Date(dto.eventDate) : now,
      rentalAgreementId: dto.rentalAgreementId,
      month: dto.month,
      year: dto.year,
      amountDue: dto.amountDue,
      paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : undefined,
      paymentStatus: (dto.paymentStatus ?? RentalPaymentStatus.PENDING) as RentalPaymentStatus,
      description: dto.description,
      createdAt: now,
      updatedAt: now,
    });
  }

  async findByProperty(propertyId: string, query: QueryPropertyEventDto) {
    await this.ensurePropertyExists(propertyId);
    const { page = 1, limit = 10, eventType, includeDeleted } = query;

    let q = this.col.where('propertyId', '==', propertyId) as FirebaseFirestore.Query;
    if (!includeDeleted) q = q.where('deletedAt', '==', null);
    if (eventType) q = q.where('eventType', '==', eventType);
    q = q.orderBy('eventDate', 'desc');

    const snap = await q.get();
    const docs = snap.docs.map((d) => this.docToEvent(d));
    const total = docs.length;
    const skip = (page - 1) * limit;
    const paged = docs.slice(skip, skip + limit);
    const populated = await Promise.all(paged.map((e) => this.populateEvent(e)));

    return { data: populated, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(propertyId: string, eventId: string, includeDeleted = false): Promise<PropertyEvent> {
    const doc = await this.col.doc(eventId).get();
    if (!doc.exists) throw new NotFoundException(`Property event with ID ${eventId} not found for property ${propertyId}`);
    const event = this.docToEvent(doc);
    if (event.propertyId !== propertyId) throw new NotFoundException(`Property event with ID ${eventId} not found for property ${propertyId}`);
    if (!includeDeleted && event.deletedAt) throw new NotFoundException(`Property event with ID ${eventId} not found for property ${propertyId}`);
    return this.populateEvent(event);
  }

  async update(propertyId: string, eventId: string, dto: UpdatePropertyEventDto): Promise<PropertyEvent> {
    const existing = await this.findOne(propertyId, eventId);

    const updates: Partial<PropertyEvent> = { updatedAt: new Date() };
    if (dto.eventDate !== undefined) updates.eventDate = new Date(dto.eventDate);
    if (dto.description !== undefined) updates.description = dto.description;
    if (dto.estimatedValue !== undefined) updates.estimatedValue = dto.estimatedValue;
    if (dto.estimatedRent !== undefined) updates.estimatedRent = dto.estimatedRent;
    if (dto.planningStage !== undefined) updates.planningStage = dto.planningStage;
    if (dto.developerName !== undefined) updates.developerName = dto.developerName;
    if (dto.projectedSizeAfter !== undefined) updates.projectedSizeAfter = dto.projectedSizeAfter;
    if (dto.damageType !== undefined) updates.damageType = dto.damageType;
    if (dto.estimatedDamageCost !== undefined) updates.estimatedDamageCost = dto.estimatedDamageCost;
    if (dto.expenseId !== undefined) {
      if (!dto.expenseId) {
        updates.expenseId = undefined;
      } else {
        await this.ensureExpenseEventExists(dto.expenseId, propertyId);
        updates.expenseId = dto.expenseId;
      }
    }
    if (dto.expenseType !== undefined) updates.expenseType = dto.expenseType;
    if (dto.amount !== undefined) updates.amount = dto.amount;
    if (dto.paidToAccountId !== undefined) {
      if (!dto.paidToAccountId) {
        updates.paidToAccountId = undefined;
      } else {
        await this.ensureBankAccountExists(dto.paidToAccountId);
        updates.paidToAccountId = dto.paidToAccountId;
      }
    }
    if (dto.affectsPropertyValue !== undefined) updates.affectsPropertyValue = dto.affectsPropertyValue;
    if (dto.rentalAgreementId !== undefined) {
      if (!dto.rentalAgreementId) {
        updates.rentalAgreementId = undefined;
      } else {
        await this.ensureRentalAgreementExists(dto.rentalAgreementId, propertyId);
        updates.rentalAgreementId = dto.rentalAgreementId;
      }
    }
    if (dto.month !== undefined) updates.month = dto.month;
    if (dto.year !== undefined) updates.year = dto.year;
    if (dto.amountDue !== undefined) updates.amountDue = dto.amountDue;
    if (dto.paymentDate !== undefined) updates.paymentDate = dto.paymentDate ? new Date(dto.paymentDate) : undefined;
    if (dto.paymentStatus !== undefined) updates.paymentStatus = dto.paymentStatus as PropertyEvent['paymentStatus'];

    await this.col.doc(eventId).update(updates as Record<string, unknown>);
    return this.populateEvent({ ...existing, ...updates });
  }

  async remove(propertyId: string, eventId: string): Promise<PropertyEvent> {
    const existing = await this.findOne(propertyId, eventId);
    const now = new Date();
    await this.col.doc(eventId).update({ deletedAt: now, updatedAt: now });
    return { ...existing, deletedAt: now };
  }

  async restore(propertyId: string, eventId: string): Promise<PropertyEvent> {
    const doc = await this.col.doc(eventId).get();
    if (!doc.exists) throw new NotFoundException(`Deleted property event with ID ${eventId} not found for property ${propertyId}`);
    const event = this.docToEvent(doc);
    if (event.propertyId !== propertyId || !event.deletedAt) {
      throw new NotFoundException(`Deleted property event with ID ${eventId} not found for property ${propertyId}`);
    }
    const now = new Date();
    await this.col.doc(eventId).update({ deletedAt: null, updatedAt: now });
    return this.populateEvent({ ...event, deletedAt: undefined, updatedAt: now });
  }

  private async ensurePropertyExists(propertyId: string) {
    const doc = await this.firebase.db.collection('properties').doc(propertyId).get();
    if (!doc.exists || doc.data()?.deletedAt) {
      throw new NotFoundException(`Property with ID ${propertyId} not found`);
    }
  }

  private async ensureExpenseEventExists(expenseId: string, propertyId: string) {
    const doc = await this.col.doc(expenseId).get();
    if (!doc.exists || doc.data()?.eventType !== PropertyEventType.ExpenseEvent || doc.data()?.propertyId !== propertyId || doc.data()?.deletedAt) {
      throw new BadRequestException(`ExpenseEvent with ID ${expenseId} not found for this property`);
    }
  }

  private async ensureBankAccountExists(accountId: string) {
    const doc = await this.firebase.db.collection('bankAccounts').doc(accountId).get();
    if (!doc.exists || doc.data()?.deletedAt) {
      throw new BadRequestException(`Bank account with ID ${accountId} not found`);
    }
  }

  private async ensureRentalAgreementExists(rentalAgreementId: string, propertyId: string) {
    const doc = await this.firebase.db.collection('rentalAgreements').doc(rentalAgreementId).get();
    if (!doc.exists || doc.data()?.propertyId !== propertyId || doc.data()?.deletedAt) {
      throw new BadRequestException(`Rental agreement with ID ${rentalAgreementId} not found for this property`);
    }
  }
}
