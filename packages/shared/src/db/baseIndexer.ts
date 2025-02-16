import type { DocumentReference } from "@google-cloud/firestore";
import { FIRESTORE_COLLECTIONS } from "../constants";
import { AppError, ErrorCode, logger } from "../lib";
import type { FirestoreDocumentKey, IndexerInfo, IndexerInfoData } from "../types";
import { db } from "./firestore";

export class BaseIndexer {
  protected db: FirebaseFirestore.Firestore;
  protected key: FirestoreDocumentKey;
  protected indexerDocRef: DocumentReference;
  private cache: Map<string, IndexerInfoData["info"][]>;
  private lastFetchTime: number;
  private readonly CACHE_EXPIRY = 1000 * 60;

  constructor(doc: FirestoreDocumentKey) {
    this.db = db;
    this.key = doc;
    this.indexerDocRef = db.collection(FIRESTORE_COLLECTIONS.INDEXERS).doc(doc);
    this.cache = new Map();
    this.lastFetchTime = 0;
  }

  async upsertIndexersBatch(indexerInfos: IndexerInfo[]) {
    const batch = this.db.batch();
    const now = new Date();

    for (const { address, info } of indexerInfos) {
      const addressRef = this.indexerDocRef.collection("addresses").doc(address);

      batch.set(
        addressRef,
        {
          ...info,
          updatedAt: now,
        },
        { merge: true },
      );
    }
    try {
      await batch.commit();
      this.invalidateCache();
    } catch (error) {
      logger.error(error);
      throw new AppError(500, ErrorCode.INTERNAL_SERVER_ERROR, "Failed to add or update indexers");
    }
  }

  async listIndexers(): Promise<IndexerInfo["info"][]> {
    try {
      const cachedBuilders = this.getCache<IndexerInfo["info"][]>(this.key);
      if (cachedBuilders) return cachedBuilders;

      const query = this.indexerDocRef.collection("addresses").where("active", "==", true);
      const snapshot = await query.get();
      const indexers = snapshot.docs.map((doc) => {
        const data = doc.data();
        const { updatedAt, active, ...indexerInfo } = data;
        return indexerInfo as IndexerInfo["info"];
      });
      if (indexers.length === 0) return [];

      this.setCache(this.key, indexers);

      return indexers;
    } catch (error) {
      logger.error(error);
      throw new AppError(500, ErrorCode.INTERNAL_SERVER_ERROR, "Failed to list indexers");
    }
  }

  private getCache<T>(key: string): T | null {
    const cache = this.cache.get(key);
    if (cache && Date.now() - this.lastFetchTime < this.CACHE_EXPIRY) {
      return cache as T;
    }
    return null;
  }

  private setCache(key: string, data: IndexerInfo["info"][]): void {
    this.cache.set(key, data);
    this.lastFetchTime = Date.now();
  }

  private invalidateCache(): void {
    this.cache.clear();
    this.lastFetchTime = 0;
  }
}
