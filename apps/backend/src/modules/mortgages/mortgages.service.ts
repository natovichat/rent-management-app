import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { FirebaseService } from '../../firebase/firebase.service';
import { Mortgage, BankAccount, Person, Property } from '../../firebase/types';
import { CreateMortgageDto } from './dto/create-mortgage.dto';
import { UpdateMortgageDto } from './dto/update-mortgage.dto';
import { QueryMortgageDto } from './dto/query-mortgage.dto';

const COLLECTION = 'mortgages';

@Injectable()
export class MortgagesService {
  constructor(private readonly firebase: FirebaseService) {}

  private get col() {
    return this.firebase.db.collection(COLLECTION);
  }

  private docToMortgage(doc: FirebaseFirestore.DocumentSnapshot): Mortgage {
    return this.firebase.convertTimestamps<Mortgage>({ id: doc.id, ...doc.data() });
  }

  private async populateMortgage(m: Mortgage): Promise<Mortgage> {
    const [propertyDoc, bankAccountDoc, mortgageOwnerDoc, payerDoc] = await Promise.all([
      m.propertyId ? this.firebase.db.collection('properties').doc(m.propertyId).get() : null,
      m.bankAccountId ? this.firebase.db.collection('bankAccounts').doc(m.bankAccountId).get() : null,
      m.mortgageOwnerId ? this.firebase.db.collection('persons').doc(m.mortgageOwnerId).get() : null,
      this.firebase.db.collection('persons').doc(m.payerId).get(),
    ]);
    return {
      ...m,
      property: propertyDoc?.exists
        ? this.firebase.convertTimestamps<Property>({ id: propertyDoc.id, ...propertyDoc.data() })
        : undefined,
      bankAccount: bankAccountDoc?.exists
        ? this.firebase.convertTimestamps<BankAccount>({ id: bankAccountDoc.id, ...bankAccountDoc.data() })
        : undefined,
      mortgageOwner: mortgageOwnerDoc?.exists
        ? this.firebase.convertTimestamps<Person>({ id: mortgageOwnerDoc.id, ...mortgageOwnerDoc.data() })
        : undefined,
      payer: payerDoc.exists
        ? this.firebase.convertTimestamps<Person>({ id: payerDoc.id, ...payerDoc.data() })
        : undefined,
    };
  }

