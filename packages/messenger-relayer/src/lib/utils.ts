import type { MessengerType } from "../types";

const isValidMessengerType = (type: string): type is MessengerType => {
  return ["withdrawal", "claim"].includes(type);
};

export const getMessengerType = () => {
  const args = process.argv.slice(2);
  const type = args[0]?.toLowerCase();

  if (!type || !isValidMessengerType(type)) {
    throw new Error(`Invalid messenger type: ${type}. Expected 'withdrawal' or 'claim'`);
  }

  return type;
};
