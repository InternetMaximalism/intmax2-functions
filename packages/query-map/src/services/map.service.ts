import {
  NotFoundError,
  QueryMap,
  SaveQueryMapValidationType,
  generateRandomKey,
} from "@intmax2-functions/shared";

export const saveQueryMap = async ({ query, expiresIn }: SaveQueryMapValidationType) => {
  const randomKey = generateRandomKey();
  const expiresAt = new Date(Date.now() + expiresIn * 1000);
  await QueryMap.getInstance().saveQueryMap(randomKey, { query, expiresAt });
  return {
    key: randomKey,
  };
};

export const getQueryMap = async (key: string) => {
  const queryMap = await QueryMap.getInstance().getQueryMap(key);
  if (!queryMap) {
    throw new NotFoundError(`Query map not found for key: ${key}`);
  }
  return queryMap;
};
