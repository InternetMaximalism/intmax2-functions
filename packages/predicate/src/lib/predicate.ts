import { BadRequestError, config } from "@intmax2-function/shared";
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
    try {
      const response = await fetch(config.PREDICATE_API_URL, {
        method: "POST",
        headers: { "x-api-key": config.PREDICATE_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Predicate API error (${response.status}): ${errorText}`);
      }

      return (await response.json()) as PredicateResponse;
    } catch (error) {
      throw new BadRequestError(`Predicate API error: ${(error as Error).message}`);
    }
  }
}
