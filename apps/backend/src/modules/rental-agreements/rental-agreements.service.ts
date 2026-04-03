import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as admin from 'firebase-admin';
import { FirebaseService } from '../../firebase/firebase.service';
import { RentalAgreement, RenewalStatus, RentalStatus, Person, Property } from '../../firebase/types';
import { CreateRentalAgreementDto } from './dto/create-rental-agreement.dto';
import { UpdateRentalAgreementDto } from './dto/update-rental-agreement.dto';
import { QueryRentalAgreementDto } from './dto/query-rental-agreement.dto';

const COLLECTION = 'rentalAgreements';

@Injectable()
export class RentalAgreementsService {
  constructor(private readonly firebase: FirebaseService) {}

  private get col() {
    return this.firebase.db.collection(COLLECTION);
  }

  private docToRA(doc: FirebaseFirestore.DocumentSnapshot): RentalAgreement {
    return this.firebase.convertTimestamps<RentalAgreement>({ id: doc.id, ...doc.data() });
  }

  private async populateRA(ra: RentalAgreement): Promise<RentalAgreement> {
    const [propDoc, tenantDoc] = await Promise.all([
      this.firebase.db.collection('properties').doc(ra.propertyId).get(),
      this.firebase.db.collection('persons').doc(ra.tenantId).get(),
    ]);
    return {
      ...ra,
      property: propDoc.exists
        ? this.firebase.convertTimestamps<Property>({ id: propDoc.id, ...propDoc.data() })
        : undefined,
      tenant: tenantDoc.exists
        ? this.firebase.convertTimestamps<Person>({ id: tenantDoc.id, ...tenantDoc.data() })
        : undefined,
    };
  }

