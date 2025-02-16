import { z } from "zod";
import { addressSchema } from "./address.validation";

const contractAddressesSchema = z
  .array(addressSchema)
  .min(1, "contract addresses must contain at least one numeric value")
  .transform((arr) => arr.map((address) => address.toLowerCase()))
  .optional();

export const tokenPricesValidation = z.strictObject({
  contractAddresses: contractAddressesSchema,
});
