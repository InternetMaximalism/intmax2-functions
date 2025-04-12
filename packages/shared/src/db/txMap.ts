import type { CollectionReference } from "@google-cloud/firestore";
import { FIRESTORE_COLLECTIONS, FIRESTORE_MAX_BATCH_SIZE } from "../constants";
import { AppError, ErrorCode, logger } from "../lib";
import { db } from "./firestore";
import { TxMapData } from "../types";

export class TxMap {
  private static instance: TxMap | null = null;
  private readonly db = db;
  private readonly collection: CollectionReference;

  constructor() {
    this.collection = this.db.collection(FIRESTORE_COLLECTIONS.TX_MAPS);
  }

  public static getInstance() {
    if (!TxMap.instance) {
      TxMap.instance = new TxMap();
    }
    return TxMap.instance;
  }

  async saveTxMap(digest: string, txMap: Partial<TxMapData>) {
    try {
      const ref = this.collection.doc(digest);
      await ref.set(txMap, { merge: true });
      return { digest: ref.id, ...txMap } as TxMapData;
    } catch (error) {
      logger.error(error);
      throw new AppError(500, ErrorCode.INTERNAL_SERVER_ERROR, "Failed to save tx map");
    }
  }

  async getTxMap(digest: string) {
    try {
      const doc = await this.collection.doc(digest).get();
      if (!doc.exists) {
        return null;
      }
      return { digest: doc.id, ...doc.data() } as TxMapData;
    } catch (error) {
      logger.error(error);
      throw new AppError(500, ErrorCode.INTERNAL_SERVER_ERROR, "Failed to get tx map");
    }
  }

  async deleteExpiredTxMaps() {
    try {
      const now = new Date();
      const snapshot = await this.collection.where("expiresAt", "<", now).get();

      if (snapshot.empty) {
        return 0;
      }
      let deletedCount = 0;

      for (let i = 0; i < snapshot.size; i += FIRESTORE_MAX_BATCH_SIZE) {
        const batch = this.db.batch();
        const batchDocs = snapshot.docs.slice(i, i + FIRESTORE_MAX_BATCH_SIZE);

        for (const doc of batchDocs) {
          batch.delete(doc.ref);
        }

        deletedCount += batchDocs.length;
        await batch.commit();
      }

      logger.info(`Deleted ${deletedCount} expired TxMap documents`);
      return deletedCount;
    } catch (error) {
      logger.error(error);
      throw new AppError(500, ErrorCode.INTERNAL_SERVER_ERROR, "Failed to delete expired tx maps");
    }
  }
}
