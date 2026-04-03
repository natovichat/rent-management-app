import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { FirebaseService } from '../../firebase/firebase.service';
import { Ownership, Person, Property } from '../../firebase/types';
import { CreateOwnershipDto } from './dto/create-ownership.dto';
import { UpdateOwnershipDto } from './dto/update-ownership.dto';

const COLLECTION = 'ownerships';

@Injectable()
export class OwnershipsService {
  constructor(private readonly firebase: FirebaseService) {}

  private get col() {
    return this.firebase.db.collection(COLLECTION);
  }

  private docToOwnership(doc: FirebaseFirestore.DocumentSnapshot): Ownership {
    return this.firebase.convertTimestamps<Ownership>({ id: doc.id, ...doc.data() });
  }

  private async populateOwnership(o: Ownership): Promise<Ownership> {
    const [personDoc, propertyDoc] = await Promise.all([
      this.firebase.db.collection('persons').doc(o.personId).get(),
      this.firebase.db.collection('properties').doc(o.propertyId).get(),
    ]);
    return {
      ...o,
      person: personDoc.exists
        ? this.firebase.convertTimestamps<Person>({ id: personDoc.id, ...personDoc.data() })
        : undefined,
      property: propertyDoc.exists
        ? this.firebase.convertTimestamps<Property>({ id: propertyDoc.id, ...propertyDoc.data() })
        : undefined,
    };
  }

