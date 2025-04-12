import { z } from "zod";
import { DEFAULT_EXPIRES_IN, MIN_EXPIRES_IN } from "../constants";

export const saveTxMapValidation = z.strictObject({
  digest: z.string(),
  data: z.string(),
  expiresIn: z
    .number()
    .optional()
    .default(DEFAULT_EXPIRES_IN)
    .transform((val) => {
      if (val < MIN_EXPIRES_IN) {
        throw new Error(`expiresIn must be greater than ${MIN_EXPIRES_IN}`);
      }
      if (val > DEFAULT_EXPIRES_IN) {
        throw new Error(`expiresIn must be less than ${DEFAULT_EXPIRES_IN}`);
      }
      return val;
    }),
});

export type SaveTxMapValidationType = z.infer<typeof saveTxMapValidation>;

export const getTxMapValidation = z.strictObject({
  digest: z.string(),
});
