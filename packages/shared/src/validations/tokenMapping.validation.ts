import { z } from "zod";

const tokenIndexSchema = z.union([
  z.number().int().nonnegative(),
  z.string().regex(/^\d+$/, "Each tokenIndex must be a numeric string"),
]);

const tokenIndexesSchema = z
  .array(tokenIndexSchema)
  .min(1, "tokenIndexes must contain at least one numeric value")
  .transform((arr) => arr.map(String))
  .optional();

export const tokenIndexesValidation = z.strictObject({
  tokenIndexes: tokenIndexesSchema,
});
