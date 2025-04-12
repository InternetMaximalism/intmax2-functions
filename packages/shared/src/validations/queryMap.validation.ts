import { z } from "zod";
import { DEFAULT_EXPIRES_IN, MIN_EXPIRES_IN } from "../constants";

export const saveQueryMapValidation = z.strictObject({
  query: z.string(),
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

export type SaveQueryMapValidationType = z.infer<typeof saveQueryMapValidation>;

export const getQueryMapValidation = z.strictObject({
  key: z.string(),
});