  async create(dto: CreateRentalAgreementDto): Promise<RentalAgreement> {
    await this.validateCreateDto(dto);

    const id = uuidv4();
    const now = new Date();
    const data: Omit<RentalAgreement, 'id' | 'property' | 'tenant'> = {
      propertyId: dto.propertyId,
      tenantId: dto.tenantId,
      monthlyRent: dto.monthlyRent,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      status: (dto.status ?? 'FUTURE') as RentalStatus,
      hasExtensionOption: dto.hasExtensionOption ?? false,
      extensionUntilDate: dto.extensionUntilDate ? new Date(dto.extensionUntilDate) : undefined,
      extensionMonthlyRent: dto.extensionMonthlyRent,
      notes: dto.notes,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    await this.col.doc(id).set(data);
    return this.populateRA({ id, ...data });
  }

  async findAll(query: QueryRentalAgreementDto) {
    const { page = 1, limit = 20, status, propertyId, tenantId, includeDeleted } = query;

    let q = this.col as FirebaseFirestore.Query;
    if (!includeDeleted) q = q.where('deletedAt', '==', null);
    if (status) q = q.where('status', '==', status);
    if (propertyId) q = q.where('propertyId', '==', propertyId);
    if (tenantId) q = q.where('tenantId', '==', tenantId);
    q = q.orderBy('createdAt', 'desc');

    const snap = await q.get();
    const docs = snap.docs.map((d) => this.docToRA(d));
    const total = docs.length;
    const skip = (page - 1) * limit;
    const paged = docs.slice(skip, skip + limit);
    const populated = await Promise.all(paged.map((ra) => this.populateRA(ra)));

    return {
      data: populated,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, includeDeleted = false): Promise<RentalAgreement> {
    const doc = await this.col.doc(id).get();
    if (!doc.exists) throw new NotFoundException(`Rental agreement with ID ${id} not found`);
    const ra = this.docToRA(doc);
    if (!includeDeleted && ra.deletedAt) throw new NotFoundException(`Rental agreement with ID ${id} not found`);
    return this.populateRA(ra);
  }

  async findByProperty(propertyId: string, includeDeleted = false): Promise<RentalAgreement[]> {
    const propDoc = await this.firebase.db.collection('properties').doc(propertyId).get();
    if (!propDoc.exists || propDoc.data()?.deletedAt) {
      throw new NotFoundException(`Property with ID ${propertyId} not found`);
    }
    let q = this.col.where('propertyId', '==', propertyId) as FirebaseFirestore.Query;
    if (!includeDeleted) q = q.where('deletedAt', '==', null);
    q = q.orderBy('createdAt', 'desc');
    const snap = await q.get();
    const docs = snap.docs.map((d) => this.docToRA(d));
    return Promise.all(docs.map((ra) => this.populateRA(ra)));
  }

  async findByTenant(tenantId: string, includeDeleted = false): Promise<RentalAgreement[]> {
    const personDoc = await this.firebase.db.collection('persons').doc(tenantId).get();
    if (!personDoc.exists || personDoc.data()?.deletedAt) {
      throw new NotFoundException(`Person (tenant) with ID ${tenantId} not found`);
    }
    let q = this.col.where('tenantId', '==', tenantId) as FirebaseFirestore.Query;
    if (!includeDeleted) q = q.where('deletedAt', '==', null);
    q = q.orderBy('createdAt', 'desc');
    const snap = await q.get();
    const docs = snap.docs.map((d) => this.docToRA(d));
    return Promise.all(docs.map((ra) => this.populateRA(ra)));
  }

  async update(id: string, dto: UpdateRentalAgreementDto): Promise<RentalAgreement> {
    const existing = await this.findOne(id);
    await this.validateUpdateDto(dto);

    const updates: Partial<RentalAgreement> = { updatedAt: new Date() };
    if (dto.propertyId !== undefined) updates.propertyId = dto.propertyId;
    if (dto.tenantId !== undefined) updates.tenantId = dto.tenantId;
    if (dto.monthlyRent !== undefined) updates.monthlyRent = dto.monthlyRent;
    if (dto.startDate !== undefined) updates.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined) updates.endDate = new Date(dto.endDate);
    if (dto.status !== undefined) updates.status = dto.status as unknown as RentalStatus;
    if (dto.hasExtensionOption !== undefined) updates.hasExtensionOption = dto.hasExtensionOption;
    if (dto.extensionUntilDate !== undefined) {
      updates.extensionUntilDate = dto.extensionUntilDate ? new Date(dto.extensionUntilDate) : undefined;
    }
    if (dto.extensionMonthlyRent !== undefined) updates.extensionMonthlyRent = dto.extensionMonthlyRent;
    if (dto.notes !== undefined) updates.notes = dto.notes;

    await this.col.doc(id).update(updates as Record<string, unknown>);
    return this.populateRA({ ...existing, ...updates });
  }

  async remove(id: string): Promise<RentalAgreement> {
    const existing = await this.findOne(id);
    const now = new Date();
    await this.col.doc(id).update({ deletedAt: now, updatedAt: now });
    return { ...existing, deletedAt: now };
  }

  async findExpiring(months: number): Promise<RentalAgreement[]> {
    const future = new Date();
    future.setMonth(future.getMonth() + months);

    const snap = await this.col
      .where('deletedAt', '==', null)
      .orderBy('endDate')
      .get();

    const docs = snap.docs
      .map((d) => this.docToRA(d))
      .filter(
        (ra) =>
          ra.status === 'EXPIRED' ||
          (['ACTIVE', 'FUTURE'].includes(ra.status) && ra.endDate <= future),
      );

    return Promise.all(docs.map((ra) => this.populateRA(ra)));
  }

  async updateRenewalStatus(id: string, renewalStatus: RenewalStatus): Promise<RentalAgreement> {
    const existing = await this.findOne(id);
    const now = new Date();
    await this.col.doc(id).update({ renewalStatus, updatedAt: now });
    return this.populateRA({ ...existing, renewalStatus, updatedAt: now });
  }

  async restore(id: string): Promise<RentalAgreement> {
    const doc = await this.col.doc(id).get();
    if (!doc.exists) throw new NotFoundException(`Deleted rental agreement with ID ${id} not found`);
    const ra = this.docToRA(doc);
    if (!ra.deletedAt) throw new NotFoundException(`Deleted rental agreement with ID ${id} not found`);
    const now = new Date();
    await this.col.doc(id).update({ deletedAt: null, updatedAt: now });
    return this.populateRA({ ...ra, deletedAt: undefined, updatedAt: now });
  }

  private async validateCreateDto(dto: CreateRentalAgreementDto) {
    const propDoc = await this.firebase.db.collection('properties').doc(dto.propertyId).get();
    if (!propDoc.exists || propDoc.data()?.deletedAt) {
      throw new BadRequestException(`Property with ID ${dto.propertyId} not found`);
    }
    const personDoc = await this.firebase.db.collection('persons').doc(dto.tenantId).get();
    if (!personDoc.exists || personDoc.data()?.deletedAt) {
      throw new BadRequestException(`Person (tenant) with ID ${dto.tenantId} not found`);
    }
    if (new Date(dto.endDate) <= new Date(dto.startDate)) {
      throw new BadRequestException('endDate must be after startDate');
    }
    if (dto.monthlyRent <= 0) {
      throw new BadRequestException('monthlyRent must be greater than 0');
    }
  }

  private async validateUpdateDto(dto: UpdateRentalAgreementDto) {
    if (dto.propertyId) {
      const propDoc = await this.firebase.db.collection('properties').doc(dto.propertyId).get();
      if (!propDoc.exists || propDoc.data()?.deletedAt) {
        throw new BadRequestException(`Property with ID ${dto.propertyId} not found`);
      }
    }
    if (dto.tenantId) {
      const personDoc = await this.firebase.db.collection('persons').doc(dto.tenantId).get();
      if (!personDoc.exists || personDoc.data()?.deletedAt) {
        throw new BadRequestException(`Person (tenant) with ID ${dto.tenantId} not found`);
      }
    }
    if (dto.startDate != null && dto.endDate != null) {
      if (new Date(dto.endDate) <= new Date(dto.startDate)) {
        throw new BadRequestException('endDate must be after startDate');
      }
    }
    if (dto.monthlyRent != null && dto.monthlyRent <= 0) {
      throw new BadRequestException('monthlyRent must be greater than 0');
    }
  }
}
