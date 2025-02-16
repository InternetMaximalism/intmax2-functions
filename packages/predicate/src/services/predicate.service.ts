import type { FetchPredicateSignatureValidationType } from "@intmax2-functions/shared";
import { Predicate } from "../lib/predicate.js";

export const fetchPredicateSignatures = async (request: FetchPredicateSignatureValidationType) => {
  const predicateClient = await Predicate.getInstance();
  const signatures = await predicateClient.evaluatePolicy(request);
  return signatures;
};
