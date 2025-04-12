export const getRandomNumber = (min: number, max: number, decimalPlaces: number = 0) => {
  const randomNumber = Math.random() * (max - min) + min;
  return Number(randomNumber.toFixed(decimalPlaces));
};

export const sleep = (ms = 1000) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