  async create(propertyId: string, dto: CreateOwnershipDto): Promise<Ownership> {
    await this.ensurePropertyExists(propertyId);
    await this.ensurePersonExists(dto.personId);

    if (dto.ownershipPercentage < 0 || dto.ownershipPercentage > 100) {
      throw new BadRequestException('ownershipPercentage must be between 0 and 100');
    }

    const id = uuidv4();
    const now = new Date();
    const data: Omit<Ownership, 'id' | 'person' | 'property'> = {
      propertyId,
      personId: dto.personId,
      ownershipPercentage: dto.ownershipPercentage,
      ownershipType: dto.ownershipType,
      startDate: new Date(dto.startDate),
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      managementFee: dto.managementFee,
      familyDivision: dto.familyDivision ?? false,
      notes: dto.notes,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    await this.col.doc(id).set(data);
    const ownership: Ownership = { id, ...data };
    return this.populateOwnership(ownership);
  }

  async findAll(page = 1, limit = 20, includeDeleted = false, personId?: string) {
    let q = this.col as FirebaseFirestore.Query;

    if (!includeDeleted) q = q.where('deletedAt', '==', null);
    if (personId?.trim()) q = q.where('personId', '==', personId.trim());
    q = q.orderBy('startDate', 'desc');

    const snap = await q.get();
    const all = snap.docs.map((d) => this.docToOwnership(d));
    const total = all.length;
    const skip = (page - 1) * limit;
    const paged = all.slice(skip, skip + limit);
    const populated = await Promise.all(paged.map((o) => this.populateOwnership(o)));

    return {
      data: populated,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findByProperty(propertyId: string, includeDeleted = false): Promise<Ownership[]> {
    await this.ensurePropertyExists(propertyId);
    let q = this.col.where('propertyId', '==', propertyId) as FirebaseFirestore.Query;
    if (!includeDeleted) q = q.where('deletedAt', '==', null);
    q = q.orderBy('startDate', 'desc');
    const snap = await q.get();
    const all = snap.docs.map((d) => this.docToOwnership(d));
    return Promise.all(all.map((o) => this.populateOwnership(o)));
  }

  async findByPerson(personId: string, includeDeleted = false): Promise<Ownership[]> {
    await this.ensurePersonExists(personId);
    let q = this.col.where('personId', '==', personId) as FirebaseFirestore.Query;
    if (!includeDeleted) q = q.where('deletedAt', '==', null);
    q = q.orderBy('startDate', 'desc');
    const snap = await q.get();
    const all = snap.docs.map((d) => this.docToOwnership(d));
    return Promise.all(all.map((o) => this.populateOwnership(o)));
  }

  async findOne(id: string, includeDeleted = false): Promise<Ownership> {
    const doc = await this.col.doc(id).get();
    if (!doc.exists) throw new NotFoundException(`Ownership with id ${id} not found`);
    const o = this.docToOwnership(doc);
    if (!includeDeleted && o.deletedAt) throw new NotFoundException(`Ownership with id ${id} not found`);
    return this.populateOwnership(o);
  }

  async validateTotalOwnership(propertyId: string) {
    await this.ensurePropertyExists(propertyId);
    const now = new Date();
    const snap = await this.col.where('propertyId', '==', propertyId).where('deletedAt', '==', null).get();
    const active = snap.docs
      .map((d) => this.docToOwnership(d))
      .filter((o) => !o.endDate || o.endDate > now);

    const totalPercentage = active.reduce((sum, o) => sum + Number(o.ownershipPercentage), 0);
    const isValid = Math.abs(totalPercentage - 100) < 0.01;
    return {
      isValid,
      totalPercentage: Math.round(totalPercentage * 100) / 100,
      message: isValid
        ? `Total ownership is ${totalPercentage.toFixed(2)}%`
        : `Total ownership is ${totalPercentage.toFixed(2)}% (expected 100%)`,
    };
  }

  async update(id: string, dto: UpdateOwnershipDto): Promise<Ownership> {
    const existing = await this.findOne(id);

    if (dto.personId !== undefined) await this.ensurePersonExists(dto.personId);
    if (dto.ownershipPercentage !== undefined && (dto.ownershipPercentage < 0 || dto.ownershipPercentage > 100)) {
      throw new BadRequestException('ownershipPercentage must be between 0 and 100');
    }

    const updates: Partial<Ownership> = { updatedAt: new Date() };
    if (dto.personId !== undefined) updates.personId = dto.personId;
    if (dto.ownershipPercentage !== undefined) updates.ownershipPercentage = dto.ownershipPercentage;
    if (dto.ownershipType !== undefined) updates.ownershipType = dto.ownershipType;
    if (dto.startDate !== undefined) updates.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined) updates.endDate = dto.endDate ? new Date(dto.endDate) : undefined;
    if (dto.managementFee !== undefined) updates.managementFee = dto.managementFee;
    if (dto.familyDivision !== undefined) updates.familyDivision = dto.familyDivision;
    if (dto.notes !== undefined) updates.notes = dto.notes;

    await this.col.doc(id).update(updates as Record<string, unknown>);
    return this.populateOwnership({ ...existing, ...updates });
  }

  async remove(id: string): Promise<Ownership> {
    const existing = await this.findOne(id);
    const now = new Date();
    await this.col.doc(id).update({ deletedAt: now, updatedAt: now });
    return { ...existing, deletedAt: now };
  }

  async restore(id: string): Promise<Ownership> {
    const doc = await this.col.doc(id).get();
    if (!doc.exists) throw new NotFoundException(`Deleted ownership with id ${id} not found`);
    const o = this.docToOwnership(doc);
    if (!o.deletedAt) throw new NotFoundException(`Deleted ownership with id ${id} not found`);
    const now = new Date();
    await this.col.doc(id).update({ deletedAt: null, updatedAt: now });
    return this.populateOwnership({ ...o, deletedAt: undefined, updatedAt: now });
  }

  private async ensurePropertyExists(propertyId: string) {
    const doc = await this.firebase.db.collection('properties').doc(propertyId).get();
    if (!doc.exists || doc.data()?.deletedAt) {
      throw new NotFoundException(`Property with id ${propertyId} not found`);
    }
  }

  private async ensurePersonExists(personId: string) {
    const doc = await this.firebase.db.collection('persons').doc(personId).get();
    if (!doc.exists || doc.data()?.deletedAt) {
      throw new NotFoundException(`Person with id ${personId} not found`);
    }
  }
}
