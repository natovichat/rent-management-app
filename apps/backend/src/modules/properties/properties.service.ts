import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { FirebaseService } from '../../firebase/firebase.service';
import { Property } from '../../firebase/types';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { QueryPropertyDto } from './dto/query-property.dto';

const COLLECTION = 'properties';

@Injectable()
export class PropertiesService {
  constructor(private readonly firebase: FirebaseService) {}

  private get col() {
    return this.firebase.db.collection(COLLECTION);
  }

  private docToProperty(doc: FirebaseFirestore.DocumentSnapshot): Property {
    return this.firebase.convertTimestamps<Property>({ id: doc.id, ...doc.data() });
  }

  private dtoToData(dto: CreatePropertyDto | UpdatePropertyDto): Partial<Property> {
    const dateField = (v?: string | null) => (v ? new Date(v) : undefined);
    const data: Partial<Property> = {
      address: (dto as CreatePropertyDto).address ?? (dto as UpdatePropertyDto).address,
      fileNumber: dto.fileNumber,
      type: dto.type as Property['type'],
      status: dto.status as Property['status'],
      country: dto.country,
      city: dto.city,
      totalArea: dto.totalArea,
      landArea: dto.landArea,
      estimatedValue: dto.estimatedValue,
      lastValuationDate: dateField(dto.lastValuationDate as string),
      gush: dto.gush,
      helka: dto.helka,
      isMortgaged: dto.isMortgaged,
      floors: dto.floors,
      totalUnits: dto.totalUnits,
      parkingSpaces: dto.parkingSpaces,
      balconySizeSqm: dto.balconySizeSqm ?? dto.balconyArea,
      balconyArea: dto.balconyArea ?? dto.balconySizeSqm,
      storageSizeSqm: dto.storageSizeSqm,
      floor: dto.floor,
      roomCount: dto.roomCount,
      apartmentNumber: dto.apartmentNumber,
      storage: dto.storage,
      plotSize: dto.plotSize,
      buildingPotential: dto.buildingPotential,
      coOwners: dto.coOwners,
      isSoldPending: dto.isSoldPending,
      investmentCompanyId: dto.investmentCompanyId,
      developmentStatus: dto.developmentStatus,
      developmentCompany: dto.developmentCompany,
      expectedCompletionYears: dto.expectedCompletionYears,
      propertyDetails: dto.propertyDetails,
      parkingType: dto.parkingType,
      purchasePrice: dto.purchasePrice,
      purchaseDate: dateField(dto.purchaseDate as string),
      acquisitionMethod: dto.acquisitionMethod,
      estimatedRent: dto.estimatedRent,
      rentalIncome: dto.rentalIncome,
      projectedValue: dto.projectedValue,
      saleProjectedTax: dto.saleProjectedTax,
      cadastralNumber: dto.cadastralNumber,
      taxId: dto.taxId,
      registrationDate: dateField(dto.registrationDate as string),
      legalStatus: dto.legalStatus,
      constructionYear: dto.constructionYear,
      lastRenovationYear: dto.lastRenovationYear,
      buildingPermitNumber: dto.buildingPermitNumber,
      propertyCondition: dto.propertyCondition,
      landType: dto.landType,
      landDesignation: dto.landDesignation,
      isPartialOwnership: dto.isPartialOwnership,
      sharedOwnershipPercentage: dto.sharedOwnershipPercentage,
      isSold: dto.isSold,
      saleDate: dateField(dto.saleDate as string),
      salePrice: dto.salePrice,
      propertyManager: dto.propertyManager,
      managementCompany: dto.managementCompany,
      managementFees: dto.managementFees,
      managementFeeFrequency: dto.managementFeeFrequency,
      taxAmount: dto.taxAmount,
      taxFrequency: dto.taxFrequency,
      lastTaxPayment: dateField(dto.lastTaxPayment as string),
      insuranceDetails: dto.insuranceDetails,
      insuranceExpiry: dateField(dto.insuranceExpiry as string),
      zoning: dto.zoning,
      utilities: dto.utilities,
      restrictions: dto.restrictions,
      estimationSource: dto.estimationSource,
      notes: dto.notes,
    };
    return Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined),
    ) as Partial<Property>;
  }

  async create(dto: CreatePropertyDto): Promise<Property> {
    const id = uuidv4();
    const now = new Date();
    const data = { ...this.dtoToData(dto), deletedAt: null, createdAt: now, updatedAt: now };
    await this.col.doc(id).set(data);
    return this.docToProperty(await this.col.doc(id).get());
  }

  async findAll(query: QueryPropertyDto) {
    const { page = 1, limit = 10, search, type, status, city, country, includeDeleted } = query;

    let q = this.col as FirebaseFirestore.Query;
    if (!includeDeleted) q = q.where('deletedAt', '==', null);
    if (type) q = q.where('type', '==', type);
    if (status) q = q.where('status', '==', status);
    q = q.orderBy('address');

    const snap = await q.get();
    let docs = snap.docs.map((d) => this.docToProperty(d));

    // Client-side filtering for text search and city/country (case-insensitive)
    if (city) {
      const lower = city.toLowerCase();
      docs = docs.filter((p) => p.city?.toLowerCase() === lower);
    }
    if (country) {
      const lower = country.toLowerCase();
      docs = docs.filter((p) => p.country?.toLowerCase() === lower);
    }
    if (search?.trim()) {
      const lower = search.trim().toLowerCase();
      docs = docs.filter(
        (p) =>
          p.address?.toLowerCase().includes(lower) ||
          p.city?.toLowerCase().includes(lower) ||
          p.country?.toLowerCase().includes(lower),
      );
    }

    const total = docs.length;
    const skip = (page - 1) * limit;

    return {
      data: docs.slice(skip, skip + limit),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, includeStr?: string, includeDeleted = false): Promise<Property> {
    const doc = await this.col.doc(id).get();
    if (!doc.exists) throw new NotFoundException(`Property with id ${id} not found`);
    const property = this.docToProperty(doc);
    if (!includeDeleted && property.deletedAt) {
      throw new NotFoundException(`Property with id ${id} not found`);
    }

    // Populate relations if requested
    const includes = includeStr
      ?.split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean) ?? [];

    if (includes.includes('planningprocessstate')) {
      const snap = await this.firebase.db
        .collection('planningProcessStates')
        .where('propertyId', '==', id)
        .limit(1)
        .get();
      if (!snap.empty) {
        property.planningProcessState = this.firebase.convertTimestamps(
          { id: snap.docs[0].id, ...snap.docs[0].data() },
        );
      }
    }

    if (includes.includes('utilityinfo')) {
      const snap = await this.firebase.db
        .collection('utilityInfo')
        .where('propertyId', '==', id)
        .limit(1)
        .get();
      if (!snap.empty) {
        property.utilityInfo = this.firebase.convertTimestamps(
          { id: snap.docs[0].id, ...snap.docs[0].data() },
        );
      }
    }

    return property;
  }

  async update(id: string, dto: UpdatePropertyDto): Promise<Property> {
    await this.findOne(id);
    const updates = { ...this.dtoToData(dto), updatedAt: new Date() };
    await this.col.doc(id).update(updates as Record<string, unknown>);
    return this.docToProperty(await this.col.doc(id).get());
  }

  async remove(id: string): Promise<void> {
    const doc = await this.col.doc(id).get();
    if (!doc.exists || doc.data()?.deletedAt) {
      throw new NotFoundException(`Property with id ${id} not found`);
    }

    const now = new Date();
    const batch = this.firebase.db.batch();

    // Cascade soft-delete related collections
    for (const collectionName of ['propertyEvents', 'rentalAgreements', 'mortgages', 'ownerships']) {
      const snap = await this.firebase.db
        .collection(collectionName)
        .where('propertyId', '==', id)
        .where('deletedAt', '==', null)
        .get();
      snap.docs.forEach((d) => batch.update(d.ref, { deletedAt: now, updatedAt: now }));
    }

    batch.update(this.col.doc(id), { deletedAt: now, updatedAt: now });
    await batch.commit();
  }

  async restore(id: string): Promise<Property> {
    const doc = await this.col.doc(id).get();
    if (!doc.exists) throw new NotFoundException(`Deleted property with id ${id} not found`);
    const property = this.docToProperty(doc);
    if (!property.deletedAt) throw new NotFoundException(`Deleted property with id ${id} not found`);

    const deletedAt = property.deletedAt;
    const batch = this.firebase.db.batch();

    // Restore relations that were deleted at roughly the same time (within 5 seconds)
    const deltaMs = 5000;
    for (const collectionName of ['propertyEvents', 'rentalAgreements', 'mortgages', 'ownerships']) {
      const snap = await this.firebase.db
        .collection(collectionName)
        .where('propertyId', '==', id)
        .get();
      snap.docs.forEach((d) => {
        const data = d.data();
        if (
          data.deletedAt &&
          Math.abs(new Date(data.deletedAt.toDate?.() ?? data.deletedAt).getTime() - deletedAt.getTime()) < deltaMs
        ) {
          batch.update(d.ref, { deletedAt: null, updatedAt: new Date() });
        }
      });
    }

    batch.update(this.col.doc(id), { deletedAt: null, updatedAt: new Date() });
    await batch.commit();

    return this.docToProperty(await this.col.doc(id).get());
  }
}
