import type { CollectionReference } from "@google-cloud/firestore";
import { FIRESTORE_COLLECTIONS } from "../constants";
import { AppError, ErrorCode, logger } from "../lib";
import { TokenMappingData } from "../types";
import { db } from "./firestore";

export class TokenMapping {
  private readonly tokenMapppingCollection: CollectionReference;

  constructor() {
    this.tokenMapppingCollection = db.collection(FIRESTORE_COLLECTIONS.TOKEN_MAPPINGS);
  }

  async addTokenMappingBatch(
    items: {
      contractAddress: string;
      tokenIndex: number;
      symbol: string;
      decimals: number;
    }[],
  ) {
    const batch = db.batch();
    const now = new Date();

    items.forEach((item) => {
      const { tokenIndex, symbol, decimals, contractAddress } = item;
      const tokenIndexRef = this.tokenMapppingCollection.doc(String(tokenIndex));

      batch.set(
        tokenIndexRef,
        {
          tokenIndex,
          symbol,
          decimals,
          contractAddress,
          createdAt: now,
        },
        { merge: false },
      );
    });

    try {
      await batch.commit();
    } catch (error) {
      logger.error(error);
      throw new AppError(500, ErrorCode.INTERNAL_SERVER_ERROR, "Failed to add token mapping batch");
    }
  }

  async updateTokenMappingBatch(items: { tokenIndex: string; logoUrl: string }[]) {
    const batch = db.batch();

    items.forEach((item) => {
      const { tokenIndex, logoUrl } = item;
      const tokenIndexRef = this.tokenMapppingCollection.doc(String(tokenIndex));

      batch.set(
        tokenIndexRef,
        {
          logoUrl,
        },
        { merge: true },
      );
    });

    try {
      await batch.commit();
    } catch (error) {
      logger.error(error);
      throw new AppError(500, ErrorCode.INTERNAL_SERVER_ERROR, "Failed to add token mapping batch");
    }
  }

  async listTokenMappings(tokenIndexes: string[] = []) {
    try {
      const query =
        tokenIndexes.length > 0
          ? this.tokenMapppingCollection.where("__name__", "in", tokenIndexes)
          : this.tokenMapppingCollection;

      const snapshot = await query.get();
      const tokenMappings = snapshot.docs.map((doc) => {
        const { createdAt, tokenType, ...rest } = doc.data();
        return { ...rest } as TokenMappingData;
      });
      if (tokenMappings.length === 0) return [];

      return tokenMappings;
    } catch (error) {
      logger.error(error);
      throw new AppError(500, ErrorCode.INTERNAL_SERVER_ERROR, "Failed to list token mappings");
    }
  }

  async listAllTokenMappings(pageSize: number = 200, lastDoc?: FirebaseFirestore.DocumentSnapshot) {
    try {
      let query = this.tokenMapppingCollection.orderBy("__name__");

      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }

      query = query.limit(pageSize);

      const snapshot = await query.get();
      const tokenMappings = snapshot.docs.map((doc) => {
        const { createdAt, tokenType, ...rest } = doc.data();
        return { ...rest } as TokenMappingData;
      });

      const lastVisible = snapshot.docs[snapshot.docs.length - 1];

      return {
        tokenMappings,
        lastVisible,
        hasMore: snapshot.docs.length === pageSize,
      };
    } catch (error) {
      logger.error(error);
      throw new AppError(500, ErrorCode.INTERNAL_SERVER_ERROR, "Failed to list token mappings");
    }
  }

  async fetchAllTokenMappings(): Promise<TokenMappingData[]> {
    try {
      const pageSize = 200;
      let allTokenMappings: TokenMappingData[] = [];
      let lastVisible: FirebaseFirestore.DocumentSnapshot | undefined = undefined;
      let hasMore = true;

      while (hasMore) {
        const result = await this.listAllTokenMappings(pageSize, lastVisible);

        allTokenMappings = [...allTokenMappings, ...result.tokenMappings];

        hasMore = result.hasMore;

        lastVisible = result.lastVisible;

        logger.info(`Fetched ${allTokenMappings.length} token mappings so far`);
      }

      logger.info(`Successfully fetched all ${allTokenMappings.length} token mappings`);
      return allTokenMappings;
    } catch (error) {
      logger.error("Failed to fetch all token mappings:", error);
      throw new AppError(
        500,
        ErrorCode.INTERNAL_SERVER_ERROR,
        "Failed to fetch all token mappings",
      );
    }
  }
}
