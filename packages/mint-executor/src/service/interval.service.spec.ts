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

    it("should return true when enough time has passed since last mint (more than 4 days)", () => {
      // Create a date 5 days ago at midnight
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
      fiveDaysAgo.setHours(0, 0, 0, 0);

      const now = Date.now();

      const mockMintEvent: MintEventData = {
        id: "test-id",
        type: "mint",
        blockNumber: 12345,
        blockTimestamp: 1640995200,
        transactionHash: "0x123",
        createdAt: Timestamp.fromMillis(fiveDaysAgo.getTime()),
        updatedAt: Timestamp.fromMillis(fiveDaysAgo.getTime()),
      };

      const result = shouldExecuteMint(now, mockMintEvent);
      expect(result).toBe(true);
    });

    it("should return false when not enough time has passed since last mint (less than 4 days)", () => {
      // Create a date 2 days ago at midnight
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      twoDaysAgo.setHours(0, 0, 0, 0);

      const now = Date.now();

      const mockMintEvent: MintEventData = {
        id: "test-id",
        type: "mint",
        blockNumber: 12345,
        blockTimestamp: 1640995200,
        transactionHash: "0x123",
        createdAt: Timestamp.fromMillis(twoDaysAgo.getTime()),
        updatedAt: Timestamp.fromMillis(twoDaysAgo.getTime()),
      };

      const result = shouldExecuteMint(now, mockMintEvent);
      expect(result).toBe(false);
    });

    it("should return true when exactly 4 days have passed since last mint", () => {
      // Create a date exactly 4 days ago at midnight
      const fourDaysAgo = new Date();
      fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
      fourDaysAgo.setHours(0, 0, 0, 0);

      // Set now to be exactly 4 days later at midnight
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const mockMintEvent: MintEventData = {
        id: "test-id",
        type: "mint",
        blockNumber: 12345,
        blockTimestamp: 1640995200,
        transactionHash: "0x123",
        createdAt: Timestamp.fromMillis(fourDaysAgo.getTime()),
        updatedAt: Timestamp.fromMillis(fourDaysAgo.getTime()),
      };

      const result = shouldExecuteMint(now.getTime(), mockMintEvent);
      expect(result).toBe(true);
    });

    it("should handle date normalization correctly (same day but different hours)", () => {
      // Create a mint event from earlier today
      const today = new Date();
      const earlierToday = new Date(today);
      earlierToday.setHours(8, 30, 45, 123); // 8:30:45.123 AM

      // Current time is later the same day
      const now = new Date(today);
      now.setHours(15, 45, 30, 789); // 3:45:30.789 PM

      const mockMintEvent: MintEventData = {
        id: "test-id",
        type: "mint",
        blockNumber: 12345,
        blockTimestamp: 1640995200,
        transactionHash: "0x123",
        createdAt: Timestamp.fromMillis(earlierToday.getTime()),
        updatedAt: Timestamp.fromMillis(earlierToday.getTime()),
      };

      const result = shouldExecuteMint(now.getTime(), mockMintEvent);
      expect(result).toBe(false); // Same day, so should not execute
    });

    it("should handle edge case with very old mint event", () => {
      // Create a mint event from 1 year ago
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      oneYearAgo.setHours(0, 0, 0, 0);

      const now = Date.now();

      const mockMintEvent: MintEventData = {
        id: "test-id",
        type: "mint",
        blockNumber: 12345,
        blockTimestamp: 1640995200,
        transactionHash: "0x123",
        createdAt: Timestamp.fromMillis(oneYearAgo.getTime()),
        updatedAt: Timestamp.fromMillis(oneYearAgo.getTime()),
      };

      const result = shouldExecuteMint(now, mockMintEvent);
      expect(result).toBe(true);
    });

    it("should handle timestamp at exact boundary", () => {
      const MINT_AVAILABLE_FROM_MS = new Date("2025-06-23T00:00:00Z").getTime();
      const now = MINT_AVAILABLE_FROM_MS; // Exactly at the boundary
      const result = shouldExecuteMint(now, null);
      expect(result).toBe(true);
    });
  });

  describe("shouldExecuteTransfer", () => {
    const MINT_AVAILABLE_FROM_MS = new Date("2025-06-23T00:00:00Z").getTime();

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

    it("should return true when enough time has passed since last transfer (more than 1 day)", () => {
      // Create a date 2 days ago at midnight
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      twoDaysAgo.setHours(0, 0, 0, 0);

      const now = Date.now();

      const mockTransferEvent: MintEventData = {
        id: "test-id",
        type: "transferToLiquidity",
        blockNumber: 12345,
        blockTimestamp: 1640995200,
        transactionHash: "0x123",
        createdAt: Timestamp.fromMillis(twoDaysAgo.getTime()),
        updatedAt: Timestamp.fromMillis(twoDaysAgo.getTime()),
      };

      const result = shouldExecuteTransfer(now, mockTransferEvent);
      expect(result).toBe(true);
    });

    it("should return false when not enough time has passed since last transfer (same day)", () => {
      // Create a transfer event from earlier today
      const today = new Date();
      const earlierToday = new Date(today);
      earlierToday.setHours(8, 0, 0, 0);

      const now = new Date(today);
      now.setHours(15, 0, 0, 0); // Later the same day

      const mockTransferEvent: MintEventData = {
        id: "test-id",
        type: "transferToLiquidity",
        blockNumber: 12345,
        blockTimestamp: 1640995200,
        transactionHash: "0x123",
        createdAt: Timestamp.fromMillis(earlierToday.getTime()),
        updatedAt: Timestamp.fromMillis(earlierToday.getTime()),
      };

      const result = shouldExecuteTransfer(now.getTime(), mockTransferEvent);
      expect(result).toBe(false);
    });

    it("should return true when exactly 1 day has passed since last transfer", () => {
      // Create a date exactly 1 day ago at midnight
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      oneDayAgo.setHours(0, 0, 0, 0);

      // Set now to be exactly 1 day later at midnight
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const mockTransferEvent: MintEventData = {
        id: "test-id",
        type: "transferToLiquidity",
        blockNumber: 12345,
        blockTimestamp: 1640995200,
        transactionHash: "0x123",
        createdAt: Timestamp.fromMillis(oneDayAgo.getTime()),
        updatedAt: Timestamp.fromMillis(oneDayAgo.getTime()),
      };

      const result = shouldExecuteTransfer(now.getTime(), mockTransferEvent);
      expect(result).toBe(true);
    });

    it("should handle date normalization correctly for transfer", () => {
      // Create a transfer event from yesterday at different hour
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(23, 59, 59, 999); // Almost midnight

      // Current time is today at early hour
      const now = new Date();
      now.setHours(0, 0, 0, 1); // Just after midnight

      const mockTransferEvent: MintEventData = {
        id: "test-id",
        type: "transferToLiquidity",
        blockNumber: 12345,
        blockTimestamp: 1640995200,
        transactionHash: "0x123",
        createdAt: Timestamp.fromMillis(yesterday.getTime()),
        updatedAt: Timestamp.fromMillis(yesterday.getTime()),
      };

      const result = shouldExecuteTransfer(now.getTime(), mockTransferEvent);
      expect(result).toBe(true); // Different days, so should execute
    });

    it("should handle edge case with very recent transfer event", () => {
      // Create a transfer event from just 1 hour ago
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      const now = Date.now();

      const mockTransferEvent: MintEventData = {
        id: "test-id",
        type: "transferToLiquidity",
        blockNumber: 12345,
        blockTimestamp: 1640995200,
        transactionHash: "0x123",
        createdAt: Timestamp.fromMillis(oneHourAgo.getTime()),
        updatedAt: Timestamp.fromMillis(oneHourAgo.getTime()),
      };

      const result = shouldExecuteTransfer(now, mockTransferEvent);
      expect(result).toBe(false); // Same day, so should not execute
    });

    it("should handle timestamp at exact boundary for transfer", () => {
      const MINT_AVAILABLE_FROM_MS = new Date("2025-06-23T00:00:00Z").getTime();
      const now = MINT_AVAILABLE_FROM_MS; // Exactly at the boundary
      const result = shouldExecuteTransfer(now, null);
      expect(result).toBe(true);
    });
  });

  describe("Time calculation edge cases", () => {
    it("should handle daylight saving time transitions for mint", () => {
      // Test around DST transition (assuming US Eastern Time)
      const beforeDST = new Date("2025-03-08T12:00:00Z"); // Before DST starts
      const afterDST = new Date("2025-03-15T12:00:00Z"); // After DST starts (1 week later)

      const mockMintEvent: MintEventData = {
        id: "test-id",
        type: "mint",
        blockNumber: 12345,
        blockTimestamp: 1640995200,
        transactionHash: "0x123",
        createdAt: Timestamp.fromMillis(beforeDST.getTime()),
        updatedAt: Timestamp.fromMillis(beforeDST.getTime()),
      };

      const result = shouldExecuteMint(afterDST.getTime(), mockMintEvent);
      expect(result).toBe(true); // Should work correctly despite DST
    });

    it("should handle leap year dates correctly", () => {
      // Test with leap year date
      const leapYearDate = new Date("2024-02-29T12:00:00Z"); // Leap year
      const oneWeekLater = new Date("2024-03-07T12:00:00Z");

      const mockMintEvent: MintEventData = {
        id: "test-id",
        type: "mint",
        blockNumber: 12345,
        blockTimestamp: 1640995200,
        transactionHash: "0x123",
        createdAt: Timestamp.fromMillis(leapYearDate.getTime()),
        updatedAt: Timestamp.fromMillis(leapYearDate.getTime()),
      };

      const result = shouldExecuteMint(oneWeekLater.getTime(), mockMintEvent);
      expect(result).toBe(true);
    });
  });
});
