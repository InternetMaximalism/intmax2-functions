import type { FirestoreDocumentKey } from "../types";
import { BaseIndexer } from "./baseIndexer";

class IndexerFactory {
  private static instances = new Map<FirestoreDocumentKey, BaseIndexer>();

  static getInstance(doc: FirestoreDocumentKey): BaseIndexer {
    if (!this.instances.has(doc)) {
      this.instances.set(doc, this.createIndexer(doc));
    }
    return this.instances.get(doc) as BaseIndexer;
  }

  static createIndexer(doc: FirestoreDocumentKey): BaseIndexer {
    return new BaseIndexer(doc);
  }
}

export const getIndexer = (doc: FirestoreDocumentKey) => IndexerFactory.getInstance(doc);
