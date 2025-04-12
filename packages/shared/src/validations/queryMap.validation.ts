import { z } from "zod";

export const saveQueryMapValidation = z.strictObject({
  query: z.string(),
});

export const getQueryMapValidation = z.strictObject({
  key: z.string(),
});
