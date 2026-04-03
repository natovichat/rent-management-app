import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { FirebaseService } from '../../firebase/firebase.service';
import { BankAccount } from '../../firebase/types';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { QueryBankAccountDto } from './dto/query-bank-account.dto';

const COLLECTION = 'bankAccounts';

@Injectable()
export class BankAccountsService {
  constructor(private readonly firebase: FirebaseService) {}

  private get col() {
    return this.firebase.db.collection(COLLECTION);
  }

  private docToBA(doc: FirebaseFirestore.DocumentSnapshot): BankAccount {
    return this.firebase.convertTimestamps<BankAccount>({ id: doc.id, ...doc.data() });
  }

  async create(dto: CreateBankAccountDto): Promise<BankAccount> {
    await this.checkUniqueness(dto.bankName, dto.accountNumber);
    const id = uuidv4();
    const now = new Date();
    const data: Omit<BankAccount, 'id'> = {
      bankName: dto.bankName,
      branchNumber: dto.branchNumber,
      accountNumber: dto.accountNumber,
      accountType: dto.accountType,
      accountHolder: dto.accountHolder,
      notes: dto.notes,
      isActive: dto.isActive ?? true,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    await this.col.doc(id).set(data);
    return { id, ...data };
  }

  async findAll(query: QueryBankAccountDto) {
    const { page = 1, limit = 20, bankName, accountType, isActive, includeDeleted } = query;

    let q = this.col as FirebaseFirestore.Query;

    if (!includeDeleted) {
      q = q.where('deletedAt', '==', null);
    }
    if (accountType) {
      q = q.where('accountType', '==', accountType);
    }
    if (isActive !== undefined) {
      q = q.where('isActive', '==', isActive);
    }

    q = q.orderBy('bankName').orderBy('createdAt', 'desc');

    const snap = await q.get();
    let docs = snap.docs.map((d) => this.docToBA(d));

    if (bankName) {
      const lower = bankName.toLowerCase();
      docs = docs.filter((a) => a.bankName.toLowerCase().includes(lower));
    }

    const total = docs.length;
    const skip = (page - 1) * limit;
    return {
      data: docs.slice(skip, skip + limit),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, includeDeleted = false): Promise<BankAccount> {
    const doc = await this.col.doc(id).get();
    if (!doc.exists) throw new NotFoundException(`Bank account with ID ${id} not found`);
    const ba = this.docToBA(doc);
    if (!includeDeleted && ba.deletedAt) {
      throw new NotFoundException(`Bank account with ID ${id} not found`);
    }
    return ba;
  }

  async update(id: string, dto: UpdateBankAccountDto): Promise<BankAccount> {
    const existing = await this.findOne(id);
    const bankName = dto.bankName ?? existing.bankName;
    const accountNumber = dto.accountNumber ?? existing.accountNumber;

    if (bankName !== existing.bankName || accountNumber !== existing.accountNumber) {
      await this.checkUniqueness(bankName, accountNumber, id);
    }

    const updates: Partial<BankAccount> = { updatedAt: new Date() };
    if (dto.bankName !== undefined) updates.bankName = dto.bankName;
    if (dto.branchNumber !== undefined) updates.branchNumber = dto.branchNumber;
    if (dto.accountNumber !== undefined) updates.accountNumber = dto.accountNumber;
    if (dto.accountType !== undefined) updates.accountType = dto.accountType;
    if (dto.accountHolder !== undefined) updates.accountHolder = dto.accountHolder;
    if (dto.notes !== undefined) updates.notes = dto.notes;
    if (dto.isActive !== undefined) updates.isActive = dto.isActive;

    await this.col.doc(id).update(updates as Record<string, unknown>);
    return { ...existing, ...updates };
  }

  async remove(id: string): Promise<BankAccount> {
    await this.findOne(id);

    const mortgageSnap = await this.firebase.db
      .collection('mortgages')
      .where('bankAccountId', '==', id)
      .where('deletedAt', '==', null)
      .get();

    if (!mortgageSnap.empty) {
      throw new ConflictException(
        `Cannot delete bank account: it is linked to ${mortgageSnap.size} mortgage(s). Remove the mortgage links first.`,
      );
    }

    const now = new Date();
    await this.col.doc(id).update({ deletedAt: now, updatedAt: now });
    const doc = await this.col.doc(id).get();
    return this.docToBA(doc);
  }

  async restore(id: string): Promise<BankAccount> {
    const doc = await this.col.doc(id).get();
    if (!doc.exists) throw new NotFoundException(`Deleted bank account with ID ${id} not found`);
    const ba = this.docToBA(doc);
    if (!ba.deletedAt) throw new NotFoundException(`Deleted bank account with ID ${id} not found`);
    const now = new Date();
    await this.col.doc(id).update({ deletedAt: null, updatedAt: now });
    return { ...ba, deletedAt: undefined, updatedAt: now };
  }

  private async checkUniqueness(bankName: string, accountNumber: string, excludeId?: string) {
    const snap = await this.col
      .where('bankName', '==', bankName)
      .where('accountNumber', '==', accountNumber)
      .where('deletedAt', '==', null)
      .get();

    const conflict = snap.docs.find((d) => d.id !== excludeId);
    if (conflict) {
      throw new ConflictException(
        `Bank account with bank "${bankName}" and account number "${accountNumber}" already exists`,
      );
    }
  }
}
