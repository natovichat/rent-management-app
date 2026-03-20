import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { FirebaseService } from '../../firebase/firebase.service';
import { Person } from '../../firebase/types';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { QueryPersonDto } from './dto/query-person.dto';

const COLLECTION = 'persons';

@Injectable()
export class PersonsService {
  constructor(private readonly firebase: FirebaseService) {}

  private get col() {
    return this.firebase.db.collection(COLLECTION);
  }

  private docToPerson(doc: FirebaseFirestore.DocumentSnapshot): Person {
    return this.firebase.convertTimestamps<Person>({ id: doc.id, ...doc.data() });
  }

  async create(dto: CreatePersonDto): Promise<Person> {
    const id = uuidv4();
    const now = new Date();
    const data: Omit<Person, 'id'> = {
      name: dto.name,
      type: dto.type ?? undefined,
      idNumber: dto.idNumber ?? undefined,
      email: dto.email ?? undefined,
      phone: dto.phone ?? undefined,
      address: dto.address ?? undefined,
      notes: dto.notes ?? undefined,
      createdAt: now,
      updatedAt: now,
    };
    await this.col.doc(id).set(data);
    return { id, ...data };
  }

  async findAll(query: QueryPersonDto) {
    const { page = 1, limit = 10, search, type, includeDeleted } = query;

    let q = this.col as FirebaseFirestore.Query;

    if (!includeDeleted) {
      q = q.where('deletedAt', '==', null);
    }

    if (type) {
      q = q.where('type', '==', type);
    }

    q = q.orderBy('name');

    const snap = await q.get();
    let docs = snap.docs.map((d) => this.docToPerson(d));

    // Client-side search filter (Firestore doesn't support multi-field OR text search)
    if (search?.trim()) {
      const lower = search.trim().toLowerCase();
      docs = docs.filter(
        (p) =>
          p.name?.toLowerCase().includes(lower) ||
          p.email?.toLowerCase().includes(lower) ||
          p.phone?.toLowerCase().includes(lower),
      );
    }

    const total = docs.length;
    const skip = (page - 1) * limit;
    const data = docs.slice(skip, skip + limit);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, includeDeleted = false): Promise<Person> {
    const doc = await this.col.doc(id).get();
    if (!doc.exists) throw new NotFoundException(`Person with id ${id} not found`);
    const person = this.docToPerson(doc);
    if (!includeDeleted && person.deletedAt) {
      throw new NotFoundException(`Person with id ${id} not found`);
    }
    return person;
  }

  async update(id: string, dto: UpdatePersonDto): Promise<Person> {
    const person = await this.findOne(id);
    const updates: Partial<Person> = { updatedAt: new Date() };
    if (dto.name !== undefined) updates.name = dto.name;
    if (dto.type !== undefined) updates.type = dto.type;
    if (dto.idNumber !== undefined) updates.idNumber = dto.idNumber;
    if (dto.email !== undefined) updates.email = dto.email;
    if (dto.phone !== undefined) updates.phone = dto.phone;
    if (dto.address !== undefined) updates.address = dto.address;
    if (dto.notes !== undefined) updates.notes = dto.notes;
    await this.col.doc(id).update(updates as Record<string, unknown>);
    return { ...person, ...updates };
  }

  async remove(id: string): Promise<Person> {
    const doc = await this.col.doc(id).get();
    if (!doc.exists) throw new NotFoundException(`Person with id ${id} not found`);
    const person = this.docToPerson(doc);
    if (person.deletedAt) throw new NotFoundException(`Person with id ${id} not found`);

    // Check related active records
    const [mortOwner, mortPayer, rentals, ownerships] = await Promise.all([
      this.firebase.db.collection('mortgages').where('mortgageOwnerId', '==', id).where('deletedAt', '==', null).limit(1).get(),
      this.firebase.db.collection('mortgages').where('payerId', '==', id).where('deletedAt', '==', null).limit(1).get(),
      this.firebase.db.collection('rentalAgreements').where('tenantId', '==', id).where('deletedAt', '==', null).limit(1).get(),
      this.firebase.db.collection('ownerships').where('personId', '==', id).where('deletedAt', '==', null).limit(1).get(),
    ]);

    const relations: string[] = [];
    if (!mortOwner.empty) relations.push('mortgages (as owner)');
    if (!mortPayer.empty) relations.push('mortgages (as payer)');
    if (!rentals.empty) relations.push('rental agreements');
    if (!ownerships.empty) relations.push('property ownerships');

    if (relations.length > 0) {
      throw new ConflictException(`Cannot delete person: has related ${relations.join(', ')}`);
    }

    const now = new Date();
    await this.col.doc(id).update({ deletedAt: now, updatedAt: now });
    return { ...person, deletedAt: now };
  }

  async restore(id: string): Promise<Person> {
    const doc = await this.col.doc(id).get();
    if (!doc.exists) throw new NotFoundException(`Deleted person with id ${id} not found`);
    const person = this.docToPerson(doc);
    if (!person.deletedAt) throw new NotFoundException(`Deleted person with id ${id} not found`);
    const now = new Date();
    await this.col.doc(id).update({ deletedAt: null, updatedAt: now });
    return { ...person, deletedAt: undefined, updatedAt: now };
  }
}
