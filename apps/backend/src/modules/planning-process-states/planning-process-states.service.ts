import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { FirebaseService } from '../../firebase/firebase.service';
import { PlanningProcessState } from '../../firebase/types';
import { CreatePlanningProcessStateDto } from './dto/create-planning-process-state.dto';
import { UpdatePlanningProcessStateDto } from './dto/update-planning-process-state.dto';

const COLLECTION = 'planningProcessStates';

@Injectable()
export class PlanningProcessStatesService {
  constructor(private readonly firebase: FirebaseService) {}

  private get col() {
    return this.firebase.db.collection(COLLECTION);
  }

  private docToState(doc: FirebaseFirestore.DocumentSnapshot): PlanningProcessState {
    return this.firebase.convertTimestamps<PlanningProcessState>({ id: doc.id, ...doc.data() });
  }

  async create(propertyId: string, dto: CreatePlanningProcessStateDto): Promise<PlanningProcessState> {
    const propDoc = await this.firebase.db.collection('properties').doc(propertyId).get();
    if (!propDoc.exists) throw new NotFoundException(`Property with id ${propertyId} not found`);

    const existing = await this.col.where('propertyId', '==', propertyId).limit(1).get();
    if (!existing.empty) {
      throw new ConflictException(
        `Property ${propertyId} already has a planning process state. Use PATCH to update.`,
      );
    }

    const id = uuidv4();
    const now = new Date();
    const data: Omit<PlanningProcessState, 'id'> = {
      propertyId,
      stateType: dto.stateType,
      lastUpdateDate: new Date(dto.lastUpdateDate),
      developerName: dto.developerName,
      projectedSizeAfter: dto.projectedSizeAfter,
      notes: dto.notes,
      createdAt: now,
      updatedAt: now,
    };
    await this.col.doc(id).set(data);
    return { id, ...data };
  }

  async findByProperty(propertyId: string): Promise<PlanningProcessState> {
    const snap = await this.col.where('propertyId', '==', propertyId).limit(1).get();
    if (snap.empty) {
      throw new NotFoundException(`Planning process state for property ${propertyId} not found`);
    }
    return this.docToState(snap.docs[0]);
  }

  async update(propertyId: string, dto: UpdatePlanningProcessStateDto): Promise<PlanningProcessState> {
    const existing = await this.findByProperty(propertyId);
    const updates: Partial<PlanningProcessState> = { updatedAt: new Date() };
    if (dto.stateType !== undefined) updates.stateType = dto.stateType;
    if (dto.lastUpdateDate !== undefined) updates.lastUpdateDate = new Date(dto.lastUpdateDate);
    if (dto.developerName !== undefined) updates.developerName = dto.developerName;
    if (dto.projectedSizeAfter !== undefined) updates.projectedSizeAfter = dto.projectedSizeAfter;
    if (dto.notes !== undefined) updates.notes = dto.notes;
    await this.col.doc(existing.id).update(updates as Record<string, unknown>);
    return { ...existing, ...updates };
  }

  async remove(propertyId: string): Promise<void> {
    const existing = await this.findByProperty(propertyId);
    await this.col.doc(existing.id).delete();
  }
}
