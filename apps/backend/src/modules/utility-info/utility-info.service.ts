import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { FirebaseService } from '../../firebase/firebase.service';
import { UtilityInfo } from '../../firebase/types';
import { CreateUtilityInfoDto } from './dto/create-utility-info.dto';
import { UpdateUtilityInfoDto } from './dto/update-utility-info.dto';

const COLLECTION = 'utilityInfo';

@Injectable()
export class UtilityInfoService {
  constructor(private readonly firebase: FirebaseService) {}

  private get col() {
    return this.firebase.db.collection(COLLECTION);
  }

  private docToUI(doc: FirebaseFirestore.DocumentSnapshot): UtilityInfo {
    return this.firebase.convertTimestamps<UtilityInfo>({ id: doc.id, ...doc.data() });
  }

  async create(propertyId: string, dto: CreateUtilityInfoDto): Promise<UtilityInfo> {
    await this.ensurePropertyExists(propertyId);
    await this.ensureNoExisting(propertyId);

    const id = uuidv4();
    const now = new Date();
    const data: Omit<UtilityInfo, 'id'> = {
      propertyId,
      arnonaAccountNumber: dto.arnonaAccountNumber,
      electricityAccountNumber: dto.electricityAccountNumber,
      waterAccountNumber: dto.waterAccountNumber,
      vaadBayitName: dto.vaadBayitName,
      waterMeterNumber: dto.waterMeterNumber,
      electricityMeterNumber: dto.electricityMeterNumber,
      notes: dto.notes,
      createdAt: now,
      updatedAt: now,
    };
    await this.col.doc(id).set(data);
    return { id, ...data };
  }

  async findByProperty(propertyId: string): Promise<UtilityInfo> {
    const snap = await this.col.where('propertyId', '==', propertyId).limit(1).get();
    if (snap.empty) throw new NotFoundException(`Utility info for property ${propertyId} not found`);
    return this.docToUI(snap.docs[0]);
  }

  async update(propertyId: string, dto: UpdateUtilityInfoDto): Promise<UtilityInfo> {
    const existing = await this.findByProperty(propertyId);
    const updates: Partial<UtilityInfo> = { updatedAt: new Date() };
    if (dto.arnonaAccountNumber !== undefined) updates.arnonaAccountNumber = dto.arnonaAccountNumber;
    if (dto.electricityAccountNumber !== undefined) updates.electricityAccountNumber = dto.electricityAccountNumber;
    if (dto.waterAccountNumber !== undefined) updates.waterAccountNumber = dto.waterAccountNumber;
    if (dto.vaadBayitName !== undefined) updates.vaadBayitName = dto.vaadBayitName;
    if (dto.waterMeterNumber !== undefined) updates.waterMeterNumber = dto.waterMeterNumber;
    if (dto.electricityMeterNumber !== undefined) updates.electricityMeterNumber = dto.electricityMeterNumber;
    if (dto.notes !== undefined) updates.notes = dto.notes;
    await this.col.doc(existing.id).update(updates as Record<string, unknown>);
    return { ...existing, ...updates };
  }

  async remove(propertyId: string): Promise<void> {
    const existing = await this.findByProperty(propertyId);
    await this.col.doc(existing.id).delete();
  }

  private async ensurePropertyExists(propertyId: string) {
    const doc = await this.firebase.db.collection('properties').doc(propertyId).get();
    if (!doc.exists) throw new NotFoundException(`Property with ID ${propertyId} not found`);
  }

  private async ensureNoExisting(propertyId: string) {
    const snap = await this.col.where('propertyId', '==', propertyId).limit(1).get();
    if (!snap.empty) {
      throw new ConflictException(
        `Utility info already exists for property ${propertyId}. Use PATCH to update.`,
      );
    }
  }
}
