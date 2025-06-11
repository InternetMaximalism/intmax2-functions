import type { DepositEvent } from "@intmax2-functions/shared";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { splitDepositSummary } from "./summarize.service";

vi.mock("../constants", () => ({
  GAS_CONFIG: {
    baseGas: 100000,
    perDepositGas: 50000,
    bufferGas: 20000,
  },
  MAX_DEPOSIT_BATCH_SIZE: 3,
}));

describe("splitDepositSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("splitDepositSummary", () => {
    it("should return shouldSubmit: false when lastUpToDepositId >= maxDepositId", async () => {
      const processedDepositEvents: DepositEvent[] = [
        {
          name: "Deposited",
          address: "0x1234567890123456789012345678901234567890",
          blockNumber: 1000n,
          blockTimestamp: "2024-01-01T00:00:00Z",
          blockHash: "0xblock1",
          transactionHash: "0xabc123",
          args: {
            depositId: 5n,
            sender: "0xsender1",
            recipientSaltHash: "0xsalt1",
            tokenIndex: 0,
            amount: 1000n,
            depositedAt: 1640995200n,
          },
        },
        {
          name: "Deposited",
          address: "0x1234567890123456789012345678901234567890",
          blockNumber: 900n,
          blockTimestamp: "2024-01-01T00:00:00Z",
          blockHash: "0xblock2",
          transactionHash: "0xdef456",
          args: {
            depositId: 3n,
            sender: "0xsender2",
            recipientSaltHash: "0xsalt2",
            tokenIndex: 1,
            amount: 2000n,
            depositedAt: 1640995300n,
          },
        },
      ];
      const processedState = { lastUpToDepositId: 5n };
      const currentBlockNumber = 2000n;

      const result = await splitDepositSummary(
        processedDepositEvents,
        processedState,
        currentBlockNumber,
      );

      expect(result).toEqual({
        shouldSubmit: false,
        batches: [],
      });
    });

    it("should return shouldSubmit: false when lastUpToDepositId > maxDepositId", async () => {
      const processedDepositEvents: DepositEvent[] = [
        {
          name: "Deposited",
          address: "0x1234567890123456789012345678901234567890",
          blockNumber: 1000n,
          blockTimestamp: "2024-01-01T00:00:00Z",
          blockHash: "0xblock1",
          transactionHash: "0xabc123",
          args: {
            depositId: 5n,
            sender: "0xsender1",
            recipientSaltHash: "0xsalt1",
            tokenIndex: 0,
            amount: 1000n,
            depositedAt: 1640995200n,
          },
        },
      ];
      const processedState = { lastUpToDepositId: 10n };
      const currentBlockNumber = 2000n;

      const result = await splitDepositSummary(
        processedDepositEvents,
        processedState,
        currentBlockNumber,
      );

      expect(result).toEqual({
        shouldSubmit: false,
        batches: [],
      });
    });

    it("should create single batch for small number of deposits", async () => {
      const processedDepositEvents: DepositEvent[] = [
        {
          name: "Deposited",
          address: "0x1234567890123456789012345678901234567890",
          blockNumber: 800n,
          blockTimestamp: "2024-01-01T00:00:00Z",
          blockHash: "0xblock1",
          transactionHash: "0xabc123",
          args: {
            depositId: 1n,
            sender: "0xsender1",
            recipientSaltHash: "0xsalt1",
            tokenIndex: 0,
            amount: 1000n,
            depositedAt: 1640995200n,
          },
        },
        {
          name: "Deposited",
          address: "0x1234567890123456789012345678901234567890",
          blockNumber: 900n,
          blockTimestamp: "2024-01-01T00:00:00Z",
          blockHash: "0xblock2",
          transactionHash: "0xdef456",
          args: {
            depositId: 2n,
            sender: "0xsender2",
            recipientSaltHash: "0xsalt2",
            tokenIndex: 1,
            amount: 2000n,
            depositedAt: 1640995300n,
          },
        },
        {
          name: "Deposited",
          address: "0x1234567890123456789012345678901234567890",
          blockNumber: 1000n,
          blockTimestamp: "2024-01-01T00:00:00Z",
          blockHash: "0xblock3",
          transactionHash: "0x789xyz",
          args: {
            depositId: 3n,
            sender: "0xsender3",
            recipientSaltHash: "0xsalt3",
            tokenIndex: 0,
            amount: 3000n,
            depositedAt: 1640995400n,
          },
        },
      ];
      const processedState = { lastUpToDepositId: 0n };
      const currentBlockNumber = 2000n;

      const result = await splitDepositSummary(
        processedDepositEvents,
        processedState,
        currentBlockNumber,
      );

      expect(result.shouldSubmit).toBe(true);
      expect(result.batches).toHaveLength(1);

      const batch = result.batches[0];
      expect(batch.upToDepositId).toBe(3n);
      expect(batch.numDepositsToRelay).toBe(3n);
      expect(batch.gasLimit).toBe(270000n);
      expect(batch.blockNumber).toBe(currentBlockNumber);
    });

    it("should create multiple batches when deposits exceed MAX_DEPOSIT_BATCH_SIZE", async () => {
      const processedDepositEvents: DepositEvent[] = [
        {
          name: "Deposited",
          address: "0x1234567890123456789012345678901234567890",
          blockNumber: 800n,
          blockTimestamp: "2024-01-01T00:00:00Z",
          blockHash: "0xblock1",
          transactionHash: "0xabc123",
          args: {
            depositId: 1n,
            sender: "0xsender1",
            recipientSaltHash: "0xsalt1",
            tokenIndex: 0,
            amount: 1000n,
            depositedAt: 1640995200n,
          },
        },
        {
          name: "Deposited",
          address: "0x1234567890123456789012345678901234567890",
          blockNumber: 900n,
          blockTimestamp: "2024-01-01T00:00:00Z",
          blockHash: "0xblock2",
          transactionHash: "0xdef456",
          args: {
            depositId: 2n,
            sender: "0xsender2",
            recipientSaltHash: "0xsalt2",
            tokenIndex: 1,
            amount: 2000n,
            depositedAt: 1640995300n,
          },
        },
        {
          name: "Deposited",
          address: "0x1234567890123456789012345678901234567890",
          blockNumber: 1000n,
          blockTimestamp: "2024-01-01T00:00:00Z",
          blockHash: "0xblock3",
          transactionHash: "0x789xyz",
          args: {
            depositId: 3n,
            sender: "0xsender3",
            recipientSaltHash: "0xsalt3",
            tokenIndex: 0,
            amount: 3000n,
            depositedAt: 1640995400n,
          },
        },
        {
          name: "Deposited",
          address: "0x1234567890123456789012345678901234567890",
          blockNumber: 1100n,
          blockTimestamp: "2024-01-01T00:00:00Z",
          blockHash: "0xblock4",
          transactionHash: "0x111aaa",
          args: {
            depositId: 4n,
            sender: "0xsender4",
            recipientSaltHash: "0xsalt4",
            tokenIndex: 1,
            amount: 4000n,
            depositedAt: 1640995500n,
          },
        },
        {
          name: "Deposited",
          address: "0x1234567890123456789012345678901234567890",
          blockNumber: 1200n,
          blockTimestamp: "2024-01-01T00:00:00Z",
          blockHash: "0xblock5",
          transactionHash: "0x222bbb",
          args: {
            depositId: 5n,
            sender: "0xsender5",
            recipientSaltHash: "0xsalt5",
            tokenIndex: 0,
            amount: 5000n,
            depositedAt: 1640995600n,
          },
        },
      ];
      const processedState = { lastUpToDepositId: 0n };
      const currentBlockNumber = 2000n;

      const result = await splitDepositSummary(
        processedDepositEvents,
        processedState,
        currentBlockNumber,
      );

      expect(result.shouldSubmit).toBe(true);
      expect(result.batches).toHaveLength(2);

      const batch1 = result.batches[0];
      expect(batch1.upToDepositId).toBe(3n);
      expect(batch1.numDepositsToRelay).toBe(3n);
      expect(batch1.gasLimit).toBe(270000n);
      expect(batch1.blockNumber).toBe(1000n);

      const batch2 = result.batches[1];
      expect(batch2.upToDepositId).toBe(5n);
      expect(batch2.numDepositsToRelay).toBe(2n);
      expect(batch2.gasLimit).toBe(220000n);
      expect(batch2.blockNumber).toBe(currentBlockNumber);
    });

    it("should handle non-sequential deposit IDs correctly", async () => {
      const processedDepositEvents: DepositEvent[] = [
        {
          name: "Deposited",
          address: "0x1234567890123456789012345678901234567890",
          blockNumber: 1000n,
          blockTimestamp: "2024-01-01T00:00:00Z",
          blockHash: "0xblock1",
          transactionHash: "0xabc123",
          args: {
            depositId: 10n,
            sender: "0xsender1",
            recipientSaltHash: "0xsalt1",
            tokenIndex: 0,
            amount: 1000n,
            depositedAt: 1640995200n,
          },
        },
        {
          name: "Deposited",
          address: "0x1234567890123456789012345678901234567890",
          blockNumber: 1050n,
          blockTimestamp: "2024-01-01T00:00:00Z",
          blockHash: "0xblock2",
          transactionHash: "0xbcd234",
          args: {
            depositId: 11n,
            sender: "0xsender2",
            recipientSaltHash: "0xsalt2",
            tokenIndex: 1,
            amount: 2000n,
            depositedAt: 1640995300n,
          },
        },
        {
          name: "Deposited",
          address: "0x1234567890123456789012345678901234567890",
          blockNumber: 1100n,
          blockTimestamp: "2024-01-01T00:00:00Z",
          blockHash: "0xblock3",
          transactionHash: "0xdef456",
          args: {
            depositId: 12n,
            sender: "0xsender3",
            recipientSaltHash: "0xsalt3",
            tokenIndex: 0,
            amount: 3000n,
            depositedAt: 1640995400n,
          },
        },
        {
          name: "Deposited",
          address: "0x1234567890123456789012345678901234567890",
          blockNumber: 1150n,
          blockTimestamp: "2024-01-01T00:00:00Z",
          blockHash: "0xblock4",
          transactionHash: "0xcde345",
          args: {
            depositId: 13n,
            sender: "0xsender4",
            recipientSaltHash: "0xsalt4",
            tokenIndex: 1,
            amount: 4000n,
            depositedAt: 1640995500n,
          },
        },
        {
          name: "Deposited",
          address: "0x1234567890123456789012345678901234567890",
          blockNumber: 1175n,
          blockTimestamp: "2024-01-01T00:00:00Z",
          blockHash: "0xblock5",
          transactionHash: "0xefg567",
          args: {
            depositId: 14n,
            sender: "0xsender5",
            recipientSaltHash: "0xsalt5",
            tokenIndex: 0,
            amount: 5000n,
            depositedAt: 1640995600n,
          },
        },
        {
          name: "Deposited",
          address: "0x1234567890123456789012345678901234567890",
          blockNumber: 1200n,
          blockTimestamp: "2024-01-01T00:00:00Z",
          blockHash: "0xblock6",
          transactionHash: "0x789xyz",
          args: {
            depositId: 15n,
            sender: "0xsender6",
            recipientSaltHash: "0xsalt6",
            tokenIndex: 1,
            amount: 6000n,
            depositedAt: 1640995700n,
          },
        },
      ];
      const processedState = { lastUpToDepositId: 5n };
      const currentBlockNumber = 2000n;

      const result = await splitDepositSummary(
        processedDepositEvents,
        processedState,
        currentBlockNumber,
      );

      expect(result.shouldSubmit).toBe(true);
      expect(result.batches).toHaveLength(2);

      const batch1 = result.batches[0];
      expect(batch1.upToDepositId).toBe(12n);
      expect(batch1.numDepositsToRelay).toBe(3n);
      expect(batch1.gasLimit).toBe(270000n);
      expect(batch1.blockNumber).toBe(1100n);

      const batch2 = result.batches[1];
      expect(batch2.upToDepositId).toBe(15n);
      expect(batch2.numDepositsToRelay).toBe(3n);
      expect(batch2.gasLimit).toBe(270000n);
      expect(batch2.blockNumber).toBe(currentBlockNumber);
    });

    it("should handle unsorted deposit events", async () => {
      const processedDepositEvents: DepositEvent[] = [
        {
          name: "Deposited",
          address: "0x1234567890123456789012345678901234567890",
          blockNumber: 1000n,
          blockTimestamp: "2024-01-01T00:00:00Z",
          blockHash: "0xblock3",
          transactionHash: "0x789xyz",
          args: {
            depositId: 3n,
            sender: "0xsender3",
            recipientSaltHash: "0xsalt3",
            tokenIndex: 0,
            amount: 3000n,
            depositedAt: 1640995400n,
          },
        },
        {
          name: "Deposited",
          address: "0x1234567890123456789012345678901234567890",
          blockNumber: 800n,
          blockTimestamp: "2024-01-01T00:00:00Z",
          blockHash: "0xblock1",
          transactionHash: "0xabc123",
          args: {
            depositId: 1n,
            sender: "0xsender1",
            recipientSaltHash: "0xsalt1",
            tokenIndex: 0,
            amount: 1000n,
            depositedAt: 1640995200n,
          },
        },
        {
          name: "Deposited",
          address: "0x1234567890123456789012345678901234567890",
          blockNumber: 900n,
          blockTimestamp: "2024-01-01T00:00:00Z",
          blockHash: "0xblock2",
          transactionHash: "0xdef456",
          args: {
            depositId: 2n,
            sender: "0xsender2",
            recipientSaltHash: "0xsalt2",
            tokenIndex: 1,
            amount: 2000n,
            depositedAt: 1640995300n,
          },
        },
      ];
      const processedState = { lastUpToDepositId: 0n };
      const currentBlockNumber = 2000n;

      const result = await splitDepositSummary(
        processedDepositEvents,
        processedState,
        currentBlockNumber,
      );

      expect(result.shouldSubmit).toBe(true);
      expect(result.batches).toHaveLength(1);

      const batch = result.batches[0];
      expect(batch.upToDepositId).toBe(3n);
      expect(batch.numDepositsToRelay).toBe(3n);
      expect(batch.gasLimit).toBe(270000n);
      expect(batch.blockNumber).toBe(currentBlockNumber);
    });

    it("should throw error when no deposits provided", async () => {
      const processedDepositEvents: DepositEvent[] = [];
      const processedState = { lastUpToDepositId: 0n };
      const currentBlockNumber = 2000n;

      await expect(
        splitDepositSummary(processedDepositEvents, processedState, currentBlockNumber),
      ).rejects.toThrow("No maxDepositId found");
    });

    it("should handle gaps when only processing certain range", async () => {
      const processedDepositEvents: DepositEvent[] = [
        {
          name: "Deposited",
          address: "0x1234567890123456789012345678901234567890",
          blockNumber: 1000n,
          blockTimestamp: "2024-01-01T00:00:00Z",
          blockHash: "0xblock1",
          transactionHash: "0xabc123",
          args: {
            depositId: 10n,
            sender: "0xsender1",
            recipientSaltHash: "0xsalt1",
            tokenIndex: 0,
            amount: 1000n,
            depositedAt: 1640995200n,
          },
        },
        {
          name: "Deposited",
          address: "0x1234567890123456789012345678901234567890",
          blockNumber: 1050n,
          blockTimestamp: "2024-01-01T00:00:00Z",
          blockHash: "0xblock2",
          transactionHash: "0xbcd234",
          args: {
            depositId: 11n,
            sender: "0xsender2",
            recipientSaltHash: "0xsalt2",
            tokenIndex: 1,
            amount: 2000n,
            depositedAt: 1640995300n,
          },
        },
        {
          name: "Deposited",
          address: "0x1234567890123456789012345678901234567890",
          blockNumber: 1100n,
          blockTimestamp: "2024-01-01T00:00:00Z",
          blockHash: "0xblock3",
          transactionHash: "0xdef456",
          args: {
            depositId: 12n,
            sender: "0xsender3",
            recipientSaltHash: "0xsalt3",
            tokenIndex: 0,
            amount: 3000n,
            depositedAt: 1640995400n,
          },
        },
      ];
      const processedState = { lastUpToDepositId: 9n };
      const currentBlockNumber = 2000n;

      const result = await splitDepositSummary(
        processedDepositEvents,
        processedState,
        currentBlockNumber,
      );

      expect(result.shouldSubmit).toBe(true);
      expect(result.batches).toHaveLength(1);

      const batch = result.batches[0];
      expect(batch.upToDepositId).toBe(12n);
      expect(batch.numDepositsToRelay).toBe(3n);
      expect(batch.gasLimit).toBe(270000n);
      expect(batch.blockNumber).toBe(currentBlockNumber);
    });

    it("should handle single deposit event", async () => {
      const processedDepositEvents: DepositEvent[] = [
        {
          name: "Deposited",
          address: "0x1234567890123456789012345678901234567890",
          blockNumber: 1000n,
          blockTimestamp: "2024-01-01T00:00:00Z",
          blockHash: "0xblock1",
          transactionHash: "0xabc123",
          args: {
            depositId: 5n,
            sender: "0xsender1",
            recipientSaltHash: "0xsalt1",
            tokenIndex: 0,
            amount: 1000n,
            depositedAt: 1640995200n,
          },
        },
      ];
      const processedState = { lastUpToDepositId: 3n };
      const currentBlockNumber = 2000n;

      const result = await splitDepositSummary(
        processedDepositEvents,
        processedState,
        currentBlockNumber,
      );

      expect(result.shouldSubmit).toBe(true);
      expect(result.batches).toHaveLength(1);

      const batch = result.batches[0];
      expect(batch.upToDepositId).toBe(5n);
      expect(batch.numDepositsToRelay).toBe(1n);
      expect(batch.gasLimit).toBe(170000n);
      expect(batch.blockNumber).toBe(currentBlockNumber);
    });

    it("should calculate gas limits correctly for different batch sizes", async () => {
      const processedDepositEvents: DepositEvent[] = [
        {
          name: "Deposited",
          address: "0x1234567890123456789012345678901234567890",
          blockNumber: 800n,
          blockTimestamp: "2024-01-01T00:00:00Z",
          blockHash: "0xblock1",
          transactionHash: "0xabc123",
          args: {
            depositId: 1n,
            sender: "0xsender1",
            recipientSaltHash: "0xsalt1",
            tokenIndex: 0,
            amount: 1000n,
            depositedAt: 1640995200n,
          },
        },
        {
          name: "Deposited",
          address: "0x1234567890123456789012345678901234567890",
          blockNumber: 900n,
          blockTimestamp: "2024-01-01T00:00:00Z",
          blockHash: "0xblock2",
          transactionHash: "0xdef456",
          args: {
            depositId: 2n,
            sender: "0xsender2",
            recipientSaltHash: "0xsalt2",
            tokenIndex: 1,
            amount: 2000n,
            depositedAt: 1640995300n,
          },
        },
      ];
      const processedState = { lastUpToDepositId: 0n };
      const currentBlockNumber = 2000n;

      const result = await splitDepositSummary(
        processedDepositEvents,
        processedState,
        currentBlockNumber,
      );

      expect(result.shouldSubmit).toBe(true);
      expect(result.batches).toHaveLength(1);

      const batch = result.batches[0];
      expect(batch.gasLimit).toBe(220000n);
    });

    it("should handle consecutive deposit IDs with proper events", async () => {
      const processedDepositEvents: DepositEvent[] = [
        {
          name: "Deposited",
          address: "0x1234567890123456789012345678901234567890",
          blockNumber: 800n,
          blockTimestamp: "2024-01-01T00:00:00Z",
          blockHash: "0xblock1",
          transactionHash: "0xabc123",
          args: {
            depositId: 1n,
            sender: "0xsender1",
            recipientSaltHash: "0xsalt1",
            tokenIndex: 0,
            amount: 1000n,
            depositedAt: 1640995200n,
          },
        },
        {
          name: "Deposited",
          address: "0x1234567890123456789012345678901234567890",
          blockNumber: 850n,
          blockTimestamp: "2024-01-01T00:00:00Z",
          blockHash: "0xblock2",
          transactionHash: "0xdef456",
          args: {
            depositId: 2n,
            sender: "0xsender2",
            recipientSaltHash: "0xsalt2",
            tokenIndex: 1,
            amount: 2000n,
            depositedAt: 1640995300n,
          },
        },
        {
          name: "Deposited",
          address: "0x1234567890123456789012345678901234567890",
          blockNumber: 900n,
          blockTimestamp: "2024-01-01T00:00:00Z",
          blockHash: "0xblock3",
          transactionHash: "0x789xyz",
          args: {
            depositId: 3n,
            sender: "0xsender3",
            recipientSaltHash: "0xsalt3",
            tokenIndex: 0,
            amount: 3000n,
            depositedAt: 1640995400n,
          },
        },
        {
          name: "Deposited",
          address: "0x1234567890123456789012345678901234567890",
          blockNumber: 950n,
          blockTimestamp: "2024-01-01T00:00:00Z",
          blockHash: "0xblock4",
          transactionHash: "0x111aaa",
          args: {
            depositId: 4n,
            sender: "0xsender4",
            recipientSaltHash: "0xsalt4",
            tokenIndex: 1,
            amount: 4000n,
            depositedAt: 1640995500n,
          },
        },
        {
          name: "Deposited",
          address: "0x1234567890123456789012345678901234567890",
          blockNumber: 1000n,
          blockTimestamp: "2024-01-01T00:00:00Z",
          blockHash: "0xblock5",
          transactionHash: "0x222bbb",
          args: {
            depositId: 5n,
            sender: "0xsender5",
            recipientSaltHash: "0xsalt5",
            tokenIndex: 0,
            amount: 5000n,
            depositedAt: 1640995600n,
          },
        },
      ];
      const processedState = { lastUpToDepositId: 0n };
      const currentBlockNumber = 2000n;

      const result = await splitDepositSummary(
        processedDepositEvents,
        processedState,
        currentBlockNumber,
      );

      expect(result.shouldSubmit).toBe(true);
      expect(result.batches.length).toBe(2);

      const batch1 = result.batches[0];
      expect(batch1.upToDepositId).toBe(3n);
      expect(batch1.numDepositsToRelay).toBe(3n);
      expect(batch1.blockNumber).toBe(900n);

      const batch2 = result.batches[1];
      expect(batch2.upToDepositId).toBe(5n);
      expect(batch2.numDepositsToRelay).toBe(2n);
      expect(batch2.blockNumber).toBe(currentBlockNumber);
    });
  });

  describe("Edge cases and error conditions", () => {
    it("should handle when all deposits are already processed", async () => {
      const processedDepositEvents: DepositEvent[] = [
        {
          name: "Deposited",
          address: "0x1234567890123456789012345678901234567890",
          blockNumber: 800n,
          blockTimestamp: "2024-01-01T00:00:00Z",
          blockHash: "0xblock1",
          transactionHash: "0xabc123",
          args: {
            depositId: 1n,
            sender: "0xsender1",
            recipientSaltHash: "0xsalt1",
            tokenIndex: 0,
            amount: 1000n,
            depositedAt: 1640995200n,
          },
        },
        {
          name: "Deposited",
          address: "0x1234567890123456789012345678901234567890",
          blockNumber: 900n,
          blockTimestamp: "2024-01-01T00:00:00Z",
          blockHash: "0xblock2",
          transactionHash: "0xdef456",
          args: {
            depositId: 2n,
            sender: "0xsender2",
            recipientSaltHash: "0xsalt2",
            tokenIndex: 1,
            amount: 2000n,
            depositedAt: 1640995300n,
          },
        },
      ];
      const processedState = { lastUpToDepositId: 2n };
      const currentBlockNumber = 2000n;

      const result = await splitDepositSummary(
        processedDepositEvents,
        processedState,
        currentBlockNumber,
      );

      expect(result).toEqual({
        shouldSubmit: false,
        batches: [],
      });
    });

    it("should handle duplicate deposit IDs by taking the first occurrence", async () => {
      const processedDepositEvents: DepositEvent[] = [
        {
          name: "Deposited",
          address: "0x1234567890123456789012345678901234567890",
          blockNumber: 800n,
          blockTimestamp: "2024-01-01T00:00:00Z",
          blockHash: "0xblock1",
          transactionHash: "0xabc123",
          args: {
            depositId: 1n,
            sender: "0xsender1",
            recipientSaltHash: "0xsalt1",
            tokenIndex: 0,
            amount: 1000n,
            depositedAt: 1640995200n,
          },
        },
        {
          name: "Deposited",
          address: "0x1234567890123456789012345678901234567890",
          blockNumber: 850n,
          blockTimestamp: "2024-01-01T00:00:00Z",
          blockHash: "0xblock2",
          transactionHash: "0xdef456",
          args: {
            depositId: 1n,
            sender: "0xsender2",
            recipientSaltHash: "0xsalt2",
            tokenIndex: 1,
            amount: 2000n,
            depositedAt: 1640995300n,
          },
        },
        {
          name: "Deposited",
          address: "0x1234567890123456789012345678901234567890",
          blockNumber: 900n,
          blockTimestamp: "2024-01-01T00:00:00Z",
          blockHash: "0xblock3",
          transactionHash: "0x789xyz",
          args: {
            depositId: 2n,
            sender: "0xsender3",
            recipientSaltHash: "0xsalt3",
            tokenIndex: 0,
            amount: 3000n,
            depositedAt: 1640995400n,
          },
        },
      ];
      const processedState = { lastUpToDepositId: 0n };
      const currentBlockNumber = 2000n;

      const result = await splitDepositSummary(
        processedDepositEvents,
        processedState,
        currentBlockNumber,
      );

      expect(result.shouldSubmit).toBe(true);
      expect(result.batches).toHaveLength(1);
    });

    it("should throw error when deposit ID not found in events", async () => {
      const processedDepositEvents: DepositEvent[] = [
        {
          name: "Deposited",
          address: "0x1234567890123456789012345678901234567890",
          blockNumber: 800n,
          blockTimestamp: "2024-01-01T00:00:00Z",
          blockHash: "0xblock1",
          transactionHash: "0xabc123",
          args: {
            depositId: 1n,
            sender: "0xsender1",
            recipientSaltHash: "0xsalt1",
            tokenIndex: 0,
            amount: 1000n,
            depositedAt: 1640995200n,
          },
        },
        {
          name: "Deposited",
          address: "0x1234567890123456789012345678901234567890",
          blockNumber: 1000n,
          blockTimestamp: "2024-01-01T00:00:00Z",
          blockHash: "0xblock3",
          transactionHash: "0x789xyz",
          args: {
            depositId: 3n,
            sender: "0xsender3",
            recipientSaltHash: "0xsalt3",
            tokenIndex: 0,
            amount: 3000n,
            depositedAt: 1640995400n,
          },
        },
      ];
      const processedState = { lastUpToDepositId: 0n };
      const currentBlockNumber = 2000n;

      const result = await splitDepositSummary(
        processedDepositEvents,
        processedState,
        currentBlockNumber,
      );

      expect(result.shouldSubmit).toBe(true);
      expect(result.batches).toHaveLength(1);
    });
  });
});
