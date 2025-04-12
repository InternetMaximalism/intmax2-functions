import { NotFoundError, QueryMap, generateRandomKey } from "@intmax2-functions/shared";

export const saveQueryMap = async (query: string) => {
  const randomKey = generateRandomKey();
  await QueryMap.getInstance().saveQueryMap(randomKey, query);
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
