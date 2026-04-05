import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { FirebaseService } from '../../firebase/firebase.service';
import {
  OwnerPayment,
  OwnerPaymentStatus,
  Ownership,
  Person,
  Property,
  RentalAgreement,
} from '../../firebase/types';
import { CreateOwnerPaymentDto } from './dto/create-owner-payment.dto';
import { UpdateOwnerPaymentDto } from './dto/update-owner-payment.dto';
import { QueryOwnerPaymentDto } from './dto/query-owner-payment.dto';

const COLLECTION = 'ownerPayments';

@Injectable()
export class OwnerPaymentsService {
  constructor(private readonly firebase: FirebaseService) {}

  private get col() {
    return this.firebase.db.collection(COLLECTION);
  }

  private docToOwnerPayment(doc: FirebaseFirestore.DocumentSnapshot): OwnerPayment {
    return this.firebase.convertTimestamps<OwnerPayment>({ id: doc.id, ...doc.data() });
  }

  private async populateOwnerPayment(payment: OwnerPayment): Promise<OwnerPayment> {
    const [ownershipDoc, personDoc, propertyDoc, raDoc] = await Promise.all([
      this.firebase.db.collection('ownerships').doc(payment.ownershipId).get(),
      this.firebase.db.collection('persons').doc(payment.personId).get(),
      this.firebase.db.collection('properties').doc(payment.propertyId).get(),
      this.firebase.db.collection('rentalAgreements').doc(payment.rentalAgreementId).get(),
    ]);

    return {
      ...payment,
      ownership: ownershipDoc.exists
        ? this.firebase.convertTimestamps<Ownership>({ id: ownershipDoc.id, ...ownershipDoc.data() })
        : undefined,
      person: personDoc.exists
        ? this.firebase.convertTimestamps<Person>({ id: personDoc.id, ...personDoc.data() })
        : undefined,
      property: propertyDoc.exists
        ? this.firebase.convertTimestamps<Property>({ id: propertyDoc.id, ...propertyDoc.data() })
        : undefined,
      rentalAgreement: raDoc.exists
        ? this.firebase.convertTimestamps<RentalAgreement>({ id: raDoc.id, ...raDoc.data() })
        : undefined,
    };
  }

