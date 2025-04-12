import { MAP_KEY_LENGTH } from "../constants";

export const getRandomNumber = (min: number, max: number, decimalPlaces: number = 0) => {
  const randomNumber = Math.random() * (max - min) + min;
  return Number(randomNumber.toFixed(decimalPlaces));
};

export const sleep = (ms = 1000) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const CHAR_SET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export const generateRandomKey = (length = MAP_KEY_LENGTH) => {
  let result = "";

  const randomValues = new Uint8Array(length);
  window.crypto.getRandomValues(randomValues);

  for (let i = 0; i < length; i++) {
    result += CHAR_SET.charAt(randomValues[i] % CHAR_SET.length);
  }

  return result;
};
