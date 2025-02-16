import type { CollectionReference, Query } from "@google-cloud/firestore";
import { FIRESTORE_COLLECTIONS, FIRESTORE_MAX_BATCH_SIZE } from "../constants";
import { AppError, ErrorCode, logger } from "../lib";
import type { TokenMappingData, TokenMappingFilters } from "../types";
import { db } from "./firestore";

export class TokenMapping {
  private static instance: TokenMapping | null = null;
  private readonly db = db;
  private readonly collection: CollectionReference;
  protected readonly defaultOrderField = "__name__";
  protected readonly defaultOrderDirection = "asc";

  constructor() {
    this.collection = db.collection(FIRESTORE_COLLECTIONS.TOKEN_MAPPINGS);
  }

  public static getInstance() {
    if (!TokenMapping.instance) {
      TokenMapping.instance = new TokenMapping();
    }
    return TokenMapping.instance;
  }

  async addTokenMappingsBatch(inputs: TokenMappingData[]) {
    const batches = [];
    const now = new Date();

    try {
      for (let i = 0; i < inputs.length; i += FIRESTORE_MAX_BATCH_SIZE) {
        const batch = this.db.batch();
        const batchInputs = inputs.slice(i, i + FIRESTORE_MAX_BATCH_SIZE);

        for (const input of batchInputs) {
          const ref = this.collection.doc(input.tokenIndex.toString());

          batch.set(
            ref,
            {
              ...input,
              createdAt: now,
            },
            { merge: false },
          );
        }

        batches.push(batch.commit());
      }

      await Promise.all(batches);

      return {
        count: inputs.length,
      };
    } catch (error) {
      logger.error(error);
      throw new AppError(
        500,
        ErrorCode.INTERNAL_SERVER_ERROR,
        `Failed to add tokenMappings: ${(error as Error).message}`,
      );
    }
  }

  private async list(buildQuery?: (query: Query) => Query) {
    try {
      let query = this.collection.orderBy(
        this.defaultOrderField as string,
        this.defaultOrderDirection,
      );

      if (buildQuery) {
        query = buildQuery(query);
      }

      const allItems = [];
      let lastDoc: FirebaseFirestore.DocumentSnapshot | null = null;

      do {
        let batchQuery = query.limit(FIRESTORE_MAX_BATCH_SIZE);
        if (lastDoc) {
          batchQuery = batchQuery.startAfter(lastDoc);
        }

        const snapshot = await batchQuery.get();
        const batchItems = snapshot.docs.map((doc) => {
          return { ...doc.data() } as TokenMappingData;
        });

        allItems.push(...batchItems);
        if (snapshot.size < FIRESTORE_MAX_BATCH_SIZE) {
          lastDoc = null;
        } else {
          lastDoc = snapshot.docs[snapshot.docs.length - 1];
        }
      } while (lastDoc);

      return allItems;
    } catch (error) {
      logger.error(error);
      throw new AppError(
        500,
        ErrorCode.INTERNAL_SERVER_ERROR,
        `Failed to list ${(error as Error).message}`,
      );
    }
  }

  async fetchTokenMappings(filters?: TokenMappingFilters) {
    return this.list((query) => {
      let modified = query;
      if (filters?.tokenIndexes) {
        modified = modified.where("__name__", "in", filters.tokenIndexes);
      }
      return modified;
    });
  }

  async fetchAllTokenMappings() {
    return this.list();
  }
}
