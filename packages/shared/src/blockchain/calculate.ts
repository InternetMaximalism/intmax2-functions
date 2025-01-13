import { type Chain, type PublicClient } from "viem";
import { estimateContractGas } from "viem/actions";
import { estimateContractL1Fee } from "viem/op-stack";
import type { ContractCallParameters } from "../types";

interface GetTotalFeeParams {
  ethereumClient: PublicClient;
  contractCallParams: ContractCallParameters;
  multiplier: number;
}

interface GasPriceData {
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
}

const PRECISION = 10n;

export const getTotalFee = async ({
  ethereumClient,
  contractCallParams,
  multiplier,
}: GetTotalFeeParams) => {
  const [l1Fee, l2Gas, gasPriceData] = await Promise.all([
    getL1Fee(ethereumClient, contractCallParams),
    getL2Gas(ethereumClient, contractCallParams),
    getL2GasPrice(ethereumClient),
  ]);

  const { maxFeePerGas, maxPriorityFeePerGas, l2GasPrice } = calculateAdjustedGasPrices(
    multiplier,
    gasPriceData,
  );

  const totalFee = l1Fee + l2Gas * l2GasPrice;

  return {
    totalFee,
    maxFeePerGas,
    maxPriorityFeePerGas,
  };
};

const getL1Fee = async (
  publicClient: PublicClient,
  { contractAddress, ...rest }: ContractCallParameters,
) => {
  const l1Fee = await estimateContractL1Fee(publicClient, {
    chain: publicClient.chain as Chain & null,
    address: contractAddress,
    ...rest,
  });

  return l1Fee;
};

export const getL2Gas = async (
  publicClient: PublicClient,
  { contractAddress, ...rest }: ContractCallParameters,
) => {
  const l2Gas = await estimateContractGas(publicClient, {
    address: contractAddress,
    ...rest,
  });

  return l2Gas;
};

const getL2GasPrice = async (publicClient: PublicClient) => {
  const { maxFeePerGas, maxPriorityFeePerGas } = await publicClient.estimateFeesPerGas();

  return {
    maxFeePerGas,
    maxPriorityFeePerGas,
  };
};

const calculateAdjustedGasPrices = (multiplier: number, gasPriceData: GasPriceData) => {
  const multiplierScaled = BigInt(Math.round(multiplier * Number(PRECISION)));

  const maxFeePerGas = (gasPriceData.maxFeePerGas * multiplierScaled) / PRECISION;
  const maxPriorityFeePerGas = (gasPriceData.maxPriorityFeePerGas * multiplierScaled) / PRECISION;

  return {
    maxFeePerGas,
    maxPriorityFeePerGas,
    l2GasPrice: maxFeePerGas,
  };
};

export const calculateGasMultiplier = (attempt: number, incrementRate: number = 0.2) => {
  if (attempt === 0) return 1;

  return 1 + attempt * incrementRate;
};

export const getMaxGasMultiplier = async (publicClient: PublicClient, multiplier: number) => {
  const gasPriceData = await publicClient.estimateFeesPerGas();
  const { maxFeePerGas, maxPriorityFeePerGas } = calculateAdjustedGasPrices(
    multiplier,
    gasPriceData,
  );

  return { maxFeePerGas, maxPriorityFeePerGas };
};

export const calculateIncreasedGasFees = (
  previousMaxFeePerGas: bigint,
  previousMaxPriorityFeePerGas: bigint,
  currentMaxFeePerGas: bigint,
  currentMaxPriorityFeePerGas: bigint,
) => {
  const newMaxFeePerGas =
    previousMaxFeePerGas > currentMaxFeePerGas ? previousMaxFeePerGas + 1n : currentMaxFeePerGas;

  const newMaxPriorityFeePerGas =
    previousMaxPriorityFeePerGas > currentMaxPriorityFeePerGas
      ? previousMaxPriorityFeePerGas
      : currentMaxPriorityFeePerGas;

  return {
    newMaxFeePerGas,
    newMaxPriorityFeePerGas,
  };
};