  async create(dto: CreateMortgageDto): Promise<Mortgage> {
    await this.validateRelatedEntities(dto);

    const id = uuidv4();
    const now = new Date();
    const data: Omit<Mortgage, 'id' | 'property' | 'bankAccount' | 'mortgageOwner' | 'payer'> = {
      bank: dto.bank,
      loanAmount: dto.loanAmount,
      startDate: new Date(dto.startDate),
      status: dto.status,
      payerId: dto.payerId,
      linkedProperties: dto.linkedProperties ?? [],
      propertyId: dto.propertyId,
      bankAccountId: dto.bankAccountId,
      mortgageOwnerId: dto.mortgageOwnerId,
      interestRate: dto.interestRate,
      monthlyPayment: dto.monthlyPayment,
      earlyRepaymentPenalty: dto.earlyRepaymentPenalty,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      notes: dto.notes,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    await this.col.doc(id).set(data);
    return this.populateMortgage({ id, ...data });
  }

  async findAll(query: QueryMortgageDto) {
    const { page = 1, limit = 20, status, propertyId, includeDeleted } = query;

    let q = this.col as FirebaseFirestore.Query;
    if (!includeDeleted) q = q.where('deletedAt', '==', null);
    if (status) q = q.where('status', '==', status);
    q = q.orderBy('createdAt', 'desc');

    const snap = await q.get();
    let docs = snap.docs.map((d) => this.docToMortgage(d));

    if (propertyId) {
      docs = docs.filter(
        (m) => m.propertyId === propertyId || m.linkedProperties?.includes(propertyId),
      );
    }

    const total = docs.length;
    const skip = (page - 1) * limit;
    const paged = docs.slice(skip, skip + limit);
    const populated = await Promise.all(paged.map((m) => this.populateMortgage(m)));

    return {
      data: populated,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, includeDeleted = false): Promise<Mortgage> {
    const doc = await this.col.doc(id).get();
    if (!doc.exists) throw new NotFoundException(`Mortgage with ID ${id} not found`);
    const m = this.docToMortgage(doc);
    if (!includeDeleted && m.deletedAt) throw new NotFoundException(`Mortgage with ID ${id} not found`);
    return this.populateMortgage(m);
  }

  async findByProperty(propertyId: string, includeDeleted = false): Promise<Mortgage[]> {
    const propDoc = await this.firebase.db.collection('properties').doc(propertyId).get();
    if (!propDoc.exists || propDoc.data()?.deletedAt) {
      throw new NotFoundException(`Property with ID ${propertyId} not found`);
    }

    let q = this.col as FirebaseFirestore.Query;
    if (!includeDeleted) q = q.where('deletedAt', '==', null);
    q = q.orderBy('createdAt', 'desc');

    const snap = await q.get();
    const docs = snap.docs
      .map((d) => this.docToMortgage(d))
      .filter((m) => m.propertyId === propertyId || m.linkedProperties?.includes(propertyId));

    return Promise.all(docs.map((m) => this.populateMortgage(m)));
  }

  async update(id: string, dto: UpdateMortgageDto): Promise<Mortgage> {
    const existing = await this.findOne(id);
    await this.validateRelatedEntities(dto);

    const updates: Partial<Mortgage> = { updatedAt: new Date() };
    if (dto.bank !== undefined) updates.bank = dto.bank;
    if (dto.loanAmount !== undefined) updates.loanAmount = dto.loanAmount;
    if (dto.payerId !== undefined) updates.payerId = dto.payerId;
    if (dto.startDate !== undefined) updates.startDate = new Date(dto.startDate);
    if (dto.status !== undefined) updates.status = dto.status;
    if (dto.propertyId !== undefined) updates.propertyId = dto.propertyId || undefined;
    if (dto.bankAccountId !== undefined) updates.bankAccountId = dto.bankAccountId || undefined;
    if (dto.mortgageOwnerId !== undefined) updates.mortgageOwnerId = dto.mortgageOwnerId || undefined;
    if (dto.interestRate !== undefined) updates.interestRate = dto.interestRate;
    if (dto.monthlyPayment !== undefined) updates.monthlyPayment = dto.monthlyPayment;
    if (dto.earlyRepaymentPenalty !== undefined) updates.earlyRepaymentPenalty = dto.earlyRepaymentPenalty;
    if (dto.endDate !== undefined) updates.endDate = dto.endDate ? new Date(dto.endDate) : undefined;
    if (dto.linkedProperties !== undefined) updates.linkedProperties = dto.linkedProperties;
    if (dto.notes !== undefined) updates.notes = dto.notes;

    await this.col.doc(id).update(updates as Record<string, unknown>);
    return this.populateMortgage({ ...existing, ...updates });
  }

  async remove(id: string): Promise<Mortgage> {
    const existing = await this.findOne(id);
    const now = new Date();
    await this.col.doc(id).update({ deletedAt: now, updatedAt: now });
    return { ...existing, deletedAt: now };
  }

  async restore(id: string): Promise<Mortgage> {
    const doc = await this.col.doc(id).get();
    if (!doc.exists) throw new NotFoundException(`Deleted mortgage with ID ${id} not found`);
    const m = this.docToMortgage(doc);
    if (!m.deletedAt) throw new NotFoundException(`Deleted mortgage with ID ${id} not found`);
    const now = new Date();
    await this.col.doc(id).update({ deletedAt: null, updatedAt: now });
    return this.populateMortgage({ ...m, deletedAt: undefined, updatedAt: now });
  }

  private async validateRelatedEntities(dto: CreateMortgageDto | UpdateMortgageDto) {
    if (dto.propertyId) {
      const doc = await this.firebase.db.collection('properties').doc(dto.propertyId).get();
      if (!doc.exists || doc.data()?.deletedAt) {
        throw new BadRequestException(`Property with ID ${dto.propertyId} not found`);
      }
    }
    if (dto.bankAccountId) {
      const doc = await this.firebase.db.collection('bankAccounts').doc(dto.bankAccountId).get();
      if (!doc.exists || doc.data()?.deletedAt) {
        throw new BadRequestException(`Bank account with ID ${dto.bankAccountId} not found`);
      }
    }
    if (dto.mortgageOwnerId) {
      const doc = await this.firebase.db.collection('persons').doc(dto.mortgageOwnerId).get();
      if (!doc.exists || doc.data()?.deletedAt) {
        throw new BadRequestException(`Person (mortgage owner) with ID ${dto.mortgageOwnerId} not found`);
      }
    }
    if (dto.payerId) {
      const doc = await this.firebase.db.collection('persons').doc(dto.payerId).get();
      if (!doc.exists || doc.data()?.deletedAt) {
        throw new BadRequestException(`Person (payer) with ID ${dto.payerId} not found`);
      }
    }
    if (dto.linkedProperties?.length) {
      for (const propId of dto.linkedProperties) {
        const doc = await this.firebase.db.collection('properties').doc(propId).get();
        if (!doc.exists || doc.data()?.deletedAt) {
          throw new BadRequestException(`Linked property with ID ${propId} not found`);
        }
      }
    }
  }
}
