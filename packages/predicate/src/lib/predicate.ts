import { config } from "@intmax2-functions/shared";
import type {
  IPredicateClient,
  PredicateConfig,
  PredicateRequest,
  PredicateResponse,
} from "../types.js";

export class Predicate {
  private static instance: Predicate | undefined;
  readonly predicateClient: IPredicateClient;

  constructor(predicateClient: IPredicateClient) {
    this.predicateClient = predicateClient;
  }

  public static async getInstance() {
    if (!Predicate.instance) {
      const { PredicateClient } = await import("predicate-sdk");

      const predicateConfig: PredicateConfig = {
        apiUrl: config.PREDICATE_API_URL,
        apiKey: config.PREDICATE_API_KEY,
      };

      const predicateClient = new PredicateClient(predicateConfig);
      Predicate.instance = new Predicate(predicateClient);
    }

    return Predicate.instance;
  }

  async evaluatePolicy(body: PredicateRequest): Promise<PredicateResponse> {
    return this.predicateClient.evaluatePolicy(body);
  }
}
