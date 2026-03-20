import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);

  onModuleInit() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
      this.logger.log('Firebase Admin SDK initialized');
    }
  }

  get db(): admin.firestore.Firestore {
    return admin.firestore();
  }

  /** Convert Firestore Timestamps to Dates recursively in a plain object */
  convertTimestamps<T>(data: Record<string, unknown>): T {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value instanceof admin.firestore.Timestamp) {
        result[key] = value.toDate();
      } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = this.convertTimestamps(value as Record<string, unknown>);
      } else {
        result[key] = value;
      }
    }
    return result as T;
  }

  /** Get a document by collection and ID, returns null if not found */
  async getDoc<T>(collection: string, id: string): Promise<T | null> {
    const doc = await this.db.collection(collection).doc(id).get();
    if (!doc.exists) return null;
    return this.convertTimestamps<T>({ id: doc.id, ...doc.data() });
  }
}
