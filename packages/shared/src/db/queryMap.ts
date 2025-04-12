import type { CollectionReference } from "@google-cloud/firestore";
import { FIRESTORE_COLLECTIONS } from "../constants";
import { AppError, ErrorCode, logger } from "../lib";
import { db } from "./firestore";

export class QueryMap {
  private static instance: QueryMap | null = null;
  private readonly collection: CollectionReference;

  constructor() {
    this.collection = db.collection(FIRESTORE_COLLECTIONS.QUERY_MAPS);
  }

  public static getInstance() {
    if (!QueryMap.instance) {
      QueryMap.instance = new QueryMap();
    }
    return QueryMap.instance;
  }

  async saveQueryMap<T>(key: string, queryMap: Partial<T>) {
    try {
      const ref = this.collection.doc(key);
      await ref.set(queryMap);
      return { id: ref.id, ...queryMap } as T;
    } catch (error) {
      logger.error(error);
      throw new AppError(500, ErrorCode.INTERNAL_SERVER_ERROR, "Failed to save query map");
    }
  }

  async getQueryMap<T>(key: string) {
    try {
      const doc = await this.collection.doc(key).get();
      if (!doc.exists) {
        return null;
      }
      return { id: doc.id, ...doc.data() } as T;
    } catch (error) {
      logger.error(error);
      throw new AppError(500, ErrorCode.INTERNAL_SERVER_ERROR, "Failed to get query map");
    }
  }
}
