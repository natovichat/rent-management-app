import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as admin from 'firebase-admin';
import { FirebaseService } from '../../firebase/firebase.service';
import { RentalAgreement, RenewalStatus, RentalStatus, Person, Property, PropertyEventType } from '../../firebase/types';
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
    const withStats = await this.attachPaymentStats(populated);

    return {
      data: withStats,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, includeDeleted = false): Promise<RentalAgreement> {
    const doc = await this.col.doc(id).get();
    if (!doc.exists) throw new NotFoundException(`Rental agreement with ID ${id} not found`);
    const ra = this.docToRA(doc);
    if (!includeDeleted && ra.deletedAt) throw new NotFoundException(`Rental agreement with ID ${id} not found`);
    const populated = await this.populateRA(ra);
    const [withStats] = await this.attachPaymentStats([populated]);
    return withStats;
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
    const populated = await Promise.all(docs.map((ra) => this.populateRA(ra)));
    return this.attachPaymentStats(populated);
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
    const populated = await Promise.all(docs.map((ra) => this.populateRA(ra)));
    return this.attachPaymentStats(populated);
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

  /**
   * Fetches all PAID RentalPaymentRequestEvents in one Firestore query,
   * then attaches computed paidAmount and paidUntilDate to each agreement.
   */
  private async attachPaymentStats(ras: RentalAgreement[]): Promise<RentalAgreement[]> {
    if (ras.length === 0) return ras;

    const raIds = new Set(ras.map((ra) => ra.id));

    const snap = await this.firebase.db
      .collection('propertyEvents')
      .where('eventType', '==', PropertyEventType.RentalPaymentRequestEvent)
      .where('paymentStatus', '==', 'PAID')
      .where('deletedAt', '==', null)
      .get();

    // Aggregate per rental agreement
    const stats = new Map<string, { totalPaid: number; maxYear: number; maxMonth: number }>();
    snap.docs.forEach((doc) => {
      const d = doc.data();
      const raId: string | undefined = d['rentalAgreementId'];
      if (!raId || !raIds.has(raId)) return;

      const entry = stats.get(raId) ?? { totalPaid: 0, maxYear: 0, maxMonth: 0 };
      entry.totalPaid += Number(d['amountDue'] ?? 0);

      const y = Number(d['year'] ?? 0);
      const m = Number(d['month'] ?? 0);
      if (y > entry.maxYear || (y === entry.maxYear && m > entry.maxMonth)) {
        entry.maxYear = y;
        entry.maxMonth = m;
      }
      stats.set(raId, entry);
    });

    return ras.map((ra) => {
      const s = stats.get(ra.id);
      if (!s || s.totalPaid === 0) return ra;
      return {
        ...ra,
        paidAmount: s.totalPaid,
        // First day of the latest paid month
        paidUntilDate: new Date(s.maxYear, s.maxMonth - 1, 1),
      };
    });
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
