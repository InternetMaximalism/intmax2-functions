import { encodeFunctionData } from "viem";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MAX_BATCH_SIZE } from "../constants";
import {
  extractValidDeposits,
  generateBatchedCalldata,
  generateDepositIds,
} from "./decode.service";

vi.mock("viem", async () => {
  const actual = await vi.importActual("viem");
  return {
    ...actual,
    prepareEncodeFunctionData: vi.fn().mockReturnValue({
      functionName: "processDeposits",
      args: undefined,
    }),
    encodeFunctionData: vi.fn().mockReturnValue("0x123456789"),
  };
});

describe("Deposit Processing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const MOCK_HASHES = [
    "0x0000000000000000000000000000000000000000000000000000000000000001",
    "0x0000000000000000000000000000000000000000000000000000000000000002",
    "0x0000000000000000000000000000000000000000000000000000000000000003",
    "0x0000000000000000000000000000000000000000000000000000000000000004",
  ];

  describe("generateBatchedCalldata", () => {
    it("should handle empty deposits", () => {
      const validDeposits = {
        depositIds: [],
        depositHashes: [],
      };

      const result = generateBatchedCalldata(validDeposits, MAX_BATCH_SIZE);

      expect(result).toHaveLength(0);
    });

    it("should batch deposits correctly according to MAX_BATCH_SIZE", () => {
      const validDeposits = {
        depositIds: [BigInt(1), BigInt(2), BigInt(3), BigInt(4)],
        depositHashes: MOCK_HASHES,
      };
      const result = generateBatchedCalldata(validDeposits, 2);

      expect(result).toHaveLength(2);
      expect(encodeFunctionData).toHaveBeenCalledTimes(2);

      expect(encodeFunctionData).toHaveBeenNthCalledWith(1, {
        functionName: "processDeposits",
        args: [BigInt(2), MOCK_HASHES.slice(0, 2)],
      });

      expect(encodeFunctionData).toHaveBeenNthCalledWith(2, {
        functionName: "processDeposits",
        args: [BigInt(4), MOCK_HASHES.slice(2, 4)],
      });
    });

    it("should handle deposits with rejected IDs", () => {
      const lastProcessedDepositId = BigInt(5);
      const depositHashes = MOCK_HASHES.slice(0, 3);
      const rejectedIds = [BigInt(3)];

      const validDeposits = extractValidDeposits(
        lastProcessedDepositId,
        depositHashes,
        rejectedIds,
      );

      const result = generateBatchedCalldata(validDeposits, 2);

      expect(result).toHaveLength(2);
      expect(validDeposits.depositIds).not.toContain(BigInt(3));

      expect(encodeFunctionData).toHaveBeenCalledTimes(2);
      expect(result.every((item) => typeof item.encodedCalldata === "string")).toBe(true);
    });

    it("should handle consecutive rejected IDs", () => {
      const lastProcessedDepositId = BigInt(6);
      const depositHashes = MOCK_HASHES;
      const rejectedIds = [BigInt(3), BigInt(4)];

      const validDeposits = extractValidDeposits(
        lastProcessedDepositId,
        depositHashes,
        rejectedIds,
      );
      const result = generateBatchedCalldata(validDeposits, 2);

      expect(validDeposits.depositIds).not.toContain(BigInt(3));
      expect(validDeposits.depositIds).not.toContain(BigInt(4));
      expect(result.every((item) => typeof item.encodedCalldata === "string")).toBe(true);
    });

    it("should handle all deposits being rejected", () => {
      const lastProcessedDepositId = BigInt(4);
      const depositHashes = [] as string[];
      const rejectedIds = [BigInt(3), BigInt(4)];

      const validDeposits = extractValidDeposits(
        lastProcessedDepositId,
        depositHashes,
        rejectedIds,
      );
      const result = generateBatchedCalldata(validDeposits, MAX_BATCH_SIZE);

      expect(validDeposits.depositIds).toHaveLength(0);
      expect(result).toHaveLength(0);
      expect(encodeFunctionData).not.toHaveBeenCalled();
    });

    it("should handle empty deposits", () => {
      const validDeposits = {
        depositIds: [],
        depositHashes: [],
      };

      const result = generateBatchedCalldata(validDeposits, MAX_BATCH_SIZE);

      expect(result).toHaveLength(0);
      expect(encodeFunctionData).not.toHaveBeenCalled();
    });

    it("should handle single valid deposit with multiple rejections", () => {
      const lastProcessedDepositId = BigInt(5);
      const depositHashes = MOCK_HASHES.slice(0, 3);
      const rejectedIds = [BigInt(3), BigInt(4)];

      const validDeposits = extractValidDeposits(
        lastProcessedDepositId,
        depositHashes,
        rejectedIds,
      );
      const result = generateBatchedCalldata(validDeposits, MAX_BATCH_SIZE);

      expect(validDeposits.depositIds).toHaveLength(3);
      expect(result).toHaveLength(1);
      expect(encodeFunctionData).toHaveBeenCalledTimes(1);
    });
  });

  describe("extractValidDeposits", () => {
    it("should filter out rejected deposits correctly", () => {
      const lastProcessedDepositId = BigInt(5);
      const depositHashes = ["0x1111", "0x2222", "0x3333"];
      const rejectedIds = [BigInt(3)];

      const result = extractValidDeposits(lastProcessedDepositId, depositHashes, rejectedIds);

      expect(result.depositIds).toHaveLength(3);
      expect(result.depositHashes).toHaveLength(3);
      expect(result.depositIds.includes(BigInt(3))).toBe(false);
    });

    it("should handle case with no rejected deposits", () => {
      const lastProcessedDepositId = BigInt(3);
      const depositHashes = ["0x1111", "0x2222", "0x3333"];
      const rejectedIds: bigint[] = [];

      const result = extractValidDeposits(lastProcessedDepositId, depositHashes, rejectedIds);

      expect(result.depositIds).toHaveLength(depositHashes.length);
      expect(result.depositHashes).toEqual(depositHashes);
    });
  });

  describe("generateDepositIds", () => {
    it("should generate correct sequence of deposit IDs", () => {
      const startId = BigInt(1);
      const endId = BigInt(5);

      const result = generateDepositIds(startId, endId);

      expect(result).toEqual([BigInt(2), BigInt(3), BigInt(4), BigInt(5)]);
    });

    it("should throw error when startId is greater than endId", () => {
      const startId = BigInt(5);
      const endId = BigInt(1);

      expect(() => generateDepositIds(startId, endId)).toThrow(
        "startId must be less than or equal to endId",
      );
    });

    it("should throw error for non-BigInt inputs", () => {
      const startId = 1;
      const endId = BigInt(5);

      expect(() => generateDepositIds(startId as unknown as bigint, endId)).toThrow(
        "Inputs must be BigInt",
      );
    });
  });
});
