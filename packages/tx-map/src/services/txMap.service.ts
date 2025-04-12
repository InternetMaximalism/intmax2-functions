import { NotFoundError, TxMap, SaveTxMapValidationType } from "@intmax2-functions/shared";

export const saveTxMap = async ({ expiresIn, digest, ...rest }: SaveTxMapValidationType) => {
  const expiresAt = new Date(Date.now() + expiresIn * 1000);
  await TxMap.getInstance().saveTxMap(digest, { ...rest, expiresAt });
  return {
    digest,
  };
};

export const getTxMap = async (key: string) => {
  const queryMap = await TxMap.getInstance().getTxMap(key);
  if (!queryMap) {
    throw new NotFoundError(`Tx map not found for key: ${key}`);
  }
  return queryMap;
};
