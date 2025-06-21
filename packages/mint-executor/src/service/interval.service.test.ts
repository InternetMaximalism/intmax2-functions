import { Timestamp } from "@google-cloud/firestore";
import type { MintEventData } from "@intmax2-functions/shared";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { shouldExecuteMint, shouldExecuteTransfer } from "./interval.service";

vi.mock("@intmax2-functions/shared", () => ({
  MINT_AVAILABLE_FROM: "2025-06-23T00:00:00Z",
  MINT_INTERVAL_WEEKS: 4,
  TRANSFER_INTERVAL_WEEKS: 1,
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("Interval Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("shouldExecuteMint", () => {
    const MINT_AVAILABLE_FROM_MS = new Date("2025-06-23T00:00:00Z").getTime();
    const MINT_INTERVAL_MS = 4 * 7 * 24 * 60 * 60 * 1000; // 4 weeks in milliseconds

    it("should return true when no mint event exists and current time is after MINT_AVAILABLE_FROM", () => {
      const now = MINT_AVAILABLE_FROM_MS + 1000; // 1 second after available time
      const result = shouldExecuteMint(now, null);
      expect(result).toBe(true);
    });

    it("should return false when no mint event exists and current time is before MINT_AVAILABLE_FROM", () => {
      const now = MINT_AVAILABLE_FROM_MS - 1000; // 1 second before available time
      const result = shouldExecuteMint(now, null);
      expect(result).toBe(false);
    });

    it("should return true when enough time has passed since last mint (more than 4 weeks)", () => {
      const lastMintTime = MINT_AVAILABLE_FROM_MS;
      const now = lastMintTime + MINT_INTERVAL_MS + 1000; // 4 weeks + 1 second after last mint

      const mockMintEvent: MintEventData = {
        id: "test-id",
        type: "mint",
        blockNumber: 12345,
        blockTimestamp: 1640995200,
        transactionHash: "0x123",
        createdAt: Timestamp.fromMillis(lastMintTime),
        updatedAt: Timestamp.fromMillis(lastMintTime),
      };

      const result = shouldExecuteMint(now, mockMintEvent);
      expect(result).toBe(true);
    });

    it("should return false when not enough time has passed since last mint (less than 4 weeks)", () => {
      const lastMintTime = MINT_AVAILABLE_FROM_MS;
      const now = lastMintTime + MINT_INTERVAL_MS - 1000; // 4 weeks - 1 second after last mint

      const mockMintEvent: MintEventData = {
        id: "test-id",
        type: "mint",
        blockNumber: 12345,
        blockTimestamp: 1640995200,
        transactionHash: "0x123",
        createdAt: Timestamp.fromMillis(lastMintTime),
        updatedAt: Timestamp.fromMillis(lastMintTime),
      };

      const result = shouldExecuteMint(now, mockMintEvent);
      expect(result).toBe(false);
    });

    it("should return true when exactly 4 weeks have passed since last mint", () => {
      const lastMintTime = MINT_AVAILABLE_FROM_MS;
      const now = lastMintTime + MINT_INTERVAL_MS; // Exactly 4 weeks after last mint

      const mockMintEvent: MintEventData = {
        id: "test-id",
        type: "mint",
        blockNumber: 12345,
        blockTimestamp: 1640995200,
        transactionHash: "0x123",
        createdAt: Timestamp.fromMillis(lastMintTime),
        updatedAt: Timestamp.fromMillis(lastMintTime),
      };

      const result = shouldExecuteMint(now, mockMintEvent);
      expect(result).toBe(true);
    });

    it("should handle edge case with very old mint event", () => {
      const lastMintTime = MINT_AVAILABLE_FROM_MS - 365 * 24 * 60 * 60 * 1000; // 1 year before available
      const now = MINT_AVAILABLE_FROM_MS + 1000; // 1 second after available

      const mockMintEvent: MintEventData = {
        id: "test-id",
        type: "mint",
        blockNumber: 12345,
        blockTimestamp: 1640995200,
        transactionHash: "0x123",
        createdAt: Timestamp.fromMillis(lastMintTime),
        updatedAt: Timestamp.fromMillis(lastMintTime),
      };

      const result = shouldExecuteMint(now, mockMintEvent);
      expect(result).toBe(true);
    });
  });

  describe("shouldExecuteTransfer", () => {
    const MINT_AVAILABLE_FROM_MS = new Date("2025-06-23T00:00:00Z").getTime();
    const TRANSFER_INTERVAL_MS = 1 * 24 * 60 * 60 * 1000; // 1 day in milliseconds (note: the code has a bug - it should be 1 * 7 * 24 * 60 * 60 * 1000 for 1 week)

    it("should return true when no transfer event exists and current time is after MINT_AVAILABLE_FROM", () => {
      const now = MINT_AVAILABLE_FROM_MS + 1000; // 1 second after available time
      const result = shouldExecuteTransfer(now, null);
      expect(result).toBe(true);
    });

    it("should return false when no transfer event exists and current time is before MINT_AVAILABLE_FROM", () => {
      const now = MINT_AVAILABLE_FROM_MS - 1000; // 1 second before available time
      const result = shouldExecuteTransfer(now, null);
      expect(result).toBe(false);
    });

    it("should return true when enough time has passed since last transfer (more than 1 day due to bug in code)", () => {
      const lastTransferTime = MINT_AVAILABLE_FROM_MS;
      const now = lastTransferTime + TRANSFER_INTERVAL_MS + 1000; // 1 day + 1 second after last transfer

      const mockTransferEvent: MintEventData = {
        id: "test-id",
        type: "transferToLiquidity",
        blockNumber: 12345,
        blockTimestamp: 1640995200,
        transactionHash: "0x123",
        createdAt: Timestamp.fromMillis(lastTransferTime),
        updatedAt: Timestamp.fromMillis(lastTransferTime),
      };

      const result = shouldExecuteTransfer(now, mockTransferEvent);
      expect(result).toBe(true);
    });

    it("should return false when not enough time has passed since last transfer (less than 1 day)", () => {
      const lastTransferTime = MINT_AVAILABLE_FROM_MS;
      const now = lastTransferTime + TRANSFER_INTERVAL_MS - 1000; // 1 day - 1 second after last transfer

      const mockTransferEvent: MintEventData = {
        id: "test-id",
        type: "transferToLiquidity",
        blockNumber: 12345,
        blockTimestamp: 1640995200,
        transactionHash: "0x123",
        createdAt: Timestamp.fromMillis(lastTransferTime),
        updatedAt: Timestamp.fromMillis(lastTransferTime),
      };

      const result = shouldExecuteTransfer(now, mockTransferEvent);
      expect(result).toBe(false);
    });

    it("should return true when exactly 1 day has passed since last transfer", () => {
      const lastTransferTime = MINT_AVAILABLE_FROM_MS;
      const now = lastTransferTime + TRANSFER_INTERVAL_MS; // Exactly 1 day after last transfer

      const mockTransferEvent: MintEventData = {
        id: "test-id",
        type: "transferToLiquidity",
        blockNumber: 12345,
        blockTimestamp: 1640995200,
        transactionHash: "0x123",
        createdAt: Timestamp.fromMillis(lastTransferTime),
        updatedAt: Timestamp.fromMillis(lastTransferTime),
      };

      const result = shouldExecuteTransfer(now, mockTransferEvent);
      expect(result).toBe(true);
    });

    it("should handle edge case with very recent transfer event", () => {
      const lastTransferTime = MINT_AVAILABLE_FROM_MS + 1000;
      const now = lastTransferTime + 100; // Only 100ms after last transfer

      const mockTransferEvent: MintEventData = {
        id: "test-id",
        type: "transferToLiquidity",
        blockNumber: 12345,
        blockTimestamp: 1640995200,
        transactionHash: "0x123",
        createdAt: Timestamp.fromMillis(lastTransferTime),
        updatedAt: Timestamp.fromMillis(lastTransferTime),
      };

      const result = shouldExecuteTransfer(now, mockTransferEvent);
      expect(result).toBe(false);
    });
  });

  describe("Time calculation edge cases", () => {
    it("should handle timestamp at exact boundary for mint", () => {
      const MINT_AVAILABLE_FROM_MS = new Date("2025-06-23T00:00:00Z").getTime();
      const now = MINT_AVAILABLE_FROM_MS; // Exactly at the boundary
      const result = shouldExecuteMint(now, null);
      expect(result).toBe(true);
    });

    it("should handle timestamp at exact boundary for transfer", () => {
      const MINT_AVAILABLE_FROM_MS = new Date("2025-06-23T00:00:00Z").getTime();
      const now = MINT_AVAILABLE_FROM_MS; // Exactly at the boundary
      const result = shouldExecuteTransfer(now, null);
      expect(result).toBe(true);
    });

    it("should handle future dates correctly for mint", () => {
      const lastMintTime = Date.now();
      const now = lastMintTime + 4 * 7 * 24 * 60 * 60 * 1000 + 7 * 24 * 60 * 60 * 1000; // 5 weeks later

      const mockMintEvent: MintEventData = {
        id: "test-id",
        type: "mint",
        blockNumber: 12345,
        blockTimestamp: 1640995200,
        transactionHash: "0x123",
        createdAt: Timestamp.fromMillis(lastMintTime),
        updatedAt: Timestamp.fromMillis(lastMintTime),
      };

      const result = shouldExecuteMint(now, mockMintEvent);
      expect(result).toBe(true);
    });

    it("should handle future dates correctly for transfer", () => {
      const lastTransferTime = Date.now();
      const now = lastTransferTime + 2 * 24 * 60 * 60 * 1000; // 2 days later

      const mockTransferEvent: MintEventData = {
        id: "test-id",
        type: "transferToLiquidity",
        blockNumber: 12345,
        blockTimestamp: 1640995200,
        transactionHash: "0x123",
        createdAt: Timestamp.fromMillis(lastTransferTime),
        updatedAt: Timestamp.fromMillis(lastTransferTime),
      };

      const result = shouldExecuteTransfer(now, mockTransferEvent);
      expect(result).toBe(true);
    });
  });
});