  async create(dto: CreateOwnerPaymentDto): Promise<OwnerPayment> {
    // Validate ownership exists and get ownershipPercentage / personId / propertyId
    const ownershipDoc = await this.firebase.db
      .collection('ownerships')
      .doc(dto.ownershipId)
      .get();
    if (!ownershipDoc.exists) {
      throw new NotFoundException(`Ownership ${dto.ownershipId} not found`);
    }
    const ownership = this.firebase.convertTimestamps<Ownership>({
      id: ownershipDoc.id,
      ...ownershipDoc.data(),
    });

    // Validate rental agreement exists and get propertyId
    const raDoc = await this.firebase.db
      .collection('rentalAgreements')
      .doc(dto.rentalAgreementId)
      .get();
    if (!raDoc.exists) {
      throw new NotFoundException(`Rental agreement ${dto.rentalAgreementId} not found`);
    }
    const ra = this.firebase.convertTimestamps<RentalAgreement>({
      id: raDoc.id,
      ...raDoc.data(),
    });

    // Check for duplicate (same ownership + same month/year)
    const existing = await this.col
      .where('ownershipId', '==', dto.ownershipId)
      .where('rentalAgreementId', '==', dto.rentalAgreementId)
      .where('year', '==', dto.year)
      .where('month', '==', dto.month)
      .where('deletedAt', '==', null)
      .limit(1)
      .get();

    if (!existing.empty) {
      throw new BadRequestException(
        `An owner payment record already exists for this ownership and month/year.`,
      );
    }

    const ownershipPercentage = Number(ownership.ownershipPercentage);
    const totalRent = dto.totalRent;
    const amountDue = Math.round(totalRent * ownershipPercentage) / 100;
    const amountPaid = dto.amountPaid ?? 0;
    const status = dto.status ?? (amountPaid >= amountDue ? OwnerPaymentStatus.PAID : OwnerPaymentStatus.PENDING);

    const id = uuidv4();
    const now = new Date();

    const data: Omit<OwnerPayment, 'id' | 'ownership' | 'person' | 'property' | 'rentalAgreement'> = {
      ownershipId: dto.ownershipId,
      rentalAgreementId: dto.rentalAgreementId,
      propertyId: ra.propertyId,
      personId: ownership.personId,
      year: dto.year,
      month: dto.month,
      totalRent,
      ownershipPercentage,
      amountDue,
      amountPaid,
      status,
      paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : undefined,
      notes: dto.notes,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    await this.col.doc(id).set(data);
    return this.populateOwnerPayment({ id, ...data });
  }

  async findAll(query: QueryOwnerPaymentDto) {
    const {
      page = 1,
      limit = 100,
      rentalAgreementId,
      personId,
      propertyId,
      ownershipId,
      status,
      year,
      month,
      includeDeleted,
    } = query;

    let q = this.col as FirebaseFirestore.Query;
    if (!includeDeleted) q = q.where('deletedAt', '==', null);
    if (rentalAgreementId) q = q.where('rentalAgreementId', '==', rentalAgreementId);
    if (personId) q = q.where('personId', '==', personId);
    if (propertyId) q = q.where('propertyId', '==', propertyId);
    if (ownershipId) q = q.where('ownershipId', '==', ownershipId);
    if (status) q = q.where('status', '==', status);
    if (year !== undefined) q = q.where('year', '==', year);
    if (month !== undefined) q = q.where('month', '==', month);
    q = q.orderBy('createdAt', 'desc');

    const snap = await q.get();
    const all = snap.docs.map((d) => this.docToOwnerPayment(d));
    const total = all.length;
    const offset = (page - 1) * limit;
    const paged = all.slice(offset, offset + limit);

    const populated = await Promise.all(paged.map((p) => this.populateOwnerPayment(p)));

    return {
      data: populated,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<OwnerPayment> {
    const doc = await this.col.doc(id).get();
    if (!doc.exists) throw new NotFoundException(`Owner payment ${id} not found`);
    const payment = this.docToOwnerPayment(doc);
    if (payment.deletedAt) throw new NotFoundException(`Owner payment ${id} not found`);
    return this.populateOwnerPayment(payment);
  }

  async update(id: string, dto: UpdateOwnerPaymentDto): Promise<OwnerPayment> {
    const doc = await this.col.doc(id).get();
    if (!doc.exists) throw new NotFoundException(`Owner payment ${id} not found`);
    const existing = this.docToOwnerPayment(doc);
    if (existing.deletedAt) throw new NotFoundException(`Owner payment ${id} not found`);

    const updates: Partial<OwnerPayment> = { updatedAt: new Date() };

    if (dto.amountPaid !== undefined) updates.amountPaid = dto.amountPaid;
    if (dto.status !== undefined) updates.status = dto.status;
    if (dto.paymentDate !== undefined) updates.paymentDate = new Date(dto.paymentDate);
    if (dto.notes !== undefined) updates.notes = dto.notes;
    if (dto.totalRent !== undefined) {
      updates.totalRent = dto.totalRent;
      updates.amountDue = Math.round(dto.totalRent * existing.ownershipPercentage) / 100;
    }

    await this.col.doc(id).update(updates as Record<string, unknown>);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const doc = await this.col.doc(id).get();
    if (!doc.exists) throw new NotFoundException(`Owner payment ${id} not found`);
    await this.col.doc(id).update({ deletedAt: new Date(), updatedAt: new Date() });
  }

  /**
   * Generate a schedule of owner payment rows for a given rental agreement,
   * merging existing OwnerPayment records with computed months derived from
   * the rental agreement date range. This powers the frontend schedule view.
   */
  async getSchedule(
    rentalAgreementId: string,
    ownershipId?: string,
  ): Promise<OwnerPayment[]> {
    const raDoc = await this.firebase.db
      .collection('rentalAgreements')
      .doc(rentalAgreementId)
      .get();
    if (!raDoc.exists) throw new NotFoundException(`Rental agreement ${rentalAgreementId} not found`);
    const ra = this.firebase.convertTimestamps<RentalAgreement>({ id: raDoc.id, ...raDoc.data() });

    // Get ownerships for this property
    let ownershipsQuery = this.firebase.db
      .collection('ownerships')
      .where('propertyId', '==', ra.propertyId)
      .where('deletedAt', '==', null) as FirebaseFirestore.Query;
    if (ownershipId) {
      ownershipsQuery = this.firebase.db
        .collection('ownerships')
        .where('propertyId', '==', ra.propertyId)
        .where('deletedAt', '==', null);
    }

    const ownershipSnap = await ownershipsQuery.get();
    let ownerships = ownershipSnap.docs.map((d) =>
      this.firebase.convertTimestamps<Ownership>({ id: d.id, ...d.data() }),
    );
    if (ownershipId) {
      ownerships = ownerships.filter((o) => o.id === ownershipId);
    }

    if (ownerships.length === 0) return [];

    // Get existing payment records for this rental agreement
    let existingQuery = this.col
      .where('rentalAgreementId', '==', rentalAgreementId)
      .where('deletedAt', '==', null) as FirebaseFirestore.Query;

    const existingSnap = await existingQuery.get();
    const existingMap = new Map<string, OwnerPayment>();
    for (const d of existingSnap.docs) {
      const p = this.docToOwnerPayment(d);
      existingMap.set(`${p.ownershipId}:${p.year}:${p.month}`, p);
    }

    // Generate month range
    const start = new Date(ra.startDate);
    const end = ra.endDate ? new Date(ra.endDate) : new Date();
    const today = new Date();
    const cap = today < end ? today : end;

    // Populate ownership persons in bulk
    const personIds = [...new Set(ownerships.map((o) => o.personId))];
    const personDocs = await Promise.all(
      personIds.map((pid) => this.firebase.db.collection('persons').doc(pid).get()),
    );
    const personMap = new Map<string, Person>();
    for (const d of personDocs) {
      if (d.exists) {
        const p = this.firebase.convertTimestamps<Person>({ id: d.id, ...d.data() });
        personMap.set(p.id, p);
      }
    }

    const propertyDoc = await this.firebase.db.collection('properties').doc(ra.propertyId).get();
    const property = propertyDoc.exists
      ? this.firebase.convertTimestamps<Property>({ id: propertyDoc.id, ...propertyDoc.data() })
      : undefined;

    const rows: OwnerPayment[] = [];
    let cur = new Date(start.getFullYear(), start.getMonth(), 1);
    const capYM = cap.getFullYear() * 12 + cap.getMonth();

    while (cur.getFullYear() * 12 + cur.getMonth() <= capYM) {
      const y = cur.getFullYear();
      const m = cur.getMonth() + 1;

      for (const ownership of ownerships) {
        const key = `${ownership.id}:${y}:${m}`;
        const existing = existingMap.get(key);

        if (existing) {
          rows.push({
            ...existing,
            ownership,
            person: personMap.get(ownership.personId),
            property,
            rentalAgreement: ra,
          });
        } else {
          const ownershipPercentage = Number(ownership.ownershipPercentage);
          const amountDue = Math.round(ra.monthlyRent * ownershipPercentage) / 100;
          // Virtual (not persisted) row
          rows.push({
            id: `virtual:${key}`,
            ownershipId: ownership.id,
            rentalAgreementId,
            propertyId: ra.propertyId,
            personId: ownership.personId,
            year: y,
            month: m,
            totalRent: ra.monthlyRent,
            ownershipPercentage,
            amountDue,
            amountPaid: 0,
            status: OwnerPaymentStatus.PENDING,
            deletedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            ownership,
            person: personMap.get(ownership.personId),
            property,
            rentalAgreement: ra,
          });
        }
      }

      cur = new Date(y, m, 1);
    }

    // Sort by year desc, month desc, then ownershipId
    rows.sort((a, b) => {
      const ymDiff = b.year * 12 + b.month - (a.year * 12 + a.month);
      if (ymDiff !== 0) return ymDiff;
      return a.ownershipId.localeCompare(b.ownershipId);
    });

    return rows;
  }
}
