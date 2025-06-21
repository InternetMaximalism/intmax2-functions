import type { CollectionReference } from "@google-cloud/firestore";
import { FIRESTORE_COLLECTIONS } from "../constants";
import { AppError, ErrorCode, logger } from "../lib";
import type { MintEventData, MintEventType, MintEventInput } from "../types";
import { db } from "./firestore";

export class MintEvent {
  private static instance: MintEvent | null = null;
  private readonly collection: CollectionReference;

  constructor() {
    this.collection = db.collection(FIRESTORE_COLLECTIONS.MINTER_EVENTS);
  }

  public static getInstance() {
    if (!MintEvent.instance) {
      MintEvent.instance = new MintEvent();
    }
    return MintEvent.instance;
  }

  async addEvent(event: MintEventInput) {
    try {
      await this.collection.add({
        ...event,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      logger.info("Event added successfully");
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(error);
      throw new AppError(500, ErrorCode.INTERNAL_SERVER_ERROR, "Failed to add minter event");
    }
  }

  async getLatestEventByType(type: MintEventType): Promise<MintEventData | null> {
    try {
      const snapshot = await this.collection
        .where("type", "==", type)
        .orderBy("createdAt", "desc")
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as MintEventData;
    } catch (error) {
      logger.error(error);
      throw new AppError(500, ErrorCode.INTERNAL_SERVER_ERROR, "Failed to get latest minter event");
    }
  }
}
