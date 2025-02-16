import { RollupAbi, config, createNetworkClient, logger } from "@intmax2-functions/shared";
import axios, { AxiosError } from "axios";
import { getContract } from "viem";
import { ACCEPTABLE_BLOCK_DIFFERENCE, API_TIMEOUT } from "../constants";
import type { BlockNumberResponse } from "../type";

export const fetchLatestValidityProverBlockNumber = async () => {
  try {
    const response = await axios.get<BlockNumberResponse>(
      `${config.API_VALIDITY_PROVER_BASE_URL}/validity-prover/block-number`,
      {
        timeout: API_TIMEOUT,
        headers: {
          Accept: "application/json",
        },
      },
    );
    if (response.data?.blockNumber === undefined) {
      throw new Error("Block number is missing in the response");
    }

    return response.data.blockNumber;
  } catch (error) {
    logger.error(`Failed to fetch block number: ${error instanceof Error ? error.message : error}`);

    if (error instanceof AxiosError) {
      throw new Error(`Failed to fetch block number: ${error.response?.status}`);
    }

    throw new Error(
      `Unexpected error while fetching block number: ${
        error instanceof Error ? error.message : error
      }`,
    );
  }
};

export const fetchLatestRollupBlockNumber = async () => {
  const rollupContract = getContract({
    address: config.ROLLUP_CONTRACT_ADDRESS as `0x${string}`,
    abi: RollupAbi,
    client: createNetworkClient("scroll"),
  });
  const blockNumber = await rollupContract.read.getLatestBlockNumber();
  return Number(blockNumber);
};

export const compareBlockNumbers = (
  validityProverBlockNumber: number,
  rollupBlockNumber: number,
) => {
  const blockDifference = rollupBlockNumber - validityProverBlockNumber;
  const isValid =
    validityProverBlockNumber > rollupBlockNumber ||
    validityProverBlockNumber + ACCEPTABLE_BLOCK_DIFFERENCE > rollupBlockNumber;

  const message = `Block difference: ${blockDifference} validityProverBlock: ${validityProverBlockNumber} rollupBlock: ${rollupBlockNumber}`;

  logger.info(message);

  return {
    isValid,
    message,
  };
};
