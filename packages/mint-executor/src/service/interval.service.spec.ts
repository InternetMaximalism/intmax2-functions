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

    it("should return true when enough time has passed since last mint (more than 4 weeks)", () => {
      // Create a date 5 weeks ago at midnight
      const fiveWeeksAgo = new Date();
      fiveWeeksAgo.setDate(fiveWeeksAgo.getDate() - 5 * 7); // 5 weeks = 35 days
      fiveWeeksAgo.setHours(0, 0, 0, 0);

      const now = Date.now();

      const mockMintEvent: MintEventData = {
        id: "test-id",
        type: "mint",
        blockNumber: 12345,
        blockTimestamp: 1640995200,
        transactionHash: "0x123",
        createdAt: Timestamp.fromMillis(fiveWeeksAgo.getTime()),
        updatedAt: Timestamp.fromMillis(fiveWeeksAgo.getTime()),
      };

      const result = shouldExecuteMint(now, mockMintEvent);
      expect(result).toBe(true);
    });

    it("should return false when not enough time has passed since last mint (less than 4 weeks)", () => {
      // Create a date 2 weeks ago at midnight
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 2 * 7); // 2 weeks = 14 days
      twoWeeksAgo.setHours(0, 0, 0, 0);

      const now = Date.now();

      const mockMintEvent: MintEventData = {
        id: "test-id",
        type: "mint",
        blockNumber: 12345,
        blockTimestamp: 1640995200,
        transactionHash: "0x123",
        createdAt: Timestamp.fromMillis(twoWeeksAgo.getTime()),
        updatedAt: Timestamp.fromMillis(twoWeeksAgo.getTime()),
      };

      const result = shouldExecuteMint(now, mockMintEvent);
      expect(result).toBe(false);
    });

    it("should return true when exactly 4 weeks have passed since last mint", () => {
      // Create a date exactly 4 weeks ago at midnight
      const fourWeeksAgo = new Date();
      fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 4 * 7); // 4 weeks = 28 days
      fourWeeksAgo.setHours(0, 0, 0, 0);

      // Set now to be exactly 4 weeks later at midnight
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const mockMintEvent: MintEventData = {
        id: "test-id",
        type: "mint",
        blockNumber: 12345,
        blockTimestamp: 1640995200,
        transactionHash: "0x123",
        createdAt: Timestamp.fromMillis(fourWeeksAgo.getTime()),
        updatedAt: Timestamp.fromMillis(fourWeeksAgo.getTime()),
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

    it("should return true when enough time has passed since last transfer (more than 1 week)", () => {
      // Create a date 2 weeks ago at midnight
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 2 * 7); // 2 weeks = 14 days
      twoWeeksAgo.setHours(0, 0, 0, 0);

      const now = Date.now();

      const mockTransferEvent: MintEventData = {
        id: "test-id",
        type: "transferToLiquidity",
        blockNumber: 12345,
        blockTimestamp: 1640995200,
        transactionHash: "0x123",
        createdAt: Timestamp.fromMillis(twoWeeksAgo.getTime()),
        updatedAt: Timestamp.fromMillis(twoWeeksAgo.getTime()),
      };

      const result = shouldExecuteTransfer(now, mockTransferEvent);
      expect(result).toBe(true);
    });

    it("should return false when not enough time has passed since last transfer (less than 1 week)", () => {
      // Create a transfer event from 3 days ago
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      threeDaysAgo.setHours(8, 0, 0, 0);

      const now = Date.now();

      const mockTransferEvent: MintEventData = {
        id: "test-id",
        type: "transferToLiquidity",
        blockNumber: 12345,
        blockTimestamp: 1640995200,
        transactionHash: "0x123",
        createdAt: Timestamp.fromMillis(threeDaysAgo.getTime()),
        updatedAt: Timestamp.fromMillis(threeDaysAgo.getTime()),
      };

      const result = shouldExecuteTransfer(now, mockTransferEvent);
      expect(result).toBe(false);
    });

    it("should return true when exactly 1 week has passed since last transfer", () => {
      // Create a date exactly 1 week ago at midnight
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7); // 1 week = 7 days
      oneWeekAgo.setHours(0, 0, 0, 0);

      // Set now to be exactly 1 week later at midnight
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const mockTransferEvent: MintEventData = {
        id: "test-id",
        type: "transferToLiquidity",
        blockNumber: 12345,
        blockTimestamp: 1640995200,
        transactionHash: "0x123",
        createdAt: Timestamp.fromMillis(oneWeekAgo.getTime()),
        updatedAt: Timestamp.fromMillis(oneWeekAgo.getTime()),
      };

      const result = shouldExecuteTransfer(now.getTime(), mockTransferEvent);
      expect(result).toBe(true);
    });

    it("should handle date normalization correctly for transfer", () => {
      // Create a transfer event from 8 days ago at different hour
      const eightDaysAgo = new Date();
      eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);
      eightDaysAgo.setHours(23, 59, 59, 999); // Almost midnight

      // Current time is today at early hour
      const now = new Date();
      now.setHours(0, 0, 0, 1); // Just after midnight

      const mockTransferEvent: MintEventData = {
        id: "test-id",
        type: "transferToLiquidity",
        blockNumber: 12345,
        blockTimestamp: 1640995200,
        transactionHash: "0x123",
        createdAt: Timestamp.fromMillis(eightDaysAgo.getTime()),
        updatedAt: Timestamp.fromMillis(eightDaysAgo.getTime()),
      };

      const result = shouldExecuteTransfer(now.getTime(), mockTransferEvent);
      expect(result).toBe(true); // More than 1 week has passed, so should execute
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
      const afterDST = new Date("2025-04-05T12:00:00Z"); // After DST starts (4 weeks later)

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
      const fourWeeksLater = new Date("2024-03-28T12:00:00Z"); // 4 weeks later

      const mockMintEvent: MintEventData = {
        id: "test-id",
        type: "mint",
        blockNumber: 12345,
        blockTimestamp: 1640995200,
        transactionHash: "0x123",
        createdAt: Timestamp.fromMillis(leapYearDate.getTime()),
        updatedAt: Timestamp.fromMillis(leapYearDate.getTime()),
      };

      const result = shouldExecuteMint(fourWeeksLater.getTime(), mockMintEvent);
      expect(result).toBe(true);
    });
  });
});
