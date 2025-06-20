import { z } from "zod";
import type { Address } from "../types";

const ETHEREUM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

const isValidEthereumAddress = (address: string): boolean => {
  return ETHEREUM_ADDRESS_REGEX.test(address);
};

export const addressSchema = z
  .string()
  .refine((val) => isValidEthereumAddress(val), {
    message: "Invalid Ethereum address format",
  })
  .transform((val) => val.toLowerCase() as Address);

export const addressValidation = z.strictObject({
  address: addressSchema,
});

export const addressesValidation = z.strictObject({
  addresses: z
    .array(addressSchema)
    .min(1)
    .max(30)
    .transform((addresses) => [...new Set(addresses.map((addr) => addr.toLowerCase()))]),
});
