import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as admin from 'firebase-admin';
import { FirebaseService } from '../../firebase/firebase.service';
import { User, UserRole } from '../../firebase/types';

interface ValidateOrCreateUserInput {
  googleId: string;
  email: string;
  name?: string;
  picture?: string;
}

const COLLECTION = 'users';

@Injectable()
export class UsersService {
  constructor(private readonly firebase: FirebaseService) {}

  private get col() {
    return this.firebase.db.collection(COLLECTION);
  }

  private docToUser(doc: admin.firestore.DocumentSnapshot): User {
    return this.firebase.convertTimestamps<User>({ id: doc.id, ...doc.data() });
  }

  async validateOrCreateUser(input: ValidateOrCreateUserInput): Promise<User> {
    const { googleId, email, name, picture } = input;
    const db = this.firebase.db;

    // Count all users to detect first-ever user
    const countSnap = await this.col.count().get();
    const userCount = countSnap.data().count;

    // Try to find by googleId or email
    let userSnap = await this.col
      .where('googleId', '==', googleId)
      .limit(1)
      .get();

    let userDoc = userSnap.docs[0] ?? null;

    if (!userDoc) {
      const byEmail = await this.col.where('email', '==', email).limit(1).get();
      userDoc = byEmail.docs[0] ?? null;
    }

    if (!userDoc) {
      // New user
      if (userCount === 0) {
        // First user ever → ADMIN
        const id = uuidv4();
        const now = admin.firestore.Timestamp.now();
        const data: Omit<User, 'id'> = {
          email,
          googleId,
          name,
          picture,
          role: UserRole.ADMIN,
          isActive: true,
          lastLoginAt: now.toDate(),
          createdAt: now.toDate(),
          updatedAt: now.toDate(),
        };
        await this.col.doc(id).set(data);
        return { id, ...data };
      }

      // Check whitelist
      const whitelistSnap = await this.col.where('email', '==', email).limit(1).get();
      if (whitelistSnap.empty) {
        throw new ForbiddenException(
          'האימייל שלך אינו מורשה לגשת למערכת. צור קשר עם המנהל כדי לקבל גישה.',
        );
      }

      const wl = this.docToUser(whitelistSnap.docs[0]);
      if (!wl.isActive) {
        throw new ForbiddenException('הגישה שלך הושעתה. צור קשר עם המנהל.');
      }

      const updates = {
        googleId,
        name: name || wl.name,
        picture,
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      };
      await this.col.doc(wl.id).update(updates);
      return { ...wl, ...updates };
    }

    const user = this.docToUser(userDoc);

    if (!user.isActive) {
      throw new ForbiddenException('הגישה שלך הושעתה. צור קשר עם המנהל.');
    }

    const updates = {
      googleId: googleId || user.googleId,
      name: name || user.name,
      picture: picture || user.picture,
      lastLoginAt: new Date(),
      updatedAt: new Date(),
    };
    await this.col.doc(user.id).update(updates);
    return { ...user, ...updates };
  }

  async findById(id: string): Promise<User | null> {
    const doc = await this.col.doc(id).get();
    if (!doc.exists) return null;
    return this.docToUser(doc);
  }

  async findByEmail(email: string): Promise<User | null> {
    const snap = await this.col.where('email', '==', email).limit(1).get();
    if (snap.empty) return null;
    return this.docToUser(snap.docs[0]);
  }

  async findAll(): Promise<User[]> {
    const snap = await this.col.orderBy('role').orderBy('createdAt').get();
    return snap.docs.map((d) => this.docToUser(d));
  }

  async addToWhitelist(email: string, role: UserRole = UserRole.MEMBER): Promise<User> {
    const existing = await this.findByEmail(email);
    if (existing) {
      throw new ConflictException('כתובת האימייל כבר קיימת ברשימת המורשים');
    }
    const id = uuidv4();
    const now = new Date();
    const data: Omit<User, 'id'> = {
      email,
      role,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    await this.col.doc(id).set(data);
    return { id, ...data };
  }

  async setActive(id: string, isActive: boolean): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('משתמש לא נמצא');
    await this.col.doc(id).update({ isActive, updatedAt: new Date() });
    return { ...user, isActive };
  }

  async updateRole(id: string, role: UserRole): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('משתמש לא נמצא');
    await this.col.doc(id).update({ role, updatedAt: new Date() });
    return { ...user, role };
  }

  async updateName(id: string, name: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('משתמש לא נמצא');
    await this.col.doc(id).update({ name, updatedAt: new Date() });
    return { ...user, name };
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('משתמש לא נמצא');
    await this.col.doc(id).delete();
  }
}
